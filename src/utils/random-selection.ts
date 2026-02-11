import { Word, WordFilters } from '@/types/word';

// Types internes pour la logique de distribution
interface DistributionCriterion {
    type: 'syllables' | 'phonemes' | 'positions' | 'categories' | 'graphemes';
    values: (string | number)[];
}

interface Combination {
    [key: string]: string | number;
}

export interface DistributionPreview {
    label: string;
    perValue: number;
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
    const criteria = getDistributionCriteria(filters);

    return criteria.map(criterion => {
        const perValue = Math.round(count / criterion.values.length);
        const label = formatCriterionLabel(criterion);
        return { label, perValue };
    });
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

    // Phonèmes (array)
    if (filters.phonemes && filters.phonemes.length > 1) {
        // On extrait les valeurs des FilterTag
        criteria.push({
            type: 'phonemes',
            values: filters.phonemes.map(t => t.value)
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

    // Graphèmes (array)
    if (filters.graphemes && filters.graphemes.length > 1) {
        criteria.push({
            type: 'graphemes',
            values: filters.graphemes.map(t => t.value)
        });
    }

    // On pourrait ajouter d'autres critères si nécessaire (structures, etc.)
    // Pour l' instant on se limite aux principaux demandés

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
                // Note: C'est une approximation, idéalement on checkerait GRAPHEMES si dispo et parsé
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
            return `Catégories (${valuesStr})`;
        case 'graphemes':
            return `Graphèmes (${valuesStr})`;
        default:
            return '';
    }
}
