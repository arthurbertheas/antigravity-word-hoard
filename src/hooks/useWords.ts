import { useState, useMemo } from 'react';
import wordsData from '../data/words.json';
import { Word, WordFilters, DEFAULT_FILTERS } from '../types/word';

const words = wordsData as Word[];

export function useWords() {
    const [filters, setFilters] = useState<WordFilters>(DEFAULT_FILTERS);

    const filteredWords = useMemo(() => {
        return words.filter((word) => {
            // Recherche textuelle sur l'orthographe
            if (filters.search && !word.ORTHO.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Recherche phonétique
            if (filters.phonSearch && !word.PHON.toLowerCase().includes(filters.phonSearch.toLowerCase())) {
                return false;
            }

            // Filtre par catégorie syntaxique
            if (filters.categories.length > 0 && !filters.categories.includes(word.SYNT as any)) {
                return false;
            }

            // Filtre par nombre de syllabes
            if (filters.syllables.length > 0) {
                const nbSyll = parseInt(word.NBSYLL, 10);
                if (!filters.syllables.includes(nbSyll)) {
                    return false;
                }
            }

            // Filtre par code structure
            if (filters.structures.length > 0 && !filters.structures.includes(word["code structure"])) {
                return false;
            }

            // Filtre par code graphèmes
            if (filters.graphemes.length > 0 && !filters.graphemes.includes(word["code graphèmes"])) {
                return false;
            }

            // Filtre par code fréquence
            if (filters.frequencies.length > 0) {
                const codeFreq = word["code fréquence"];
                if (codeFreq && !filters.frequencies.includes(codeFreq)) {
                    return false;
                }
            }

            // Filtre par longueur (nombre de lettres)
            let nbLet = parseInt(word.NBLET, 10);
            if (isNaN(nbLet)) {
                nbLet = word.ORTHO.length; // Fallback sur la longueur du mot orthographique
            }

            if (nbLet < filters.minLetters || nbLet > filters.maxLetters) {
                return false;
            }

            return true;
        });
    }, [filters]);

    const updateFilter = <K extends keyof WordFilters>(
        key: K,
        value: WordFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const toggleArrayFilter = <K extends keyof WordFilters>(
        key: K,
        value: WordFilters[K] extends (infer T)[] ? T : never
    ) => {
        setFilters((prev) => {
            const currentArray = prev[key] as any[];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((v) => v !== value)
                : [...currentArray, value];
            return { ...prev, [key]: newArray };
        });
    };

    // Statistiques
    const stats = useMemo(() => {
        const categories: Record<string, number> = {};
        const syllables: Record<number, number> = {};
        const structures: Record<string, number> = {};
        const graphemes: Record<string, number> = {};

        filteredWords.forEach((word) => {
            // Catégories
            categories[word.SYNT] = (categories[word.SYNT] || 0) + 1;

            // Syllabes
            const nbSyll = parseInt(word.NBSYLL, 10);
            syllables[nbSyll] = (syllables[nbSyll] || 0) + 1;

            // Structures
            const struct = word["code structure"];
            structures[struct] = (structures[struct] || 0) + 1;

            // Graphèmes
            const graph = word["code graphèmes"];
            graphemes[graph] = (graphemes[graph] || 0) + 1;
        });

        return { categories, syllables, structures, graphemes };
    }, [filteredWords]);

    return {
        words: filteredWords,
        totalWords: words.length,
        filters,
        updateFilter,
        resetFilters,
        toggleArrayFilter,
        stats
    };
}
