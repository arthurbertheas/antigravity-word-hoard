import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Word } from '@/types/word';
import { ImagierSettings, DEFAULT_IMAGIER_SETTINGS, getGridMax, getGridDimensions } from '@/types/imagier';
import { filterWordsWithImages } from '@/utils/imagier-utils';
import { ImagierTopbar } from './ImagierTopbar';
import { ImagierPreview } from './ImagierPreview';
import { ImagierPanel } from './ImagierPanel';
import { ImagierCard } from './ImagierCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './imagier-print.css';

interface ImagierProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
}

export function Imagier({ words, isOpen, onClose }: ImagierProps) {
  if (!isOpen) return null;
  return <ImagierContent words={words} onClose={onClose} />;
}

// No-op handlers for print cards (no drag in print)
const noop = () => {};
const noopDrag = (_e: React.DragEvent, _i: number) => {};

function ImagierContent({ words, onClose }: { words: Word[]; onClose: () => void }) {
  const [settings, setSettings] = useState<ImagierSettings>(DEFAULT_IMAGIER_SETTINGS);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const { withImages, removedCount } = useMemo(
    () => filterWordsWithImages(words),
    [words]
  );

  const [orderedWords, setOrderedWords] = useState<Word[]>(withImages);

  // Pagination
  const max = getGridMax(settings.grid);
  const totalPages = Math.max(1, Math.ceil(orderedWords.length / max));

  // Reset page when grid changes
  useEffect(() => {
    setCurrentPage(0);
  }, [settings.grid]);

  // Clamp current page if words are removed
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const updateSetting = useCallback(<K extends keyof ImagierSettings>(
    key: K,
    value: ImagierSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedWords(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handlePrint = useCallback(async () => {
    const container = document.querySelector('.imagier-print-container') as HTMLElement;
    if (!container || isPrinting) return;

    setIsPrinting(true);
    try {
      // Make container visible for html2canvas (still behind the z-100 overlay)
      container.style.cssText = 'position:absolute;left:0;top:0;opacity:1;pointer-events:none;z-index:-1;';

      // Force lazy images to load
      const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
      images.forEach(img => { img.loading = 'eager'; });
      await Promise.all(images.map(img =>
        img.complete ? Promise.resolve() : new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
      ));

      const pages = Array.from(container.querySelectorAll('.imagier-print-page')) as HTMLElement[];
      const isLandscape = settings.orientation === 'landscape';

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();

        const w = isLandscape ? 297 : 210;
        const h = isLandscape ? 210 : 297;
        pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      }

      // Restore hidden state
      container.style.cssText = '';

      // Download PDF
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      pdf.save(`Imagier phonétique - ${dd}-${mm}-${yy} - ${hh}h${min}.pdf`);
    } finally {
      setIsPrinting(false);
      // Ensure container is re-hidden even if an error occurred
      const c = document.querySelector('.imagier-print-container') as HTMLElement;
      if (c) c.style.cssText = '';
    }
  }, [settings.orientation, isPrinting]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Build print pages — exact same markup as ImagierPreview for pixel-perfect output
  const { cols, rows } = getGridDimensions(settings.grid, settings.orientation);
  const isLandscape = settings.orientation === 'landscape';
  // A4 at 96 DPI — larger than screen preview for better PDF quality
  const pageW = isLandscape ? 1123 : 794;
  const pageH = isLandscape ? 794 : 1123;

  const printPages = [];
  for (let p = 0; p < totalPages; p++) {
    const start = p * max;
    const pageWords = orderedWords.slice(start, start + max);
    printPages.push(
      <div
        key={p}
        className="imagier-print-page bg-white flex flex-col overflow-hidden"
        style={{ width: pageW, height: pageH }}
      >
        <div className="flex-1 min-h-0 flex flex-col p-8">
          {/* Page header */}
          {settings.showHeader && (
            <div className="flex items-end justify-between pb-2.5 border-b-[2.5px] border-[#6C5CE7] mb-3">
              <div className="flex flex-col gap-0.5">
                {settings.title && (
                  <div className="font-sora text-lg font-extrabold text-[#1A1A2E] tracking-tight">
                    {settings.title}
                  </div>
                )}
                {settings.subtitle && (
                  <div className="text-[11px] text-[#9CA3AF] font-medium italic">
                    {settings.subtitle}
                  </div>
                )}
              </div>
              <div className="text-[11px] text-[#9CA3AF] font-medium">
                {pageWords.length} mots
              </div>
            </div>
          )}

          {/* Cards grid — identical to ImagierPreview */}
          <div
            className={`flex-1 min-h-0 grid
              ${settings.cuttingGuides ? 'gap-0' : settings.grid === '2x3' ? 'gap-3' : settings.grid === '4x4' ? 'gap-1.5' : settings.grid === '3x4' ? 'gap-2' : 'gap-2.5'}
            `}
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {pageWords.map((word, i) => (
              <ImagierCard
                key={word.uid || word.MOTS + i}
                word={word}
                settings={settings}
                index={i}
                onDragStart={noop}
                onDragOver={noopDrag}
                onDrop={noop}
                isDragging={false}
                isDragOver={false}
              />
            ))}
          </div>

          {/* Page footer — identical to ImagierPreview */}
          <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] flex-shrink-0">
            <span className="text-[9px] text-[#CBD5E1]">Imagier phonétique</span>
            <span className="text-[9px] text-[#CBD5E1]">
              <span className="inline-block w-1 h-1 rounded-full bg-[#A29BFE] mr-1 align-middle" />
              MaterielOrthophonie.fr
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#ECEDF2] flex flex-col imagier-overlay">
        <ImagierTopbar
          wordCount={orderedWords.length}
          onClose={onClose}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <ImagierPreview
              words={orderedWords}
              settings={settings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onReorder={handleReorder}
            />
          </div>
          <ImagierPanel
            settings={settings}
            updateSetting={updateSetting}
            words={orderedWords}
            removedCount={removedCount}
            onReorder={handleReorder}
            onPrint={handlePrint}
            isPrinting={isPrinting}
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(p => !p)}
          />
        </div>
      </div>

      {/* Print source — hidden portal, its innerHTML is grabbed by handlePrint */}
      {createPortal(
        <div className="imagier-print-container">{printPages}</div>,
        document.body
      )}
    </>
  );
}
