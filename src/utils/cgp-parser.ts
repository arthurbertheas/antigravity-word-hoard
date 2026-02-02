import cgpTokensData from '@/data/cgp-tokens.json';
import type { CGPTokens, ParsedGrapheme, GraphemeType } from '@/types/cgp';

const cgpTokens = cgpTokensData as CGPTokens;

// Build a comprehensive set of vowel graphemes from the CGP data
const VOWEL_GRAPHEMES = new Set<string>();
const SILENT_MARKERS = new Set(['#', '*']); // Phonemes indicating silent letters

for (const tokenData of Object.values(cgpTokens.voyelles)) {
    for (const g of tokenData.graphemes) {
        VOWEL_GRAPHEMES.add(g.toLowerCase());
        // Also add without underscores (e.g., "_er" -> "er")
        if (g.startsWith('_')) {
            VOWEL_GRAPHEMES.add(g.slice(1).toLowerCase());
        }
    }
}

/**
 * Parse a GPMATCH string into an array of grapheme-phoneme pairs
 * Format: "(a-a.b-b.an-ã.d-d.o-o.nn-n.é-e)"
 */
export function parseGPMATCH(gpmatch: string): ParsedGrapheme[] {
    if (!gpmatch) return [];

    // Remove surrounding parentheses
    const content = gpmatch.replace(/^\(|\)$/g, '');

    // Split by dots (but not dots inside the grapheme-phoneme pair)
    const pairs = content.split('.');

    return pairs.map(pair => {
        const [grapheme, phoneme] = pair.split('-');

        let type: GraphemeType = 'unknown';

        if (phoneme && SILENT_MARKERS.has(phoneme)) {
            type = 'muette';
        } else if (grapheme && VOWEL_GRAPHEMES.has(grapheme.toLowerCase())) {
            type = 'voyelle';
        } else if (grapheme) {
            type = 'consonne';
        }

        return {
            grapheme: grapheme || '',
            phoneme: phoneme || '',
            type
        };
    }).filter(p => p.grapheme.length > 0);
}

/**
 * Get the type of a grapheme based on the CGP tokens data
 */
export function getGraphemeType(grapheme: string): GraphemeType {
    const lower = grapheme.toLowerCase();

    // Check in the graphemeToType lookup first
    if (cgpTokens.graphemeToType[lower]) {
        return cgpTokens.graphemeToType[lower] as GraphemeType;
    }

    // Fallback to vowel check
    if (VOWEL_GRAPHEMES.has(lower)) {
        return 'voyelle';
    }

    return 'consonne';
}

/**
 * Check if a grapheme is a vowel
 */
export function isVowelGrapheme(grapheme: string): boolean {
    return VOWEL_GRAPHEMES.has(grapheme.toLowerCase());
}

/**
 * Get all vowel graphemes for reference
 */
export function getVowelGraphemes(): string[] {
    return Array.from(VOWEL_GRAPHEMES);
}
