import { Word } from "./word";

export type ExportFormat = 'pdf' | 'word' | 'print';
export type ExportDisplay = 'wordOnly' | 'imageOnly' | 'wordAndImage';
export type ExportLayout = 'list-1col' | 'grid-2col' | 'grid-3col' | 'flashcards' | 'table';

export interface ExportSettings {
  // Affichage
  display: ExportDisplay;

  // Format
  format: ExportFormat;

  // Mise en page
  layout: ExportLayout;

  // Options
  includeDate: boolean;
  includePhonemes: boolean;
  numberWords: boolean;
  includeCategories: boolean;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  display: 'wordOnly',
  format: 'pdf',
  layout: 'list-1col',
  includeDate: true,
  includePhonemes: false,
  numberWords: false,
  includeCategories: false,
};

export interface ExportPanelProps {
  selectedWords: Word[];
  onClose: () => void;
}
