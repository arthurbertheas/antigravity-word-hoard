import { useState, useMemo } from 'react';
import wordsData from '../data/words.json';
import { Word, WordFilters, DEFAULT_FILTERS } from '../types/word';

const words = (wordsData as any[]).map(w => ({
    ...w,
    PHON: w.PHON || (w.PSEG ? w.PSEG.replace(/[.#]/g, '') : '')
})) as Word[];

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function useWords() {
    const [filters, setFilters] = useState<WordFilters>(DEFAULT_FILTERS);

    const filteredWords = useMemo(() => {
        return words.filter((word) => {
            // Recherche textuelle avancée (ORTHO) - [MODIFIÉ: Supporte maintenant les tags multiples et positions]
            if (filters.search.length > 0) {
                if (!word.ORTHO) return false;
                const ortho = word.ORTHO.toLowerCase();
                const allMatch = filters.search.every(tag => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return ortho.startsWith(val);
                    if (tag.position === 'end') return ortho.endsWith(val);
                    if (tag.position === 'middle') return new RegExp(`.+${escapeRegExp(val)}.+`).test(ortho);
                    return ortho.includes(val);
                });
                if (!allMatch) return false;
            }

            // Filtre par catégorie syntaxique
            if (filters.categories.length > 0 && !filters.categories.includes(word.SYNT as any)) {
                return false;
            }

            // Filtre par nombre de syllabes (range)
            const nbSyll = parseInt(word.NBSYLL, 10);
            if (!isNaN(nbSyll)) {
                if (nbSyll < filters.minSyllables || nbSyll > filters.maxSyllables) {
                    return false;
                }
            }

            // Filtre par code structure
            if (filters.structures.length > 0 && !filters.structures.includes(word["code structure"])) {
                return false;
            }

            // Filtre par code graphèmes (renamed from graphemes to graphemeDisplay in UI)
            if (filters.graphemeDisplay.length > 0 && !filters.graphemeDisplay.includes(word["code graphèmes"])) {
                return false;
            }

            // [NOUVEAU] Filtre par graphèmes spécifiques (AND logic)
            if (filters.graphemes.length > 0) {
                if (!word.GSEG) return false;
                const gseg = word.GSEG.toLowerCase();
                // GSEG est de la forme .g.r.a.ph.e
                const segments = gseg.split('.').filter(Boolean); // ["g", "r", "a", "ph", "e"]

                const allMatch = filters.graphemes.every(tag => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return segments[0] === val;
                    if (tag.position === 'end') return segments[segments.length - 1] === val;
                    if (tag.position === 'middle') {
                        // Présent mais pas au début ni à la fin
                        const firstIndex = segments.indexOf(val);
                        const lastIndex = segments.lastIndexOf(val);
                        // Doit être présent
                        if (firstIndex === -1) return false;
                        // Si l'unique occurrence est au début ou à la fin, ce n'est pas "milieu"
                        // Mais attention, s'il y a plusieurs occurrences (ex : "t" dans "tente"),
                        // si l'une d'elles est au milieu, c'est bon ?
                        // Logic "Middle": Is there ANY occurrence at an index that is NOT 0 and NOT length-1?
                        return segments.some((seg, index) =>
                            seg === val && index > 0 && index < segments.length - 1
                        );
                    }
                    return segments.includes(val);
                });
                if (!allMatch) return false;
            }

            // [NOUVEAU] Filtre par phonèmes spécifiques (AND logic)
            if (filters.phonemes.length > 0) {
                if (!word.PHON) return false;
                const phon = word.PHON.toLowerCase();
                const allMatch = filters.phonemes.every(tag => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return phon.startsWith(val);
                    if (tag.position === 'end') return phon.endsWith(val);
                    if (tag.position === 'middle') return new RegExp(`.+${escapeRegExp(val)}.+`).test(phon);
                    return phon.includes(val);
                });
                if (!allMatch) return false;
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
