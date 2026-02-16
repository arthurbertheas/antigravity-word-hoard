import { useState, useCallback, useRef, useEffect } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, getGridDimensions } from '@/types/imagier';
import { ImagierCard } from './ImagierCard';
import { ChevronLeft, ChevronRight, Minus, Plus, Move } from 'lucide-react';

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
  const [autoScale, setAutoScale] = useState(1);
  const [zoomOverride, setZoomOverride] = useState<number | null>(null);
  const [showDragHint, setShowDragHint] = useState(true);

  const effectiveScale = zoomOverride ?? autoScale;

  // Auto-dismiss drag hint after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDragHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const pageW = settings.orientation === 'portrait' ? PAGE_W_PORTRAIT : PAGE_H_PORTRAIT;
  const pageH = settings.orientation === 'portrait' ? PAGE_H_PORTRAIT : PAGE_W_PORTRAIT;

  // Auto-scale: fit page within available space (container is already flex-sized)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const hPad = 48;
      const vPad = 80;
      const maxScaleW = (el.clientWidth - hPad) / pageW;
      const maxScaleH = (el.clientHeight - vPad) / pageH;
      const s = Math.min(maxScaleW, maxScaleH, 1);
      setAutoScale(Math.max(0.3, s));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageW, pageH]);

  // Reset zoom override when orientation changes
  useEffect(() => { setZoomOverride(null); }, [settings.orientation]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomOverride(prev => {
      const current = prev ?? autoScale;
      return Math.min(Math.round((current + 0.1) * 10) / 10, 2);
    });
  }, [autoScale]);

  const zoomOut = useCallback(() => {
    setZoomOverride(prev => {
      const current = prev ?? autoScale;
      return Math.max(Math.round((current - 0.1) * 10) / 10, 0.2);
    });
  }, [autoScale]);

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

  // Visual dimensions (wrapper sized to actual visual output for proper scrolling)
  const visualW = pageW * effectiveScale;
  const visualH = pageH * effectiveScale;

  return (
    <div
      ref={containerRef}
      className="imagier-preview absolute inset-0 bg-[#ECEDF2]"
      style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(108,92,231,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(162,155,254,0.03) 0%, transparent 50%)',
      }}
    >
      {/* Scrollable content area */}
      <div className="absolute inset-0 overflow-auto" onDragEnd={handleDragEnd}>
        <div className="flex flex-col items-center min-h-full pt-3 pb-10">

          {/* Zoom bar — sticky at top */}
          <div className="sticky top-3 z-10 mb-3 print:hidden">
            <div className="inline-flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full border border-black/5 px-1.5 py-0.5 shadow-sm">
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2">
                A4 {settings.orientation === 'portrait' ? 'portrait' : 'paysage'}
              </span>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <button
                onClick={zoomOut}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-bold text-[#6B7280] min-w-[36px] text-center tabular-nums">
                {Math.round(effectiveScale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* A4 Page — wrapper sized to visual dimensions for proper scrolling */}
          <div className="flex-shrink-0" style={{ width: visualW, height: visualH }}>
            <div
              className="imagier-page bg-white rounded-sm flex flex-col relative overflow-hidden
                shadow-[0_1px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.05),0_16px_48px_rgba(0,0,0,0.04)]"
              style={{
                width: `${pageW}px`,
                height: `${pageH}px`,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
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

                {/* Cards grid */}
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
          </div>

          {/* Spacer so sticky bottom doesn't overlap page */}
          {totalPages > 1 && <div className="h-6" />}
        </div>
      </div>

      {/* Page navigation — sticky bottom pill, same style as zoom bar */}
      {totalPages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 print:hidden">
          <div className="inline-flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full border border-black/5 px-1.5 py-0.5 shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-bold text-[#6B7280] min-w-[56px] text-center tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Drag hint — floating overlay, auto-dismisses after 10s */}
      <div className={`absolute ${totalPages > 1 ? 'bottom-14' : 'bottom-4'} left-1/2 -translate-x-1/2 z-10 pointer-events-none print:hidden transition-opacity duration-700 ${showDragHint ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-[11px] text-[#9CA3AF] bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-black/5 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 opacity-50" />
          Glissez les cartes pour réorganiser
        </div>
      </div>
    </div>
  );
}
