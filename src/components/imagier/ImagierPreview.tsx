import { useState, useCallback, useRef, useEffect } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, getGridDimensions, getParcoursCols } from '@/types/imagier';
import { ImagierCard } from './ImagierCard';
import { ChevronLeft, ChevronRight, Minus, Plus, Move } from 'lucide-react';

// A4 proportions at 72 DPI (scaled for screen)
const PAGE_W_PORTRAIT = 595;
const PAGE_H_PORTRAIT = 842;

const MM_TO_PT = 2.8346;

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

  // Auto-scale: fit page within available space
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

  // Cards on this page
  const max = settings.pageStyle === 'grid'
    ? getGridMax(settings.grid)
    : settings.parcoursPerPage;
  const start = currentPage * max;
  const visibleWords = words.slice(start, start + max);

  const marginPx = settings.margin * MM_TO_PT;
  const hGapPx = settings.cuttingGuides ? 0 : settings.hGap * MM_TO_PT;
  const vGapPx = settings.cuttingGuides ? 0 : settings.vGap * MM_TO_PT;

  // Estimated header/footer heights (pt)
  const HEADER_H = settings.showHeader ? 52 : 0;
  const FOOTER_H = 28;

  const usableW = pageW - 2 * marginPx;
  const usableH = pageH - 10 - 8 - HEADER_H - FOOTER_H;

  // Drag handlers
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

  const visualW = pageW * effectiveScale;
  const visualH = pageH * effectiveScale;

  // ── Grid layout ───────────────────────────────────────────────────────────
  function renderGrid() {
    const { cols, rows } = getGridDimensions(settings.grid, settings.orientation);
    return (
      <div
        className="flex-1 min-h-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          columnGap: hGapPx,
          rowGap: vGapPx,
          marginTop: marginPx,
          marginBottom: marginPx,
          marginLeft: marginPx,
          marginRight: marginPx,
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
    );
  }

  // ── Parcours S — boustrophedon snake with visible ribbon ──────────────────
  function renderParcoursS() {
    const n = visibleWords.length;
    const cols = getParcoursCols(settings.parcoursPerPage);
    const rows = Math.ceil(settings.parcoursPerPage / cols);
    const colGap = Math.max(hGapPx, 4);
    const rowGap = Math.max(vGapPx, 10); // enough gap so ribbon turns are visible
    const cardW = (usableW - (cols - 1) * colGap) / cols;
    const cardH = (usableH - (rows - 1) * rowGap) / rows;
    const ribbonW = cardH + rowGap;

    // Centre positions for the ribbon path (all slots, not just visible words)
    const allCenters = Array.from({ length: settings.parcoursPerPage }, (_, seq) => {
      const row = Math.floor(seq / cols);
      const posInRow = seq % cols;
      const col = row % 2 === 0 ? posInRow : cols - 1 - posInRow;
      return {
        cx: col * (cardW + colGap) + cardW / 2,
        cy: row * (cardH + rowGap) + cardH / 2,
      };
    });
    const polyPts = allCenters.map(p => `${p.cx},${p.cy}`).join(' ');

    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Ribbon SVG — under cards */}
        <svg
          style={{ position: 'absolute', inset: 0, width: usableW, height: usableH, overflow: 'visible', pointerEvents: 'none' }}
          viewBox={`0 0 ${usableW} ${usableH}`}
        >
          <polyline
            points={polyPts}
            stroke="#A29BFE"
            strokeWidth={ribbonW}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            opacity={0.22}
          />
        </svg>

        {/* Cards — absolute over ribbon */}
        {visibleWords.map((word, i) => {
          const row = Math.floor(i / cols);
          const posInRow = i % cols;
          const col = row % 2 === 0 ? posInRow : cols - 1 - posInRow;
          const x = col * (cardW + colGap);
          const y = row * (cardH + rowGap);

          return (
            <div key={word.uid || word.MOTS + i}
              style={{ position: 'absolute', left: x, top: y, width: cardW, height: cardH }}>
              <ParcoursOverlay number={start + i + 1} isFirst={i === 0} isLast={i === n - 1}>
                <ImagierCard
                  word={word} settings={settings} index={i}
                  onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                  isDragging={dragSrcIndex === start + i} isDragOver={dragOverIndex === start + i}
                />
              </ParcoursOverlay>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Circulaire ────────────────────────────────────────────────────────────
  function renderCirculaire() {
    const n = visibleWords.length;
    const cx = usableW / 2;
    const cy = usableH / 2;
    const R = Math.min(usableW, usableH) * 0.38;
    const cardSize = Math.min(R * 0.52, (2 * Math.PI * R) / Math.max(n, 1) * 0.82);

    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {visibleWords.map((word, i) => {
          const angle = (i / Math.max(n, 1)) * 2 * Math.PI - Math.PI / 2;
          const x = cx + R * Math.cos(angle) - cardSize / 2;
          const y = cy + R * Math.sin(angle) - cardSize / 2;

          return (
            <div key={word.uid || word.MOTS + i}
              style={{ position: 'absolute', left: x, top: y, width: cardSize, height: cardSize }}>
              <ParcoursOverlay number={start + i + 1} isFirst={i === 0} isLast={i === n - 1}>
                <ImagierCard
                  word={word} settings={settings} index={i}
                  onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                  isDragging={dragSrcIndex === start + i} isDragOver={dragOverIndex === start + i}
                />
              </ParcoursOverlay>
            </div>
          );
        })}
      </div>
    );
  }

  const isGrid = settings.pageStyle === 'grid';

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

          {/* Zoom bar */}
          <div className="sticky top-3 z-10 mb-3 print:hidden">
            <div className="inline-flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full border border-black/5 px-1.5 py-0.5 shadow-sm">
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2">
                A4 {settings.orientation === 'portrait' ? 'portrait' : 'paysage'}
              </span>
              <div className="w-px h-4 bg-[#E5E7EB]" />
              <button onClick={zoomOut} className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-bold text-[#6B7280] min-w-[36px] text-center tabular-nums">
                {Math.round(effectiveScale * 100)}%
              </span>
              <button onClick={zoomIn} className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#1A1A2E] transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* A4 Page */}
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

              <div className="flex-1 min-h-0 flex flex-col" style={{ paddingTop: 10, paddingBottom: 8 }}>
                {/* Page header */}
                {settings.showHeader && (
                  <div className="flex items-end justify-between pb-2.5 border-b-[2.5px] border-[#6C5CE7] mb-3" style={{ paddingLeft: 10, paddingRight: 10 }}>
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

                {/* Cards area */}
                {isGrid ? renderGrid() : (
                  <div className="flex-1 min-h-0 relative" style={{ marginLeft: marginPx, marginRight: marginPx }}>
                    {settings.pageStyle === 'parcours-s' && renderParcoursS()}
                    {settings.pageStyle === 'circulaire' && renderCirculaire()}
                  </div>
                )}

                {/* Page footer */}
                <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] flex-shrink-0" style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <span className="text-[9px] text-[#CBD5E1]">Imagier phonétique</span>
                  <span className="text-[9px] text-[#CBD5E1]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#A29BFE] mr-1 align-middle" />
                    MaterielOrthophonie.fr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {totalPages > 1 && <div className="h-6" />}
        </div>
      </div>

      {/* Page navigation */}
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

      {/* Drag hint */}
      <div className={`absolute ${totalPages > 1 ? 'bottom-14' : 'bottom-4'} left-1/2 -translate-x-1/2 z-10 pointer-events-none print:hidden transition-opacity duration-700 ${showDragHint ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-[11px] text-[#9CA3AF] bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-black/5 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 opacity-50" />
          Glissez les cartes pour réorganiser
        </div>
      </div>
    </div>
  );
}

// ── ParcoursOverlay ───────────────────────────────────────────────────────────

function ParcoursOverlay({
  number, isFirst, isLast, children,
}: {
  number: number;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      {/* Number badge */}
      <div style={{
        position: 'absolute', top: 3, left: 3,
        background: '#6C5CE7', color: 'white',
        borderRadius: '50%', width: 16, height: 16,
        fontSize: 8, fontWeight: 800, fontFamily: 'Sora, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2, lineHeight: 1,
        boxShadow: '0 1px 3px rgba(108,92,231,0.4)',
      }}>
        {number}
      </div>
      {isFirst && (
        <div style={{
          position: 'absolute', bottom: 3, left: 3,
          background: '#10B981', color: 'white',
          borderRadius: 3, fontSize: 6, fontWeight: 800,
          fontFamily: 'Sora, sans-serif', padding: '1px 3px',
          zIndex: 2, lineHeight: 1.2,
        }}>
          DÉPART
        </div>
      )}
      {isLast && (
        <div style={{
          position: 'absolute', bottom: 3, right: 3,
          background: '#F59E0B', color: 'white',
          borderRadius: 3, fontSize: 6, fontWeight: 800,
          fontFamily: 'Sora, sans-serif', padding: '1px 3px',
          zIndex: 2, lineHeight: 1.2,
        }}>
          ARRIVÉE !
        </div>
      )}
    </div>
  );
}
