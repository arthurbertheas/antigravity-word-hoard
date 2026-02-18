import { Word, WordFilters, SYNT_LABELS, STRUCTURE_LABELS, FREQUENCY_LABELS, GRAPHEME_LABELS } from '@/types/word';

// Types internes pour la logique de distribution
interface DistributionCriterion {
    type: 'syllables' | 'phonemes' | 'categories' | 'graphemes' | 'frequencies' | 'structures' | 'graphemeDisplay';
    values: (string | number)[];
}

interface Combination {
    [key: string]: string | number;
}

export interface DistributionPreview {
    label: string;
    perValue: number;
    isSingleValue?: boolean;
}

/**
 * Sélectionne un nombre donné de mots avec une répartition équilibrée
 * selon les filtres actifs (best effort).
 */
export function selectRandomWords(
    count: number,
    words: Word[],
    filters: WordFilters
): Word[] {
    // 1. Identifier les critères de répartition (filtres multi-valeurs)
    const distributionCriteria = getDistributionCriteria(filters);

    // 2. Si aucun critère de distribution → sélection aléatoire simple
    if (distributionCriteria.length === 0) {
        return shuffleArray(words).slice(0, count);
    }

    // 3. Créer les combinaisons de critères (Produit cartésien)
    const combinations = createCombinations(distributionCriteria);

    // 4. Répartir équitablement (best effort)
    // On divise le nombre total demandé par le nombre de combinaisons
    const wordsPerCombination = Math.ceil(count / combinations.length);
    const selected: Word[] = [];
    const selectedIds = new Set<string>(); // Pour éviter les doublons

    // Pour chaque combinaison, on cherche des mots correspondants
    for (const combo of combinations) {
        const matching = words.filter(w => matchesCombination(w, combo));
        const shuffled = shuffleArray(matching);

        // On prend les mots qui ne sont pas déjà sélectionnés
        const candidates = shuffled.filter(w => !selectedIds.has(getWordUniqueId(w)));

        // On en prend jusqu'au quota par combinaison
        const toTake = Math.min(wordsPerCombination, candidates.length);
        const taken = candidates.slice(0, toTake);

        taken.forEach(w => {
            selected.push(w);
            selectedIds.add(getWordUniqueId(w));
        });

        // Si on a atteint le compte total, on arrête (optimisation, même si le slice final recoupe)
        if (selected.length >= count) break;
    }

    // 5. Compléter si nécessaire (best effort)
    // Si certaines combinaisons n'avaient pas assez de mots, on complète avec le reste du pool
    if (selected.length < count) {
        const remaining = words.filter(w => !selectedIds.has(getWordUniqueId(w)));
        const shuffled = shuffleArray(remaining);
        const needed = count - selected.length;

        shuffled.slice(0, needed).forEach(w => {
            selected.push(w);
            selectedIds.add(getWordUniqueId(w));
        });
    }

    // 6. Shuffle final et limiter au count exact
    return shuffleArray(selected).slice(0, count);
}

/**
 * Calcule la prévisualisation de la distribution pour l'UI
 */
export function calculateDistribution(
    count: number,
    filters: WordFilters
): DistributionPreview[] {
    const multiCriteria = getDistributionCriteria(filters);
    const singleCriteria = getSingleValueCriteria(filters);

    const result: DistributionPreview[] = multiCriteria.map(criterion => {
        const perValue = Math.round(count / criterion.values.length);
        const label = formatCriterionLabel(criterion);
        return { label, perValue };
    });

    singleCriteria.forEach(criterion => {
        result.push({
            label: formatCriterionLabel(criterion),
            perValue: count,
            isSingleValue: true
        });
    });

    return result;
}

// --- Fonctions Auxiliaires ---

// Génère un ID unique pour le dédoublonnage local (si pas d'uid sur le mot)
function getWordUniqueId(word: Word): string {
    return word.uid || `${word.MOTS}_${word.PHONEMES}_${word.SYNT}`;
}

// Identifier les filtres avec plusieurs valeurs actives
function getDistributionCriteria(filters: WordFilters): DistributionCriterion[] {
    const criteria: DistributionCriterion[] = [];

    // Syllabes (range) : Si min != max, on répartit sur chaque nombre de syllabes
    // Note: On limite raisonnablement l'écart pour éviter trop de combinaisons vides
    if (filters.minSyllables && filters.maxSyllables) {
        const range = filters.maxSyllables - filters.minSyllables + 1;
        if (range > 1) {
            criteria.push({
                type: 'syllables',
                values: Array.from({ length: range }, (_, i) => filters.minSyllables + i)
            });
        }
    }

    // Phonèmes (array) — only include tags participate in distribution
    const includePhonemes = (filters.phonemes || []).filter(t => (t.mode || 'include') === 'include');
    if (includePhonemes.length > 1) {
        criteria.push({
            type: 'phonemes',
            values: includePhonemes.map(t => t.value)
        });
    }

    // Catégories (array)
    // Note: WordFilters.categories est SyntCategory[]
    if (filters.categories && filters.categories.length > 1) {
        criteria.push({
            type: 'categories',
            values: filters.categories
        });
    }

    // Graphèmes (array) — only include tags participate in distribution
    const includeGraphemes = (filters.graphemes || []).filter(t => (t.mode || 'include') === 'include');
    if (includeGraphemes.length > 1) {
        criteria.push({
            type: 'graphemes',
            values: includeGraphemes.map(t => t.value)
        });
    }

    // Structures (array)
    if (filters.structures && filters.structures.length > 1) {
        criteria.push({
            type: 'structures',
            values: filters.structures
        });
    }

    // Fréquences (Appui Lexical) (array)
    if (filters.frequencies && filters.frequencies.length > 1) {
        criteria.push({
            type: 'frequencies',
            values: filters.frequencies
        });
    }

    // Complexité (Progression Graphèmes) (array)
    if (filters.graphemeDisplay && filters.graphemeDisplay.length > 1) {
        criteria.push({
            type: 'graphemeDisplay',
            values: filters.graphemeDisplay
        });
    }

    return criteria;
}

// Identifier les filtres avec exactement une valeur (pour affichage, pas de distribution)
function getSingleValueCriteria(filters: WordFilters): DistributionCriterion[] {
    const criteria: DistributionCriterion[] = [];

    // Only include tags show in distribution preview (exclude tags are already applied to results)
    const incPhonemes = (filters.phonemes || []).filter(t => (t.mode || 'include') === 'include');
    if (incPhonemes.length === 1) {
        criteria.push({ type: 'phonemes', values: incPhonemes.map(t => t.value) });
    }
    if (filters.categories && filters.categories.length === 1) {
        criteria.push({ type: 'categories', values: filters.categories });
    }
    const incGraphemes = (filters.graphemes || []).filter(t => (t.mode || 'include') === 'include');
    if (incGraphemes.length === 1) {
        criteria.push({ type: 'graphemes', values: incGraphemes.map(t => t.value) });
    }
    if (filters.structures && filters.structures.length === 1) {
        criteria.push({ type: 'structures', values: filters.structures });
    }
    if (filters.frequencies && filters.frequencies.length === 1) {
        criteria.push({ type: 'frequencies', values: filters.frequencies });
    }
    if (filters.graphemeDisplay && filters.graphemeDisplay.length === 1) {
        criteria.push({ type: 'graphemeDisplay', values: filters.graphemeDisplay });
    }

    return criteria;
}

// Créer toutes les combinaisons possibles (récursif)
function createCombinations(criteria: DistributionCriterion[]): Combination[] {
    if (criteria.length === 0) return [];
    if (criteria.length === 1) {
        return criteria[0].values.map(v => ({ [criteria[0].type]: v }));
    }

    const [first, ...rest] = criteria;
    const restCombos = createCombinations(rest);

    return first.values.flatMap(value =>
        restCombos.map(combo => ({ [first.type]: value, ...combo }))
    );
}

// Vérifier si un mot correspond à une combinaison de critères
function matchesCombination(word: Word, combo: Combination): boolean {
    for (const [type, value] of Object.entries(combo)) {
        switch (type) {
            case 'syllables':
                // word.NBSYLL est une string dans le type Word, on convertit
                if (parseInt(word.NBSYLL) !== value) return false;
                break;

            case 'phonemes':
                // Check if phoneme is present in word phonemes
                if (!word.PHONEMES.includes(String(value))) return false;
                break;

            case 'categories':
                if (word.SYNT !== value) return false;
                break;

            case 'graphemes':
                // Check simple de présence
                if (!word.MOTS.includes(String(value))) return false;
                break;

            case 'structures':
                if (word["progression structure"] !== value) return false;
                break;

            case 'frequencies':
                if (word["APPUI LEXICAL"] !== value) return false;
                break;

            case 'graphemeDisplay':
                if (word["progression graphèmes"] !== value) return false;
                break;
        }
    }
    return true;
}

// Shuffle Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Formattage des labels pour l'UI
function formatCriterionLabel(criterion: DistributionCriterion): string {
    const valuesStr = criterion.values.join(', ');
    switch (criterion.type) {
        case 'syllables':
            return `Syllabes (${valuesStr})`;
        case 'phonemes':
            return `Phonèmes (${valuesStr})`;
        case 'categories':
            // @ts-ignore
            return `Catégories (${criterion.values.map(v => SYNT_LABELS[String(v)] || v).join(', ')})`;
        case 'graphemes':
            return `Graphèmes (${valuesStr})`;
        case 'structures':
            // @ts-ignore
            return `Structures (${criterion.values.map(v => STRUCTURE_LABELS[String(v)] || v).join(', ')})`;
        case 'frequencies':
            // @ts-ignore
            return `Code Appui (${criterion.values.map(v => FREQUENCY_LABELS[String(v)] || v).join(', ')})`;
        case 'graphemeDisplay':
            // Utilisation de GRAPHEME_LABELS pour la complexité
            // @ts-ignore
            return `Complexité (${criterion.values.map(v => GRAPHEME_LABELS[String(v)] || v).join(', ')})`;
        default:
            return '';
    }
}
