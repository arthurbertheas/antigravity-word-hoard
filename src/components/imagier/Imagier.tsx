import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Word } from '@/types/word';
import { ImagierSettings, DEFAULT_IMAGIER_SETTINGS, getGridMax, getGridDimensions } from '@/types/imagier';
import { filterWordsWithImages } from '@/utils/imagier-utils';
import { ImagierTopbar } from './ImagierTopbar';
import { ImagierPreview } from './ImagierPreview';
import { ImagierPanel } from './ImagierPanel';
import { ImagierCard } from './ImagierCard';
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

  const handlePrint = useCallback(() => {
    const prevTitle = document.title;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    document.title = `Imagier phonétique - ${dd}/${mm}/${yy} - ${hh}h${min}`;
    window.print();
    document.title = prevTitle;
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Build print pages (all pages, not just current)
  const { cols, rows } = getGridDimensions(settings.grid, settings.orientation);
  const isLandscape = settings.orientation === 'landscape';

  const printPages = [];
  for (let p = 0; p < totalPages; p++) {
    const start = p * max;
    const pageWords = orderedWords.slice(start, start + max);
    printPages.push(
      <div
        key={p}
        className={`imagier-print-page ${p < totalPages - 1 ? 'imagier-print-page-break' : ''}`}
        style={{
          width: isLandscape ? '297mm' : '210mm',
          height: isLandscape ? '210mm' : '297mm',
          padding: '8mm',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          boxSizing: 'border-box' as const,
        }}
      >
        {/* Page header */}
        {settings.showHeader && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '2.5px solid #6C5CE7', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {settings.title && (
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.02em' }}>
                  {settings.title}
                </div>
              )}
              {settings.subtitle && (
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, fontStyle: 'italic' }}>
                  {settings.subtitle}
                </div>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
              {pageWords.length} mots
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: settings.cuttingGuides ? '0px' : settings.grid === '2x3' ? '12px' : settings.grid === '4x4' ? '6px' : settings.grid === '3x4' ? '8px' : '10px',
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

        {/* Page footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
          <span style={{ fontSize: '9px', color: '#CBD5E1' }}>Imagier phonétique</span>
          <span style={{ fontSize: '9px', color: '#CBD5E1' }}>MaterielOrthophonie.fr</span>
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
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(p => !p)}
          />
        </div>
      </div>

      {/* Print-only pages — rendered as portal to body so CSS can easily target them */}
      {createPortal(
        <div className="imagier-print-container">
          <style>{`@media print { @page { margin: 0; size: ${isLandscape ? 'A4 landscape' : 'A4'}; } }`}</style>
          {printPages}
        </div>,
        document.body
      )}
    </>
  );
}
