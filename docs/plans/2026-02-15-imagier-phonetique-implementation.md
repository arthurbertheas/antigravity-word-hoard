# Imagier Phonétique — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-screen overlay print builder that generates A4 pages of image+word cards for speech therapists.

**Architecture:** Same overlay pattern as Tachistoscope — a root component `<Imagier>` rendered in `WordExplorer.tsx`, controlled by `isImagierOpen` state. All settings are local state (no context needed). The panel uses 3 tabs (Layout / Content / Order) controlling a live A4 preview. Print via `window.print()` + CSS `@media print`.

**Tech Stack:** React 18.3 + TypeScript + Tailwind CSS + Vite. Design system: violet `#6C5CE7`, Sora (titles), DM Sans (body). No new dependencies needed.

**Mockup reference:** `mockup-imagier.html` (v5 clean) — the HTML/CSS/JS to translate into React components.

---

## Task 1: Types & Utility — `ImagierSettings` and helpers

**Files:**
- Create: `src/types/imagier.ts`
- Create: `src/utils/imagier-utils.ts`

**Step 1: Create the types file**

```typescript
// src/types/imagier.ts

export type GridLayout = '2x3' | '3x3' | '3x4' | '4x4';
export type Orientation = 'portrait' | 'landscape';
export type CasseMode = 'lower' | 'upper' | 'capitalize';
export type FontSizeMode = 'small' | 'medium' | 'large';

export interface ImagierSettings {
  grid: GridLayout;
  orientation: Orientation;
  title: string;
  subtitle: string;
  cuttingGuides: boolean;
  showWord: boolean;
  showDeterminer: boolean;
  casse: CasseMode;
  fontSize: FontSizeMode;
  showSyllBreak: boolean;
  showPhoneme: boolean;
  showCategory: boolean;
  showSyllCount: boolean;
}

export const DEFAULT_IMAGIER_SETTINGS: ImagierSettings = {
  grid: '3x3',
  orientation: 'portrait',
  title: 'Mon imagier',
  subtitle: '',
  cuttingGuides: true,
  showWord: true,
  showDeterminer: true,
  casse: 'lower',
  fontSize: 'medium',
  showSyllBreak: true,
  showPhoneme: true,
  showCategory: false,
  showSyllCount: false,
};

export const GRID_OPTIONS: { value: GridLayout; cols: number; rows: number; label: string }[] = [
  { value: '2x3', cols: 2, rows: 3, label: '2×3' },
  { value: '3x3', cols: 3, rows: 3, label: '3×3' },
  { value: '3x4', cols: 3, rows: 4, label: '3×4' },
  { value: '4x4', cols: 4, rows: 4, label: '4×4' },
];

export function getGridMax(grid: GridLayout): number {
  const opt = GRID_OPTIONS.find(g => g.value === grid);
  return opt ? opt.cols * opt.rows : 9;
}
```

**Step 2: Create the utility file**

```typescript
// src/utils/imagier-utils.ts
import { Word, SyntCategory } from '@/types/word';
import { CasseMode } from '@/types/imagier';

/** Map SYNT category to French determiner */
const DETERMINERS: Partial<Record<SyntCategory, string>> = {
  NC: 'le',   // default masculine; we don't have gender data
  ADJ: '',
  VER: '',
  ADV: '',
  PRE: '',
};

export function getDeterminer(word: Word): string {
  return DETERMINERS[word.SYNT] || '';
}

export function applyCasse(text: string, mode: CasseMode): string {
  if (mode === 'upper') return text.toUpperCase();
  if (mode === 'capitalize') return text.charAt(0).toUpperCase() + text.slice(1);
  return text.toLowerCase();
}

/** Clean PHONEMES field into /.../ notation */
export function formatPhonemes(raw: string): string {
  if (!raw) return '';
  // Remove leading/trailing dots, replace internal dots with nothing
  const cleaned = raw.replace(/^\./, '').replace(/\.$/, '').replace(/\./g, '').replace(/#/g, '');
  return `/${cleaned}/`;
}

/** Filter words to only those with images */
export function filterWordsWithImages(words: Word[]): { withImages: Word[]; removedCount: number } {
  const withImages = words.filter(w => w["image associée"]?.trim());
  return { withImages, removedCount: words.length - withImages.length };
}
```

**Step 3: Commit**

```bash
git add src/types/imagier.ts src/utils/imagier-utils.ts
git commit -m "feat(imagier): add types and utility functions"
git push
```

---

## Task 2: Main `Imagier` component — overlay shell + state

**Files:**
- Create: `src/components/imagier/Imagier.tsx`

This is the root component, same pattern as `Tachistoscope.tsx`:
- Early return `null` if `!isOpen`
- Local state for `ImagierSettings` and `orderedWords` (mutable order for drag/drop)
- Filter out words without images on mount
- Render: topbar + main (preview area + side panel)

**Step 1: Create the component**

```typescript
// src/components/imagier/Imagier.tsx
import { useState, useMemo, useCallback } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, DEFAULT_IMAGIER_SETTINGS } from '@/types/imagier';
import { filterWordsWithImages } from '@/utils/imagier-utils';
import { ImagierTopbar } from './ImagierTopbar';
import { ImagierPreview } from './ImagierPreview';
import { ImagierPanel } from './ImagierPanel';

interface ImagierProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
}

export function Imagier({ words, isOpen, onClose }: ImagierProps) {
  if (!isOpen) return null;

  return <ImagierContent words={words} onClose={onClose} />;
}

function ImagierContent({ words, onClose }: { words: Word[]; onClose: () => void }) {
  const [settings, setSettings] = useState<ImagierSettings>(DEFAULT_IMAGIER_SETTINGS);

  const { withImages, removedCount } = useMemo(
    () => filterWordsWithImages(words),
    [words]
  );

  const [orderedWords, setOrderedWords] = useState<Word[]>(withImages);

  // Re-sync if words prop changes (e.g., user goes back and modifies selection)
  // This is a deliberate initial-only sync; reordering is local state.

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
    window.print();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#ECEDF2] flex flex-col">
      <ImagierTopbar
        wordCount={orderedWords.length}
        orientation={settings.orientation}
        onClose={onClose}
        onPrint={handlePrint}
      />
      <div className="flex-1 flex overflow-hidden">
        <ImagierPreview
          words={orderedWords}
          settings={settings}
        />
        <ImagierPanel
          settings={settings}
          updateSetting={updateSetting}
          words={orderedWords}
          removedCount={removedCount}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/imagier/Imagier.tsx
git commit -m "feat(imagier): add root Imagier overlay component"
git push
```

---

## Task 3: `ImagierTopbar` component

**Files:**
- Create: `src/components/imagier/ImagierTopbar.tsx`

**Step 1: Create the component**

Reference mockup topbar: close button (Retour), title, badge (N images), format badge, print/PDF buttons.

```typescript
// src/components/imagier/ImagierTopbar.tsx
import { ChevronLeft, Printer, Download } from 'lucide-react';
import { Orientation } from '@/types/imagier';

interface ImagierTopbarProps {
  wordCount: number;
  orientation: Orientation;
  onClose: () => void;
  onPrint: () => void;
}

export function ImagierTopbar({ wordCount, orientation, onClose, onPrint }: ImagierTopbarProps) {
  return (
    <div className="flex items-center justify-between px-5 bg-white border-b border-[#E5E7EB] h-14 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-[#E5E7EB] rounded-lg bg-white text-[13px] font-medium font-['DM_Sans'] text-[#6B7280] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Retour
        </button>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span className="font-sora text-sm font-bold text-[#1A1A2E]">Imagier phonétique</span>
        <span className="text-[11px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2.5 py-0.5 rounded-full">
          {wordCount} images
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[13px] font-semibold font-['DM_Sans'] border-[1.5px] border-[#E5E7EB] bg-transparent text-[#6B7280] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimer
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/imagier/ImagierTopbar.tsx
git commit -m "feat(imagier): add topbar component"
git push
```

---

## Task 4: `ImagierCard` — individual card component

**Files:**
- Create: `src/components/imagier/ImagierCard.tsx`

Each card shows: image, optional determiner, word, syllable break, phoneme, category badge, syllable count badge. All controlled by `ImagierSettings`.

**Step 1: Create the component**

```typescript
// src/components/imagier/ImagierCard.tsx
import { Word } from '@/types/word';
import { ImagierSettings } from '@/types/imagier';
import { applyCasse, formatPhonemes, getDeterminer } from '@/utils/imagier-utils';

interface ImagierCardProps {
  word: Word;
  settings: ImagierSettings;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function ImagierCard({
  word, settings, index,
  onDragStart, onDragOver, onDrop,
  isDragging, isDragOver,
}: ImagierCardProps) {
  const imageUrl = word["image associée"]?.trim();
  const fontSizeClass = settings.fontSize !== 'medium' ? `imagier-font-${settings.fontSize}` : '';

  return (
    <div
      className={`
        flex flex-col items-center p-2 pb-1.5 bg-white relative cursor-grab select-none overflow-hidden
        transition-all duration-200
        ${settings.cuttingGuides
          ? 'rounded-none border border-dashed border-[#CBD5E1]'
          : 'rounded-lg border-[1.5px] border-[#E5E7EB] hover:border-[#A29BFE] hover:shadow-[0_2px_12px_rgba(108,92,231,0.1)]'
        }
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isDragOver ? 'border-[#6C5CE7] !border-dashed bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]' : ''}
      `}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      {/* Drag handle (visible on hover, hidden in print) */}
      <div className="absolute top-1 right-1 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity text-[#9CA3AF] text-[8px] print:hidden">
        ⁞⁞
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="w-[88%] aspect-square rounded-md mb-1 overflow-hidden">
          <img
            src={imageUrl}
            alt={word.MOTS}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Determiner */}
      {settings.showDeterminer && (
        <div className="text-[10px] text-[#9CA3AF] font-medium -mb-px">
          {getDeterminer(word)}
        </div>
      )}

      {/* Word */}
      {settings.showWord && (
        <div className={`font-sora text-xs font-bold text-[#1A1A2E] text-center leading-tight ${fontSizeClass}`}>
          {applyCasse(word.MOTS, settings.casse)}
        </div>
      )}

      {/* Syllable break */}
      {settings.showSyllBreak && word["segmentation syllabique"] && (
        <div className="text-[10px] text-[#6B7280] font-medium mt-px tracking-wide">
          {applyCasse(word["segmentation syllabique"], settings.casse)}
        </div>
      )}

      {/* Phoneme */}
      {settings.showPhoneme && word.PHONEMES && (
        <div className="text-[9px] italic text-[#6C5CE7] mt-px opacity-80">
          {formatPhonemes(word.PHONEMES)}
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-1 mt-0.5">
        {settings.showCategory && (
          <span className="text-[7px] font-bold text-[#9CA3AF] bg-[#FAFBFC] px-1 py-px rounded uppercase tracking-wide">
            {word.SYNT}
          </span>
        )}
        {settings.showSyllCount && (
          <span className="text-[7px] font-bold text-[#9CA3AF] bg-[#FAFBFC] px-1 py-px rounded">
            {word.NBSYLL} syll.
          </span>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/imagier/ImagierCard.tsx
git commit -m "feat(imagier): add individual card component"
git push
```

---

## Task 5: `ImagierPreview` — A4 page preview with grid + pagination

**Files:**
- Create: `src/components/imagier/ImagierPreview.tsx`

This renders the A4 page container, the grid of cards, page navigation, and the format badge. It also handles the grid drag/drop state.

**Step 1: Create the component**

```typescript
// src/components/imagier/ImagierPreview.tsx
import { useState, useMemo, useCallback } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, GRID_OPTIONS } from '@/types/imagier';
import { ImagierCard } from './ImagierCard';
import { ChevronLeft, ChevronRight, Move } from 'lucide-react';

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

  const max = getGridMax(settings.grid);
  const start = currentPage * max;
  const visibleWords = words.slice(start, start + max);

  const gridOpt = GRID_OPTIONS.find(g => g.value === settings.grid)!;
  const gridColsClass = `grid-cols-${gridOpt.cols}`;

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

  // Gap varies by grid density
  const gapClass = settings.grid === '2x3' ? 'gap-3' :
                   settings.grid === '4x4' ? 'gap-1.5' :
                   settings.grid === '3x4' ? 'gap-2' : 'gap-2.5';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#ECEDF2] overflow-y-auto relative"
         style={{
           backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(108,92,231,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(162,155,254,0.03) 0%, transparent 50%)',
         }}
         onDragEnd={handleDragEnd}
    >
      {/* Format badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#9CA3AF] bg-white/85 backdrop-blur-sm px-3 py-0.5 rounded-full border border-black/5 uppercase tracking-wider">
        Aperçu A4 {settings.orientation}
      </div>

      {/* A4 Page */}
      <div
        className={`bg-white rounded-sm shadow-[0_1px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.05),0_16px_48px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all duration-400
          ${settings.orientation === 'portrait' ? 'w-[480px] h-[679px]' : 'w-[679px] h-[480px]'}
        `}
      >
        <div className="absolute inset-0 border border-black/[0.06] rounded-sm pointer-events-none z-[1]" />

        <div className="flex-1 flex flex-col p-6">
          {/* Page header */}
          <div className="flex items-end justify-between pb-2.5 border-b-[2.5px] border-[#6C5CE7] mb-3">
            <div className="flex flex-col gap-0.5">
              <div className="font-sora text-lg font-extrabold text-[#1A1A2E] tracking-tight">
                {settings.title || 'Mon imagier'}
              </div>
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

          {/* Cards grid */}
          <div className={`flex-1 grid ${gridColsClass} ${gapClass} content-start ${settings.cuttingGuides ? '!gap-0' : ''}`}>
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
          <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] mt-auto">
            <span className="text-[9px] text-[#CBD5E1]">Imagier phonétique</span>
            <span className="text-[9px] text-[#CBD5E1]">
              <span className="inline-block w-1 h-1 rounded-full bg-[#A29BFE] mr-1 align-middle" />
              Ressources Orthophonie
            </span>
          </div>
        </div>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3.5 mt-4">
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

      {/* Drag hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-[#9CA3AF] bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-black/5 flex items-center gap-1.5 pointer-events-none print:hidden">
        <Move className="w-3.5 h-3.5 opacity-50" />
        Glissez les cartes pour réorganiser
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/imagier/ImagierPreview.tsx
git commit -m "feat(imagier): add A4 preview with grid and pagination"
git push
```

---

## Task 6: `ImagierPanel` — side panel with 3 tabs

**Files:**
- Create: `src/components/imagier/ImagierPanel.tsx`

The side panel (440px) with 3 tabs: "Mise en page", "Contenu", "Ordre".

**Step 1: Create the component**

This is the largest component. It contains:
- Tab bar (3 tabs)
- **Tab "Mise en page"**: Grid selector, orientation, title/subtitle inputs, cutting guides toggle, warning card
- **Tab "Contenu"**: Word/determiner toggles, casse radio, font size radio, syllable break/phoneme/category/syllcount toggles
- **Tab "Ordre"**: Drag-and-drop word list

```typescript
// src/components/imagier/ImagierPanel.tsx
import { useState } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, GridLayout, GRID_OPTIONS } from '@/types/imagier';
import { LayoutGrid, FileText, ArrowDownUp, Scissors } from 'lucide-react';
import { getDeterminer, formatPhonemes } from '@/utils/imagier-utils';

interface ImagierPanelProps {
  settings: ImagierSettings;
  updateSetting: <K extends keyof ImagierSettings>(key: K, value: ImagierSettings[K]) => void;
  words: Word[];
  removedCount: number;
  onReorder: (from: number, to: number) => void;
}

type TabId = 'mise-en-page' | 'contenu' | 'ordre';

export function ImagierPanel({ settings, updateSetting, words, removedCount, onReorder }: ImagierPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mise-en-page');
  const [listDragSrc, setListDragSrc] = useState<number | null>(null);
  const [listDragOver, setListDragOver] = useState<number | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'mise-en-page', label: 'Mise en page', icon: <LayoutGrid className="w-[15px] h-[15px]" /> },
    { id: 'contenu', label: 'Contenu', icon: <FileText className="w-[15px] h-[15px]" /> },
    { id: 'ordre', label: 'Ordre', icon: <ArrowDownUp className="w-[15px] h-[15px]" /> },
  ];

  return (
    <div className="w-[440px] bg-white border-l border-[#E5E7EB] flex flex-col flex-shrink-0 print:hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] flex-shrink-0 bg-[#FAFBFC]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 px-4 text-[13px] font-semibold font-['DM_Sans'] text-center transition-all border-b-2 flex items-center justify-center gap-1.5
              ${activeTab === tab.id
                ? 'text-[#6C5CE7] border-[#6C5CE7] bg-white'
                : 'text-[#9CA3AF] border-transparent hover:text-[#374151]'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ========== TAB: MISE EN PAGE ========== */}
        {activeTab === 'mise-en-page' && (
          <div>
            {/* Grid selector */}
            <Section label="Disposition" icon={<LayoutGrid className="w-[13px] h-[13px] opacity-40" />}>
              <div className="grid grid-cols-4 gap-2">
                {GRID_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting('grid', opt.value)}
                    className={`py-2.5 px-1 border-[1.5px] rounded-[10px] text-center transition-all
                      ${settings.grid === opt.value
                        ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                      }
                    `}
                  >
                    <GridVisual cols={opt.cols} rows={opt.rows} active={settings.grid === opt.value} />
                    <div className={`font-sora text-xs font-bold mt-1.5 ${settings.grid === opt.value ? 'text-[#6C5CE7]' : 'text-[#374151]'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] mt-px">
                      {opt.cols * opt.rows} / page
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Orientation */}
            <Section label="Orientation" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>}>
              <div className="grid grid-cols-2 gap-2.5">
                {(['portrait', 'landscape'] as const).map(o => (
                  <button
                    key={o}
                    onClick={() => updateSetting('orientation', o)}
                    className={`flex flex-col items-center gap-2 p-3.5 border-[1.5px] rounded-[10px] transition-all
                      ${settings.orientation === o
                        ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                      }
                    `}
                  >
                    <div className={`border-2 rounded-[3px] relative transition-colors
                      ${settings.orientation === o ? 'border-[#6C5CE7]' : 'border-[#E5E7EB]'}
                      ${o === 'portrait' ? 'w-[22px] h-[30px]' : 'w-[30px] h-[22px]'}
                    `}>
                      <div className={`absolute top-[3px] left-[3px] right-[3px] h-[2px] rounded-sm transition-colors ${settings.orientation === o ? 'bg-[#6C5CE7]' : 'bg-[#E5E7EB]'}`} />
                    </div>
                    <span className={`text-xs font-semibold ${settings.orientation === o ? 'text-[#6C5CE7]' : 'text-[#6B7280]'}`}>
                      {o === 'portrait' ? 'Portrait' : 'Paysage'}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Title */}
            <Section label="Titre" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}>
              <input
                type="text"
                value={settings.title}
                onChange={e => updateSetting('title', e.target.value)}
                placeholder="ex : Les animaux, Le son [s]..."
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[#E5E7EB] rounded-[10px] text-sm font-['DM_Sans'] font-medium text-[#1A1A2E] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
              />
              <div className="h-2" />
              <input
                type="text"
                value={settings.subtitle}
                onChange={e => updateSetting('subtitle', e.target.value)}
                placeholder="Sous-titre (nom patient, date...)"
                className="w-full px-3.5 py-2 border-[1.5px] border-[#E5E7EB] rounded-[10px] text-xs font-['DM_Sans'] font-medium text-[#6B7280] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
              />
              <div className="text-[11px] text-[#9CA3AF] mt-1.5 italic">
                Le titre et sous-titre apparaissent en haut de chaque page
              </div>
            </Section>

            {/* Cutting guides */}
            <Section noBorder>
              <ToggleRow
                icon={<Scissors className="w-4 h-4" />}
                label="Traits de découpe"
                desc="Pointillés entre les cartes pour découper"
                isOn={settings.cuttingGuides}
                onToggle={() => updateSetting('cuttingGuides', !settings.cuttingGuides)}
              />
            </Section>

            {/* Warning */}
            {removedCount > 0 && (
              <div className="px-6 py-4 border-t border-[#F1F5F9]">
                <div className="flex items-start gap-2.5 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] text-xs leading-relaxed text-[#92400E]">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-px">
                    !
                  </div>
                  <div>
                    <strong>{removedCount} mot{removedCount > 1 ? 's' : ''} sans image</strong> ont été retirés automatiquement de l'imagier.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== TAB: CONTENU ========== */}
        {activeTab === 'contenu' && (
          <div>
            {/* Word text */}
            <Section label="Texte du mot" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}>
              <div className="flex flex-col gap-0.5">
                <ToggleRow
                  icon="Aa"
                  label="Mot"
                  desc="Le mot écrit sous l'image"
                  isOn={settings.showWord}
                  onToggle={() => updateSetting('showWord', !settings.showWord)}
                />
                <ToggleRow
                  icon="le"
                  label="Déterminant"
                  desc="Affiche le/la/un/une devant le mot"
                  isOn={settings.showDeterminer}
                  onToggle={() => updateSetting('showDeterminer', !settings.showDeterminer)}
                />
              </div>

              {/* Casse */}
              <div className="mt-3.5">
                <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">
                  Casse du mot
                </div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'lower', label: 'minuscule', display: 'chat' },
                    { value: 'upper', label: 'MAJUSCULE', display: 'CHAT' },
                    { value: 'capitalize', label: 'Capitale', display: 'Chat' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('casse', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center text-xs font-semibold font-['DM_Sans'] transition-all
                        ${settings.casse === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div>{opt.display}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="mt-3.5">
                <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">
                  Taille de police
                </div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'small', label: 'Petit', size: '11px' },
                    { value: 'medium', label: 'Moyen', size: '14px' },
                    { value: 'large', label: 'Grand', size: '18px' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('fontSize', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center text-xs font-semibold font-['DM_Sans'] transition-all
                        ${settings.fontSize === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div style={{ fontSize: opt.size }}>A</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Additional info */}
            <Section label="Informations supplémentaires" icon={<FileText className="w-[13px] h-[13px] opacity-40" />}>
              <div className="flex flex-col gap-0.5">
                <ToggleRow
                  icon="a-b"
                  label="Segmentation syllabique"
                  desc="Affiche la décomposition (cha-peau)"
                  isOn={settings.showSyllBreak}
                  onToggle={() => updateSetting('showSyllBreak', !settings.showSyllBreak)}
                />
                <ToggleRow
                  icon="/a/"
                  label="Transcription phonétique"
                  desc="API sous le mot"
                  isOn={settings.showPhoneme}
                  onToggle={() => updateSetting('showPhoneme', !settings.showPhoneme)}
                />
                <ToggleRow
                  icon="NC"
                  label="Catégorie syntaxique"
                  desc="Nom, verbe, adjectif..."
                  isOn={settings.showCategory}
                  onToggle={() => updateSetting('showCategory', !settings.showCategory)}
                />
                <ToggleRow
                  icon="2s"
                  label="Nombre de syllabes"
                  desc="Badge avec le compte syllabique"
                  isOn={settings.showSyllCount}
                  onToggle={() => updateSetting('showSyllCount', !settings.showSyllCount)}
                />
              </div>
            </Section>
          </div>
        )}

        {/* ========== TAB: ORDRE ========== */}
        {activeTab === 'ordre' && (
          <div>
            <Section label="Ordre des mots" icon={<ArrowDownUp className="w-[13px] h-[13px] opacity-40" />} badge={`${words.length} mots`}>
              <div className="flex flex-col gap-0.5">
                {words.map((w, i) => (
                  <div
                    key={w.uid || w.MOTS + i}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab select-none transition-colors hover:bg-[#FAFBFC] ${listDragSrc === i ? 'opacity-40' : ''}`}
                    draggable
                    onDragStart={() => setListDragSrc(i)}
                    onDragEnd={() => { setListDragSrc(null); setListDragOver(null); }}
                    onDragOver={(e) => { e.preventDefault(); setListDragOver(i); }}
                    onDragLeave={() => setListDragOver(null)}
                    onDrop={() => {
                      if (listDragSrc !== null && listDragSrc !== i) {
                        onReorder(listDragSrc, i);
                      }
                      setListDragSrc(null);
                      setListDragOver(null);
                    }}
                    style={{ borderTop: listDragOver === i ? '2px solid #6C5CE7' : undefined }}
                  >
                    <div className="text-[#E5E7EB] text-[10px] cursor-grab">⁞⁞</div>
                    {w["image associée"] && (
                      <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
                        <img src={w["image associée"]} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1A1A2E]">
                        {getDeterminer(w) ? getDeterminer(w) + ' ' : ''}{w.MOTS}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] italic">
                        {formatPhonemes(w.PHONEMES)} · {w.NBSYLL} syll.
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-[#9CA3AF] bg-[#FAFBFC] px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function Section({ label, icon, badge, noBorder, children }: {
  label?: string;
  icon?: React.ReactNode;
  badge?: string;
  noBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`px-6 py-4 ${noBorder ? '' : 'border-b border-[#F1F5F9]'}`}>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-1.5">
            {icon}
            {label}
          </div>
          {badge && (
            <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function ToggleRow({ icon, label, desc, isOn, onToggle }: {
  icon: React.ReactNode | string;
  label: string;
  desc: string;
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center justify-between py-2.5 px-3.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all
        ${isOn ? 'bg-[#F5F3FF] border-[rgba(108,92,231,0.15)]' : 'border-transparent hover:bg-[#FAFBFC]'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-sora flex-shrink-0 transition-all
          ${isOn ? 'bg-white text-[#6C5CE7] shadow-[0_1px_4px_rgba(108,92,231,0.12)]' : 'bg-[#FAFBFC] text-[#9CA3AF]'}
        `}>
          {typeof icon === 'string' ? icon : icon}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
          <div className="text-[11px] text-[#9CA3AF] mt-px">{desc}</div>
        </div>
      </div>
      {/* Toggle switch */}
      <div className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${isOn ? 'bg-[#6C5CE7]' : 'bg-[#D1D5DB]'}`}>
        <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-[left] shadow-[0_1px_3px_rgba(0,0,0,0.12)] ${isOn ? 'left-5' : 'left-[2px]'}`} />
      </div>
    </div>
  );
}

function GridVisual({ cols, rows, active }: { cols: number; rows: number; active: boolean }) {
  const cells = Array.from({ length: cols * rows });
  const sizes: Record<number, string> = { 2: '9px', 3: '7px', 4: '6px' };
  const cellSize = sizes[cols] || '7px';

  return (
    <div
      className="grid gap-[2px] mx-auto w-fit mb-1"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize})` }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-[1.5px] transition-colors ${active ? 'bg-[#6C5CE7]' : 'bg-[#E5E7EB]'}`}
          style={{ width: cellSize }}
        />
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/imagier/ImagierPanel.tsx
git commit -m "feat(imagier): add side panel with 3 tabs (layout, content, order)"
git push
```

---

## Task 7: Wire into app — SelectionTray button + WordExplorer overlay

**Files:**
- Modify: `src/components/SelectionTray.tsx` (add "Créer un imagier" button)
- Modify: `src/components/WordExplorer.tsx` (add Imagier overlay + state)

**Step 1: Add state and import in WordExplorer**

In `src/components/WordExplorer.tsx`:
- Add `import { Imagier } from './imagier/Imagier';`
- Add `const [isImagierOpen, setIsImagierOpen] = useState(false);` in `WordExplorerContent`
- Pass `setIsImagierOpen` down to SelectionTray or use a callback
- Render `<Imagier words={selectedWords} isOpen={isImagierOpen} onClose={() => setIsImagierOpen(false)} />` after the Tachistoscope

For state passing: The simplest approach is adding `isImagierOpen` / `setIsImagierOpen` directly in `WordExplorerContent` and passing `onOpenImagier` to `SelectionTray` as a prop.

**Changes to `WordExplorer.tsx`:**

After line 28 (`import { Tachistoscope } ...`), add:
```typescript
import { Imagier } from './imagier/Imagier';
```

Inside `WordExplorerContent`, after the existing state declarations (around line 45), add:
```typescript
const [isImagierOpen, setIsImagierOpen] = useState(false);
```

In the JSX, after `<SelectionTray />` (line 190), change to:
```tsx
<SelectionTray onOpenImagier={() => setIsImagierOpen(true)} />
```

After the `<Tachistoscope ... />` block (after line 197), add:
```tsx
{/* Imagier Overlay (Print Builder) */}
<Imagier
  words={selectedWords}
  isOpen={isImagierOpen}
  onClose={() => setIsImagierOpen(false)}
/>
```

Also send `isImagierOpen` to the iframe resize hook:
```typescript
useIframeResize(isFocusModeOpen || isImagierOpen);
```

And add the postMessage effect for imagier state:
```typescript
useEffect(() => {
  window.parent.postMessage({
    type: 'focus_mode_change',
    isOpen: isFocusModeOpen || isImagierOpen
  }, '*');
}, [isFocusModeOpen, isImagierOpen]);
```

**Step 2: Add button and prop to SelectionTray**

In `src/components/SelectionTray.tsx`:

Add to the function signature:
```typescript
export function SelectionTray({ onOpenImagier }: { onOpenImagier: () => void }) {
```

Between the "Exporter la liste" Button and the "Lancer le diaporama" Button (around line 388), add:
```tsx
<Button
  className="w-full flex items-center justify-center gap-2 h-[48px] rounded-xl border-2 border-[#6C5CE7] text-[#6C5CE7] bg-white font-semibold text-sm hover:bg-[#F7F6FE] transition-all"
  onClick={onOpenImagier}
  disabled={selectedWords.length === 0 || !selectedWords.some(w => w["image associée"]?.trim())}
>
  <ImageIcon className="w-4 h-4" />
  Créer un imagier
</Button>
```

Note: `ImageIcon` is already imported in `SelectionTray.tsx` (line 4).

**Step 3: Commit**

```bash
git add src/components/WordExplorer.tsx src/components/SelectionTray.tsx
git commit -m "feat(imagier): wire Imagier overlay into app with SelectionTray button"
git push
```

---

## Task 8: Print CSS — `@media print` styles

**Files:**
- Modify: `src/components/imagier/Imagier.tsx` (add print styles or a dedicated CSS)

Add a `<style>` block in the Imagier component (or in a CSS file) for print:

**Step 1: Add print stylesheet**

Create `src/components/imagier/imagier-print.css`:

```css
@media print {
  /* Hide everything except the imagier */
  body > * { display: none !important; }

  /* Show the imagier overlay */
  .imagier-print-root {
    display: block !important;
    position: static !important;
    background: white !important;
  }

  /* Hide panel, topbar, nav, hints */
  .imagier-print-root .print\\:hidden { display: none !important; }

  /* Page breaks between pages */
  .imagier-page {
    page-break-after: always;
    page-break-inside: avoid;
    margin: 0;
    padding: 0;
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    height: auto !important;
  }

  .imagier-page:last-child {
    page-break-after: auto;
  }

  /* Cards should not break across pages */
  .imagier-card {
    page-break-inside: avoid;
  }
}
```

**Step 2: Update Imagier.tsx to add the print class and import**

In `ImagierContent`, add className `imagier-print-root` to the root div. Import the CSS at the top of the file.

**Step 3: For multi-page print, update ImagierPreview to render ALL pages when printing**

This requires rendering all pages at once for print. Use a print-specific rendering:
- During normal usage: show only the current page
- During print: render all pages stacked

We can detect print via `window.matchMedia('print')` or just always render all pages but only show the current one on screen.

**Simpler approach**: Always render all pages, only show current one via CSS. On print, show all.

Update `ImagierPreview.tsx` to map over all pages (not just the current one). The on-screen view uses `hidden` class for non-current pages; the print view shows all.

**Step 4: Commit**

```bash
git add src/components/imagier/imagier-print.css src/components/imagier/Imagier.tsx src/components/imagier/ImagierPreview.tsx
git commit -m "feat(imagier): add print CSS for A4 page output"
git push
```

---

## Task 9: Refine — update Imagier.tsx to lift pagination state

**Files:**
- Modify: `src/components/imagier/Imagier.tsx`

Move `currentPage` and `totalPages` computation up to `ImagierContent` so both `ImagierPreview` and `ImagierTopbar` can access them. The preview needs pagination, and the topbar can show the page count.

**Step 1: Lift state**

```typescript
// In ImagierContent:
const [currentPage, setCurrentPage] = useState(0);
const max = getGridMax(settings.grid);
const totalPages = Math.max(1, Math.ceil(orderedWords.length / max));

// Reset page when grid changes
useEffect(() => {
  setCurrentPage(0);
}, [settings.grid]);
```

Pass to `ImagierPreview`:
```tsx
<ImagierPreview
  words={orderedWords}
  settings={settings}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  onReorder={handleReorder}
/>
```

**Step 2: Commit**

```bash
git add src/components/imagier/Imagier.tsx
git commit -m "feat(imagier): lift pagination state to root component"
git push
```

---

## Task 10: Build verification + polish

**Step 1: Run the build**

```bash
cd C:/Users/maitr/.gemini/antigravity/scratch/antigravity-word-hoard
npm run build
```

Expected: build succeeds with no TypeScript errors.

**Step 2: Fix any TS errors**

If there are type errors, fix them.

**Step 3: Visual testing**

```bash
npm run dev
```

1. Open the app
2. Select some words (make sure some have images)
3. Click "Créer un imagier"
4. Verify: overlay opens, A4 page shows cards with images
5. Test all 3 tabs (Mise en page, Contenu, Ordre)
6. Test grid switching (2x3, 3x3, 3x4, 4x4)
7. Test orientation toggle
8. Test all content toggles (word, determiner, syllable break, phoneme, category, syllable count)
9. Test casse and font size
10. Test drag & drop on grid and in word list
11. Test Ctrl+P / print button
12. Test Escape to close

**Step 4: Fix any visual issues, commit**

```bash
git add -A  # Note: git add -A fails in this repo — add specific files instead
git commit -m "feat(imagier): build verification and polish"
git push
```

---

## Summary of all files

| File | Action |
|------|--------|
| `src/types/imagier.ts` | Create |
| `src/utils/imagier-utils.ts` | Create |
| `src/components/imagier/Imagier.tsx` | Create |
| `src/components/imagier/ImagierTopbar.tsx` | Create |
| `src/components/imagier/ImagierCard.tsx` | Create |
| `src/components/imagier/ImagierPreview.tsx` | Create |
| `src/components/imagier/ImagierPanel.tsx` | Create |
| `src/components/imagier/imagier-print.css` | Create |
| `src/components/WordExplorer.tsx` | Modify (add Imagier overlay + state) |
| `src/components/SelectionTray.tsx` | Modify (add "Créer un imagier" button) |

**Total: 8 new files, 2 modified files.**
