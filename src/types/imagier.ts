export type GridLayout = '2x3' | '3x3' | '3x4' | '4x4';
export type Orientation = 'portrait' | 'landscape';
export type CasseMode = 'lower' | 'upper' | 'capitalize';
export type FontSizeMode = 'small' | 'medium' | 'large';
export type PageStyle = 'grid' | 'parcours-s' | 'escalier' | 'circulaire';

export interface ImagierSettings {
  grid: GridLayout;
  orientation: Orientation;
  pageStyle: PageStyle;
  parcoursPerPage: number; // 12 | 16 | 20 | 24 | 28
  showHeader: boolean;
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
  hGap: number;    // mm — gap between card columns
  vGap: number;    // mm — gap between card rows
  margin: number;  // mm — page padding on all 4 sides
}

export const DEFAULT_IMAGIER_SETTINGS: ImagierSettings = {
  grid: '3x3',
  orientation: 'portrait',
  pageStyle: 'grid',
  parcoursPerPage: 20,
  showHeader: true,
  title: '',
  subtitle: '',
  cuttingGuides: true,
  showWord: true,
  showDeterminer: false,
  casse: 'lower',
  fontSize: 'medium',
  showSyllBreak: true,
  showPhoneme: true,
  showCategory: false,
  showSyllCount: false,
  hGap: 5,
  vGap: 5,
  margin: 5,
};

export const GRID_OPTIONS: { value: GridLayout; cols: number; rows: number; label: string }[] = [
  { value: '2x3', cols: 2, rows: 3, label: '2×3' },
  { value: '3x3', cols: 3, rows: 3, label: '3×3' },
  { value: '3x4', cols: 3, rows: 4, label: '3×4' },
  { value: '4x4', cols: 4, rows: 4, label: '4×4' },
];

/** Combined grid + orientation options for the layout strip */
export const LAYOUT_OPTIONS: { grid: GridLayout; orientation: Orientation; label: string; cols: number; rows: number }[] = [
  // Portrait
  { grid: '2x3', orientation: 'portrait', label: '2×3', cols: 2, rows: 3 },
  { grid: '3x3', orientation: 'portrait', label: '3×3', cols: 3, rows: 3 },
  { grid: '3x4', orientation: 'portrait', label: '3×4', cols: 3, rows: 4 },
  { grid: '4x4', orientation: 'portrait', label: '4×4', cols: 4, rows: 4 },
  // Landscape
  { grid: '2x3', orientation: 'landscape', label: '3×2', cols: 3, rows: 2 },
  { grid: '3x4', orientation: 'landscape', label: '4×3', cols: 4, rows: 3 },
];

export function getGridMax(grid: GridLayout): number {
  const opt = GRID_OPTIONS.find(g => g.value === grid);
  return opt ? opt.cols * opt.rows : 9;
}

/** Swap cols/rows for non-square grids when in landscape */
export function getGridDimensions(grid: GridLayout, orientation: Orientation): { cols: number; rows: number } {
  const opt = GRID_OPTIONS.find(g => g.value === grid)!;
  if (orientation === 'landscape' && opt.cols !== opt.rows) {
    return { cols: opt.rows, rows: opt.cols };
  }
  return { cols: opt.cols, rows: opt.rows };
}

/** Number of columns for parcours-s based on total cards per page */
export function getParcoursCols(n: number): number {
  const map: Record<number, number> = { 12: 4, 16: 4, 20: 5, 24: 6, 28: 7 };
  return map[n] ?? 5;
}

/** Total cards visible per page depending on page style */
export function getCardsPerPage(settings: ImagierSettings): number {
  if (settings.pageStyle === 'grid') return getGridMax(settings.grid);
  return settings.parcoursPerPage;
}
