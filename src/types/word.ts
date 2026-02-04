// Types pour la base de mots Manulex

export interface Word {
    uid?: string;            // Identifiant unique (pour le shuffle)
    // Données principales
    ORTHO: string;           // Orthographe du mot
    PHON: string;            // Transcription phonétique
    SYNT: SyntCategory;      // Catégorie syntaxique
    "fréquence": string;     // Fréquence d'usage
    "code fréquence": string; // Code fréquence (1-4)

    // Données syllabiques
    NBSYLL: string;          // Nombre de syllabes
    PSYLL: string;           // Découpage syllabique phonétique

    // Données structurelles
    "code structure": StructureCode;  // Structure syllabique
    "code graphèmes": string;         // Complexité graphémique (1-13)
    NBLET: string;           // Nombre de lettres
    NBPHON: string;          // Nombre de phonèmes
    NBGRAPH: string;         // Nombre de graphèmes

    // Segmentation
    GSEG: string;            // Graphèmes segmentés
    PSEG: string;            // Phonèmes segmentés
    GPMATCH: string;         // Correspondance graphème-phonème

    // Colonnes optionnelles
    "tri simple"?: string;
    "structure phonétique"?: string;
    "régularité graphotactique"?: string;
    "image associée"?: string;
    PUORTHO?: string;

    // Nouveaux champs orthophoniste (v3)
    "structure C.V"?: string;       // Pattern CV (ex: "VCVCVCV")
    "consonne double"?: string;     // "oui" | "non"
    "groupe CC"?: string;           // Type de cluster consonantique
    "groupe VV"?: string;           // Type de cluster vocalique

    // Statistiques homophones
    NBHPTY: string;
    NBHGTY: string;
    NBHPNGTY: string;
    NBHGNPTY: string;
    NBHPTO: string;
    NBHGTO: string;
    NBHPNGTO: string;
    NBHGNPTO: string;
    NBONTY: string;
    NBONTO: string;
    NBPGNTY: string;
    NBPGNTO: string;

    // Fréquences bigrammes (nombreuses colonnes FR* et CO*)
    [key: string]: string;
}

// Catégories syntaxiques
export type SyntCategory = 'NC' | 'ADJ' | 'VER' | 'ADV' | 'PRE';

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
    a: 'Syllabes simples (CV, CVCV)',
    b: 'VCV ou CVC (voyelle initiale, consonne finale)',
    c: 'E final muet',
    d: 'Consonnes doubles',
    e: 'Consonnes finales muettes, h muet',
    f: 'Groupes consonantiques simples (tr, pl...)',
    g: 'Groupes consonantiques complexes, voyelles en hiatus'
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
    '10': 'Graphies ail/eil/ouil',
    '11': 'Graphies conditionnelles (gea, gui)',
    '12': 'E contextuel',
    '13': 'Diphtongues rares (oy, uy)'
};

export const FREQUENCY_LABELS: Record<string, string> = {
    '1': 'Fréquent',
    '2': 'Peu fréquent',
    '3': 'Très peu fréquent',
    '4': 'Rare / Inconnu'
};

// Filtres disponibles
export interface WordFilters {
    search: string;              // Recherche textuelle (ORTHO)
    phonSearch: string;          // Recherche phonétique (PHON)
    categories: SyntCategory[];  // Catégories syntaxiques
    syllables: number[];         // Nombre de syllabes
    structures: string[];        // Codes structure
    graphemes: string[];         // Codes graphèmes
    frequencies: string[];       // Codes fréquence
    minLetters: number;          // Longueur min
    maxLetters: number;          // Longueur max
}

export const DEFAULT_FILTERS: WordFilters = {
    search: '',
    phonSearch: '',
    categories: [],
    syllables: [],
    structures: [],
    graphemes: [],
    frequencies: [],
    minLetters: 1,
    maxLetters: 20
};
