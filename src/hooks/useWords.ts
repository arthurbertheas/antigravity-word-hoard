import { useState, useMemo } from 'react';
import wordsData from '../data/words.json';
import { Word, WordFilters, DEFAULT_FILTERS, FilterTag } from '../types/word';

const words = (wordsData as any[]).map(w => ({
    ...w,
    PHONEMES: w.PHONEMES || ''
})) as Word[];

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyTagFilter(tags: FilterTag[], matchFn: (tag: FilterTag) => boolean): boolean {
    const inc = tags.filter(t => (t.mode || 'include') === 'include');
    const exc = tags.filter(t => t.mode === 'exclude');
    if (inc.length > 0 && !inc.some(matchFn)) return false;
    if (exc.length > 0 && exc.some(matchFn)) return false;
    return true;
}

export function useWords() {
    const [filters, setFilters] = useState<WordFilters>(DEFAULT_FILTERS);

    const filteredWords = useMemo(() => {
        return words.filter((word) => {
            // Recherche textuelle avancée (MOTS)

            // 1. Recherche Temps Réel (prioritaire sur les tags)
            if (filters.realtimeSearch && filters.realtimeSearch.value.trim().length > 0) {
                if (!word.MOTS) return false;
                const ortho = word.MOTS.toLowerCase();
                const val = filters.realtimeSearch.value.toLowerCase().trim();
                const pos = filters.realtimeSearch.position;
                const isExclude = filters.realtimeSearch.mode === 'exclude';

                let matches = false;
                if (pos === 'start') matches = ortho.startsWith(val);
                else if (pos === 'end') matches = ortho.endsWith(val);
                else if (pos === 'middle') matches = new RegExp(`.+${escapeRegExp(val)}.+`).test(ortho);
                else matches = ortho.includes(val);

                if (isExclude ? matches : !matches) return false;
            }

            // 2. Recherche par Tags (include = OR union, exclude = AND NOT)
            if (filters.search.length > 0) {
                if (!word.MOTS) return false;
                const ortho = word.MOTS.toLowerCase();
                const pass = applyTagFilter(filters.search, (tag) => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return ortho.startsWith(val);
                    if (tag.position === 'end') return ortho.endsWith(val);
                    if (tag.position === 'middle') return new RegExp(`.+${escapeRegExp(val)}.+`).test(ortho);
                    return ortho.includes(val);
                });
                if (!pass) return false;
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

            // Filtre par code structure (progression structure)
            if (filters.structures.length > 0 && !filters.structures.includes(word["progression structure"])) {
                return false;
            }

            // Filtre par code graphèmes (progression graphèmes)
            if (filters.graphemeDisplay.length > 0 && !filters.graphemeDisplay.includes(word["progression graphèmes"])) {
                return false;
            }

            // Filtre graphème temps réel (prioritaire sur les tags)
            if (filters.realtimeGrapheme && filters.realtimeGrapheme.value.trim().length > 0) {
                const isExclude = filters.realtimeGrapheme.mode === 'exclude';
                if (!word["segmentation graphèmes"]) {
                    if (!isExclude) return false;
                } else {
                    const gseg = word["segmentation graphèmes"].toLowerCase();
                    const segments = gseg.split('-').filter(Boolean);
                    const val = filters.realtimeGrapheme.value.toLowerCase().trim();
                    const pos = filters.realtimeGrapheme.position;

                    let matches = false;
                    if (pos === 'start') matches = segments[0] === val;
                    else if (pos === 'end') matches = segments[segments.length - 1] === val;
                    else if (pos === 'middle') matches = segments.some((seg, index) => seg === val && index > 0 && index < segments.length - 1);
                    else matches = segments.includes(val);

                    if (isExclude ? matches : !matches) return false;
                }
            }

            // Filtre phonèmes temps réel (OR logic — union des résultats, inverted in exclude mode)
            if (filters.realtimePhonemes && filters.realtimePhonemes.values.length > 0) {
                const isExclude = filters.realtimePhonemes.mode === 'exclude';
                if (!word.PHONEMES) {
                    if (!isExclude) return false;
                } else {
                    const segments = word.PHONEMES.toLowerCase().split('.').filter(Boolean);
                    const pos = filters.realtimePhonemes.position;

                    const anyMatch = filters.realtimePhonemes.values.some(ph => {
                        const val = ph.toLowerCase();
                        if (pos === 'start') return segments[0] === val;
                        if (pos === 'end') return segments[segments.length - 1] === val;
                        if (pos === 'middle') return segments.some((seg, i) => seg === val && i > 0 && i < segments.length - 1);
                        return segments.includes(val);
                    });
                    if (isExclude ? anyMatch : !anyMatch) return false;
                }
            }

            // Filtre par graphèmes spécifiques (include = OR union, exclude = AND NOT)
            if (filters.graphemes.length > 0) {
                if (!word["segmentation graphèmes"]) return false;
                const gseg = word["segmentation graphèmes"].toLowerCase();
                const segments = gseg.split('-').filter(Boolean);

                const pass = applyTagFilter(filters.graphemes, (tag) => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return segments[0] === val;
                    if (tag.position === 'end') return segments[segments.length - 1] === val;
                    if (tag.position === 'middle') {
                        return segments.some((seg, index) =>
                            seg === val && index > 0 && index < segments.length - 1
                        );
                    }
                    return segments.includes(val);
                });
                if (!pass) return false;
            }

            // Filtre par phonèmes spécifiques (include = OR union, exclude = AND NOT)
            if (filters.phonemes.length > 0) {
                if (!word.PHONEMES) return false;
                const segments = word.PHONEMES.toLowerCase().split('.').filter(Boolean);
                const pass = applyTagFilter(filters.phonemes, (tag) => {
                    const val = tag.value.toLowerCase();
                    if (tag.position === 'start') return segments[0] === val;
                    if (tag.position === 'end') return segments[segments.length - 1] === val;
                    if (tag.position === 'middle') return segments.some((seg, i) => seg === val && i > 0 && i < segments.length - 1);
                    return segments.includes(val);
                });
                if (!pass) return false;
            }

            // Filtre par code fréquence (APPUI LEXICAL)
            if (filters.frequencies.length > 0) {
                const codeFreq = word["APPUI LEXICAL"];
                if (codeFreq && !filters.frequencies.includes(codeFreq)) {
                    return false;
                }
            }

            // Filtre par image associée
            if (filters.hasImage !== null) {
                const hasAssociatedImage = word["image associée"] && word["image associée"].trim().length > 0;
                if (filters.hasImage && !hasAssociatedImage) {
                    return false; // On veut des images, mais ce mot n'en a pas
                }
                if (!filters.hasImage && hasAssociatedImage) {
                    return false; // On ne veut pas d'images, mais ce mot en a une
                }
            }

            // Filtre par longueur (nombre de lettres) - calculé sur MOTS en V7
            const nbLet = word.MOTS.length;
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
            if (!isNaN(nbSyll)) {
                syllables[nbSyll] = (syllables[nbSyll] || 0) + 1;
            }

            // Structures
            const struct = word["progression structure"];
            if (struct) {
                structures[struct] = (structures[struct] || 0) + 1;
            }

            // Graphèmes
            const graph = word["progression graphèmes"];
            if (graph) {
                graphemes[graph] = (graphemes[graph] || 0) + 1;
            }
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
