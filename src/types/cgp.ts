// Types pour les tokens CGP (Correspondance Graphème-Phonème)

export type GraphemeType = 'voyelle' | 'consonne' | 'muette' | 'unknown';

export interface CGPTokenData {
    phoneme: string;
    graphemes: string[];
}

export interface CGPTokens {
    consonnes: Record<string, CGPTokenData>;
    voyelles: Record<string, CGPTokenData>;
    muettes: string[];
    graphemeToType: Record<string, GraphemeType>;
}

export interface ParsedGrapheme {
    grapheme: string;
    phoneme: string;
    type: GraphemeType;
}
