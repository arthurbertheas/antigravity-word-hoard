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
    const printContainer = document.querySelector('.imagier-print-container');
    if (!printContainer) return;

    // Extract ALL CSS rules as inline text (avoids external resource loading)
    // This is the only approach proven to produce page 2 in the print dialog.
    let allCSS = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          allCSS += rule.cssText + '\n';
        }
      } catch {
        // Cross-origin stylesheet — include as @import
        if (sheet.href) allCSS += `@import url("${sheet.href}");\n`;
      }
    }

    // PDF filename timestamp
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const pdfTitle = `Imagier phonétique - ${dd}/${mm}/${yy} - ${hh}h${min}`;
    const orientation = settings.orientation === 'landscape' ? 'A4 landscape' : 'A4';

    // Create iframe with real viewport (NOT 0×0 — browser can't compute page breaks otherwise)
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-200vw;top:0;width:100vw;height:100vh;border:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) { iframe.remove(); return; }

    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${pdfTitle}</title>
      <style>${allCSS}</style>
      <style>
        @page { margin: 0; size: ${orientation}; }
        html, body { margin: 0; padding: 0; }
        .imagier-print-page { page-break-after: always; page-break-inside: avoid; }
        .imagier-print-page:last-child { page-break-after: auto; }
        [draggable] { cursor: default !important; }
        .print\\:hidden { display: none !important; }
      </style>
    </head><body>${printContainer.innerHTML}</body></html>`);
    doc.close();

    // Wait for images to load, then print
    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      const fontsReady = doc.fonts?.ready ?? Promise.resolve();
      fontsReady.then(() => {
        win.focus();
        win.print();
        setTimeout(() => iframe.remove(), 500);
      });
    };

    // Count pending images
    let pending = 0;
    const onReady = () => { if (--pending <= 0) doPrint(); };

    doc.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        pending++;
        img.addEventListener('load', onReady);
        img.addEventListener('error', onReady);
      }
    });

    if (pending === 0) setTimeout(doPrint, 300);
    // Fallback timeout
    setTimeout(doPrint, 5000);
  }, [settings.orientation]);

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
        className="imagier-print-page"
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

      {/* Print source — hidden portal, its innerHTML is grabbed by handlePrint */}
      {createPortal(
        <div className="imagier-print-container">{printPages}</div>,
        document.body
      )}
    </>
  );
}
