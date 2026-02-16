import { useState, useCallback, useRef, useEffect } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, getGridDimensions } from '@/types/imagier';
import { ImagierCard } from './ImagierCard';
import { ChevronLeft, ChevronRight, ChevronsLeftRight, Move } from 'lucide-react';

// A4 proportions at 72 DPI (scaled for screen)
const PAGE_W_PORTRAIT = 595;
const PAGE_H_PORTRAIT = 842;

interface ImagierPreviewProps {
  words: Word[];
  settings: ImagierSettings;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReorder: (from: number, to: number) => void;
}

export function ImagierPreview({
  words, settings, currentPage, totalPages, onPageChange, onReorder,
}: ImagierPreviewProps) {
  const [dragSrcIndex, setDragSrcIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showDragHint, setShowDragHint] = useState(true);

  // Auto-dismiss drag hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDragHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const pageW = settings.orientation === 'portrait' ? PAGE_W_PORTRAIT : PAGE_H_PORTRAIT;
  const pageH = settings.orientation === 'portrait' ? PAGE_H_PORTRAIT : PAGE_W_PORTRAIT;

  // Auto-scale: page is centered on the full viewport width.
  // Scale so the page's right edge stays left of the overlay panel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const panelW = 440;
      const gap = 24;
      const vPad = 80;
      // Page center = container center (full width).
      // Right edge must stay left of panel:
      //   containerW/2 + pageW*s/2 <= containerW - panelW - gap
      //   s <= (containerW - 2*panelW - 2*gap) / pageW
      const maxScaleW = (el.clientWidth - 2 * panelW - 2 * gap) / pageW;
      const maxScaleH = (el.clientHeight - vPad) / pageH;
      const s = Math.min(maxScaleW, maxScaleH, 1);
      setScale(Math.max(0.3, s));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageW, pageH]);

  const max = getGridMax(settings.grid);
  const start = currentPage * max;
  const visibleWords = words.slice(start, start + max);
  const { cols, rows } = getGridDimensions(settings.grid, settings.orientation);

  const handleDragStart = useCallback((index: number) => {
    setDragSrcIndex(start + index);
  }, [start]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(start + index);
  }, [start]);

  const handleDrop = useCallback((index: number) => {
    if (dragSrcIndex !== null && dragSrcIndex !== start + index) {
      onReorder(dragSrcIndex, start + index);
    }
    setDragSrcIndex(null);
    setDragOverIndex(null);
  }, [dragSrcIndex, start, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragSrcIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="imagier-preview absolute inset-0 flex flex-col items-center justify-center bg-[#ECEDF2] overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(108,92,231,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(162,155,254,0.03) 0%, transparent 50%)',
      }}
      onDragEnd={handleDragEnd}
    >
      {/* Format badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#9CA3AF] bg-white/85 backdrop-blur-sm px-3 py-0.5 rounded-full border border-black/5 uppercase tracking-wider print:hidden z-10">
        Aperçu A4 {settings.orientation === 'portrait' ? 'portrait' : 'paysage'} · {Math.round(scale * 100)}%
      </div>

      {/* A4 Page — fixed dimensions, CSS-scaled to fit */}
      <div
        className="imagier-page bg-white rounded-sm flex flex-col relative overflow-hidden transition-[transform] duration-300 origin-center
          shadow-[0_1px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.05),0_16px_48px_rgba(0,0,0,0.04)]"
        style={{
          width: `${pageW}px`,
          height: `${pageH}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div className="absolute inset-0 border border-black/[0.06] rounded-sm pointer-events-none z-[1]" />

        <div className="flex-1 min-h-0 flex flex-col p-6">
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
                {visibleWords.length} mots
              </div>
            </div>
          )}

          {/* Cards grid — explicit rows, min-h-0 so flex shrinks properly */}
          <div
            className={`flex-1 min-h-0 grid
              ${settings.cuttingGuides ? 'gap-0' : settings.grid === '2x3' ? 'gap-3' : settings.grid === '4x4' ? 'gap-1.5' : settings.grid === '3x4' ? 'gap-2' : 'gap-2.5'}
            `}
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {visibleWords.map((word, i) => (
              <ImagierCard
                key={word.uid || word.MOTS + i}
                word={word}
                settings={settings}
                index={i}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={dragSrcIndex === start + i}
                isDragOver={dragOverIndex === start + i}
              />
            ))}
          </div>

          {/* Page footer */}
          <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] flex-shrink-0">
            <span className="text-[9px] text-[#CBD5E1]">Imagier phonétique</span>
            <span className="text-[9px] text-[#CBD5E1]">
              <span className="inline-block w-1 h-1 rounded-full bg-[#A29BFE] mr-1 align-middle" />
              MaterielOrthophonie.fr
            </span>
          </div>
        </div>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3.5 mt-1.5 print:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-8 h-8 rounded-lg border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-[#9CA3AF]">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="w-8 h-8 rounded-lg border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag hint — auto-dismisses after 4s */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-[#9CA3AF] bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-black/5 flex items-center gap-1.5 pointer-events-none print:hidden transition-opacity duration-700 ${showDragHint ? 'opacity-100' : 'opacity-0'}`}>
        <Move className="w-3.5 h-3.5 opacity-50" />
        Glissez les cartes pour réorganiser
      </div>
    </div>
  );
}
