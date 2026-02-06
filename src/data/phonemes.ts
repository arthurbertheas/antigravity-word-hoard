export interface PhonemeDef {
    symbol: string;
    label?: string; // For accessibility or hover if needed
}

export const FREQUENT_PHONEMES: string[] = [
    'a', 'i', 'ʃ', 's', 'ɛ̃', 'ɔ̃', 'ʒ', 'k'
];

export const OTHER_PHONEMES: string[] = [
    'p', 'b', 't', 'd', 'f', 'v', 'z', 'm', 'n', 'ɲ', 'l', 'R', 'j', 'w', 'ɥ',
    'e', 'ɛ', 'o', 'ɔ', 'u', 'y', 'ø', 'œ', 'ə', 'ɑ̃', 'œ̃', 'ɡ', 'ŋ'
];

export const ALL_PHONEMES = [...FREQUENT_PHONEMES, ...OTHER_PHONEMES];
