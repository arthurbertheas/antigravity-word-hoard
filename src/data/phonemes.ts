export interface PhonemeDef {
    symbol: string;
    label?: string; // For accessibility or hover if needed
}

export const CONSONNES: string[] = [
    'f', 'v', 's', 'z', 'ʃ', 'ʒ', 'p', 'b', 't', 'd', 'k', 'g', 'm', 'n', 'ɲ', 'R', 'l'
];

export const VOYELLES: string[] = [
    'a', 'u', 'y', 'i', 'o', 'ɔ', 'e', 'œ', 'ø', 'ɛ', 'õ', 'ã', 'ɛ̃', 'œ̃', 'w', 'ɥ', 'j'
];

// Keep backward compat
export const FREQUENT_PHONEMES = CONSONNES.slice(0, 8);
export const OTHER_PHONEMES = [...CONSONNES.slice(8), ...VOYELLES];
export const ALL_PHONEMES = [...CONSONNES, ...VOYELLES];
