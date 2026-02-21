export type GridLayout = '2x3' | '3x3' | '3x4' | '4x4';
export type Orientation = 'portrait' | 'landscape';
export type CasseMode = 'lower' | 'upper' | 'capitalize';
export type FontSizeMode = 'small' | 'medium' | 'large';
export type PageStyle = 'grid' | 'parcours-s' | 'circulaire';

export interface ImagierSettings {
  grid: GridLayout;
  orientation: Orientation;
  pageStyle: PageStyle;
  parcoursPerPage: number; // 12 | 16 | 20 | 30 | 40
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
  parcoursPerPage: 30,
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

/** Grid dimensions for the spiral (snail) layout.
 *  cols * rows = n  →  chosen so ratio ≈ landscape A4  */
export function getParcoursRect(n: number): { cols: number; rows: number } {
  const map: Record<number, { cols: number; rows: number }> = {
    9:  { cols: 3, rows: 3 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
    24: { cols: 6, rows: 4 },
    30: { cols: 6, rows: 5 },
  };
  return map[n] ?? { cols: 5, rows: 4 };
}

/** Spiral (snail) path — fills ALL cells from outside inward, clockwise. */
export function spiralPath(cols: number, rows: number): Array<{ col: number; row: number }> {
  const path: Array<{ col: number; row: number }> = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) path.push({ col: c, row: top });
    top++;
    for (let r = top; r <= bottom; r++) path.push({ col: right, row: r });
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) path.push({ col: c, row: bottom });
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) path.push({ col: left, row: r });
      left++;
    }
  }
  return path;
}

/** Snake/boustrophedon path — rows alternate left→right, right→left. */
export function snakePath(cols: number, rows: number): Array<{ col: number; row: number }> {
  const path: Array<{ col: number; row: number }> = [];
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      const col = row % 2 === 0 ? c : (cols - 1 - c);
      path.push({ col, row });
    }
  }
  return path;
}

/** Auto-compute optimal cols×rows for n cards in landscape orientation.
 *  Targets A4 landscape ratio ≈ 1.41, keeps cols ≥ rows. */
export function getAutoGrid(n: number): { cols: number; rows: number } {
  if (n <= 0) return { cols: 1, rows: 1 };
  const targetRatio = 1.41;
  let bestCols = n, bestRows = 1, bestScore = Infinity;
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);
    if (cols < rows) break;
    const ratio = cols / rows;
    const waste = (cols * rows - n) / n;
    const score = Math.abs(ratio - targetRatio) + waste * 0.3;
    if (score < bestScore) {
      bestScore = score;
      bestCols = cols;
      bestRows = rows;
    }
  }
  return { cols: bestCols, rows: bestRows };
}

/** @deprecated Use spiralPath instead */
export function perimeterPath(cols: number, rows: number): Array<{ col: number; row: number }> {
  return spiralPath(cols, rows);
}

/** Total cards visible per page depending on page style */
export function getCardsPerPage(settings: ImagierSettings): number {
  if (settings.pageStyle === 'grid') return getGridMax(settings.grid);
  return settings.parcoursPerPage;
}
