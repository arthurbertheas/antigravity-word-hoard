import { WordFilters, STRUCTURE_LABELS, GRAPHEME_LABELS, FREQUENCY_LABELS } from "@/types/word";
import { X } from "lucide-react";

interface ActiveFiltersBarProps {
    filters: WordFilters;
    onRemoveFilter: (filterType: keyof WordFilters, value: any) => void;
    onClearAll: () => void;
}

export function ActiveFiltersBar({ filters, onRemoveFilter, onClearAll }: ActiveFiltersBarProps) {
    // Build list of active filters
    const activeFilters: Array<{ type: keyof WordFilters; value: any; label: string }> = [];

    // Structures
    filters.structures.forEach(s => {
        activeFilters.push({
            type: 'structures',
            value: s,
            label: STRUCTURE_LABELS[s]
        });
    });

    // Graphemes
    filters.graphemes.forEach(g => {
        activeFilters.push({
            type: 'graphemes',
            value: g,
            label: GRAPHEME_LABELS[g]
        });
    });

    // Syllabes (range)
    if (filters.minSyllables !== 1 || filters.maxSyllables !== 4) {
        activeFilters.push({
            type: 'minSyllables',
            value: 'reset',
            label: `Syllabes: ${filters.minSyllables}-${filters.maxSyllables}`
        });
    }

    // Fréquences
    filters.frequencies.forEach(f => {
        activeFilters.push({
            type: 'frequencies',
            value: f,
            label: FREQUENCY_LABELS[f]
        });
    });

    // Longueur (si différent des valeurs par défaut 1-20)
    if (filters.minLetters !== 1 || filters.maxLetters !== 20) {
        activeFilters.push({
            type: 'minLetters', // On utilise minLetters comme pivot pour la suppression de la longueur
            value: 'reset',
            label: `Longueur: ${filters.minLetters}-${filters.maxLetters}`
        });
    }

    // If no active filters, don't render
    if (activeFilters.length === 0) return null;

    return (
        <div className="px-8 py-2.5 bg-background border-b border-border flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Actifs :
            </span>
            {activeFilters.map((filter, i) => (
                <span
                    key={`${filter.type}-${filter.value}-${i}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef2ff] border border-[#c7d2fe] rounded-full text-xs font-semibold text-[#4f46e5]"
                >
                    {filter.label}
                    <button
                        className="hover:opacity-70 transition-opacity ml-0.5"
                        onClick={() => onRemoveFilter(filter.type, filter.value)}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <button
                className="text-xs text-muted-foreground hover:text-destructive ml-1 transition-colors"
                onClick={onClearAll}
            >
                Effacer tout
            </button>
        </div>
    );
}
