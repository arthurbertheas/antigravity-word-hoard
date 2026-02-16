import { Word } from '@/types/word';
import { CasseMode } from '@/types/imagier';

/** Map SYNT category to French determiner (with elision) */
export function getDeterminer(word: Word): string {
  if (word.SYNT !== 'NC') return '';
  const first = word.MOTS?.trim().toLowerCase().charAt(0) || '';
  if ('aeiouyàâéèêëïîôùûüæœh'.includes(first)) return "l'";
  return 'le';
}

export function applyCasse(text: string, mode: CasseMode): string {
  if (mode === 'upper') return text.toUpperCase();
  if (mode === 'capitalize') return text.charAt(0).toUpperCase() + text.slice(1);
  return text.toLowerCase();
}

/** Clean PHONEMES field into /.../ notation */
export function formatPhonemes(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/^\./, '').replace(/\.$/, '').replace(/\./g, '').replace(/#/g, '');
  return `/${cleaned}/`;
}

/** Filter words to only those with images */
export function filterWordsWithImages(words: Word[]): { withImages: Word[]; removedCount: number } {
  const withImages = words.filter(w => w["image associée"]?.trim());
  return { withImages, removedCount: words.length - withImages.length };
}
