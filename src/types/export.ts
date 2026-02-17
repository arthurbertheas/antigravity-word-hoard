import { Word } from "./word";
import { WordStatus } from "@/contexts/PlayerContext";

export type ExportFormat = 'pdf' | 'word';
export type ExportDisplay = 'wordOnly' | 'imageOnly' | 'wordAndImage';
export type ExportLayout = 'list-1col' | 'grid-2col' | 'grid-3col' | 'flashcards' | 'table';
export type ExportWordStatus = 'validated' | 'failed' | 'neutral' | 'not-seen';

export interface ExportSettings {
  // En-tête du document
  title: string;
  subtitle: string;
  includeDate: boolean;
  includeWordCount: boolean;

  // Affichage
  display: ExportDisplay;

  // Format
  format: ExportFormat;

  // Mise en page
  layout: ExportLayout;

  // Contenu par mot
  includePhonemes: boolean;
  includeCategories: boolean;
  includeSyllableCount: boolean;
  includeSyllableSegmentation: boolean;
  numberWords: boolean;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  title: '',
  subtitle: '',
  includeDate: true,
  includeWordCount: true,
  display: 'wordOnly',
  format: 'pdf',
  layout: 'list-1col',
  includePhonemes: false,
  includeCategories: false,
  includeSyllableCount: false,
  includeSyllableSegmentation: false,
  numberWords: false,
};

export interface ExportPanelProps {
  selectedWords: Word[];
  onClose: () => void;
  wordStatuses?: Map<string, WordStatus>;
  currentIndex?: number;
}

export const STATUS_COLORS: Record<ExportWordStatus, { bg: string; border: string; text: string; symbol: string; label: string }> = {
  validated: { bg: '#ECFDF5', border: '#10B981', text: '#059669', symbol: '✓', label: 'Validé' },
  failed:    { bg: '#FEF2F2', border: '#F87171', text: '#DC2626', symbol: '✗', label: 'Raté' },
  neutral:   { bg: '#F8FAFC', border: '#94A3B8', text: '#64748B', symbol: '—', label: 'Non noté' },
  'not-seen': { bg: '#F9FAFB', border: '#E2E8F0', text: '#CBD5E1', symbol: '?', label: 'Pas encore vu' },
};

export function getWordExportStatus(
  word: Word, index: number,
  wordStatuses: Map<string, WordStatus>,
  currentIndex: number
): ExportWordStatus {
  const status = word.uid ? wordStatuses.get(word.uid) : undefined;
  if (status === 'validated') return 'validated';
  if (status === 'failed') return 'failed';
  if (index <= currentIndex) return 'neutral';
  return 'not-seen';
}
