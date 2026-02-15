// Types pour la base de mots Manulex

export interface Word {
    uid?: string;            // Identifiant unique (pour le shuffle)

    // Données principales - RENOMMÉES V7
    MOTS: string;                    // was ORTHO
    PHONEMES: string;                // was PHON
    GRAPHEMES: string;               // NOUVEAU V7
    SYNT: SyntCategory;
    "APPUI LEXICAL": string;         // was "code fréquence"

    // Données syllabiques - RENOMMÉES V7
    NBSYLL: string;                  // Nb de syllabes
    "segmentation syllabique": string;  // was PSYLL

    // Données structurelles - RENOMMÉES V7
    "progression structure": StructureCode;  // was "code structure"
    "progression graphèmes": string;         // was "code graphèmes"

    // Segmentation & Correspondance
    "segmentation graphèmes": string;   // was GSEG
    GPMATCH: string;                    // Correspondance graphème-phonème

    // Pattern & Structures (v3/v7)
    "structure C.V"?: string;           // Pattern CV (ex: "VCVCVCV")
    "C.V syllabes"?: string;            // Pattern CV par syllabe
    "consonne double"?: string;         // "oui" | "non"
    "groupe CC"?: string;               // Type de cluster consonantique
    "groupe VV"?: string;               // Type de cluster vocalique

    // Nouveaux champs v7
    "régularité graphotactique"?: string;
    "image associée"?: string;

    // Colonnes supprimées dans V7: fréquence, NBLET, NBPHON, NBGRAPH, PSEG, PUORTHO

    // Statistiques homophones (optionnelles selon le JSON)
    NBHPTY?: string;
    NBHGTY?: string;
    NBHPNGTY?: string;
    NBHGNPTY?: string;
    NBONTY?: string;
    NBONTO?: string;

    // Flexibilité pour les autres colonnes
    [key: string]: string | undefined;
}

// Catégories syntaxiques
export type SyntCategory = 'NC' | 'ADJ' | 'VER' | 'ADV' | 'PRE' | 'NP' | string;

// Codes de structure syllabique
export type StructureCode = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | '1';

// Labels pour l'affichage
export const SYNT_LABELS: Record<SyntCategory, string> = {
    NC: 'Nom commun',
    ADJ: 'Adjectif',
    VER: 'Verbe',
    ADV: 'Adverbe',
    PRE: 'Préposition'
};

export const STRUCTURE_LABELS: Record<string, string> = {
    a: 'Syllabes simples (CV)',
    b: 'Voyelle initiale / consonne finale',
    c: 'E final muet',
    d: 'Consonnes doubles',
    e: 'Consonnes muettes',
    f: 'CC et VV simples',
    g: 'CC et VV complexes'
};

export const GRAPHEME_LABELS: Record<string, string> = {
    '1': 'Graphèmes simples non ambigus',
    '2': 'Digraphes très simples (ou, eu, ch, gn)',
    '3': 'Digraphes fréquents basiques',
    '4': 'Consonnes contextuelles (c/s, g/j)',
    '5': 'N contextuel',
    '6': 'Voyelles contextuelles (en, ai, eau)',
    '7': 'Voyelles complexes (oin, ien)',
    '8': 'Graphies complexes',
    '9': 'Voyelles nasales complexes',
    '10': 'Graphies conditionnelles (gea, gui)',
    '11': 'Graphies ail/eil',
    '12': 'Diphtongues rares (oy, uy, ay)',
    '13': 'E contextuel'
};

export const FREQUENCY_LABELS: Record<string, string> = {
    '1': 'Fréquent',
    '2': 'Peu fréquent',
    '3': 'Très peu fréquent',
    '4': 'Rare / Inconnu'
};

// Filter Tag for Graphemes and Phonemes
export interface FilterTag {
    id: string;
    value: string;
    position: 'start' | 'end' | 'middle' | 'anywhere';
}

// Filtres disponibles
export interface WordFilters {
    search: FilterTag[];         // Recherche avancée (MOTS)
    categories: SyntCategory[];  // Catégories syntaxiques
    minSyllables: number;        // Nb syllabes min
    maxSyllables: number;        // Nb syllabes max
    structures: string[];        // Codes structure (progression structure)
    graphemeDisplay: string[];   // Codes graphèmes (progression graphèmes)
    graphemes: FilterTag[];      // Recherche de graphèmes spécifiques
    phonemes: FilterTag[];       // Recherche de phonèmes spécifiques
    frequencies: string[];       // Codes fréquence (APPUI LEXICAL)
    minLetters: number;          // Longueur min (calculé sur MOTS)
    maxLetters: number;          // Longueur max (calculé sur MOTS)
    hasImage: boolean | null;    // null = tous, true = avec image, false = sans image
    realtimeSearch: {            // Recherche temps réel
        value: string;
        position: 'start' | 'end' | 'middle' | 'anywhere';
    };
}

export const DEFAULT_FILTERS: WordFilters = {
    search: [],
    categories: [],
    minSyllables: 1,
    maxSyllables: 5,
    structures: [],
    graphemeDisplay: [],
    graphemes: [],
    phonemes: [],
    frequencies: [],
    minLetters: 1,
    maxLetters: 14,
    hasImage: null,
    realtimeSearch: { value: '', position: 'anywhere' }
};
