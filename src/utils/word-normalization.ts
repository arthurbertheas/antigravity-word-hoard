import { Word } from '@/types/word';

/**
 * Normalizes a word object from legacy field names to current v7 names.
 * This is crucial for loading lists saved with older versions of the app.
 */
export function normalizeWord(word: any): Word {
    if (!word) return word;

    // Mapping legacy fields (v3/old) to modern fields (v7)
    // We preserve existing modern fields and fallback to legacy ones if they exist
    const normalized: Word = {
        ...word,
        // Main data
        MOTS: word.MOTS || word.ORTHO || '',
        PHONEMES: word.PHONEMES || word.PHON || '',
        GRAPHEMES: word.GRAPHEMES || word.GRAPHS || '', // fallback GRAPHS just in case
        SYNT: word.SYNT || 'AUTRE',

        // Contextual data
        "APPUI LEXICAL": word["APPUI LEXICAL"] || word["code fréquence"] || '',

        // Syllabic data
        NBSYLL: String(word.NBSYLL || '0'),
        "segmentation syllabique": word["segmentation syllabique"] || word.PSYLL || '',

        // Structural data
        "progression structure": word["progression structure"] || word["code structure"] || '',
        "progression graphèmes": word["progression graphèmes"] || word["code graphèmes"] || '',

        // Segmentation
        "segmentation graphèmes": word["segmentation graphèmes"] || word.GSEG || '',
        GPMATCH: word.GPMATCH || '',

        // Ensure UID exists for context stability
        uid: word.uid || word.id || undefined
    };

    return normalized;
}

/**
 * Normalizes an array of words.
 */
export function normalizeWords(words: any[]): Word[] {
    if (!Array.isArray(words)) return [];
    return words.map(normalizeWord);
}
