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

    // Search (Advanced)
    filters.search.forEach(s => {
        const pos = s.position === 'start' ? 'début' : s.position === 'end' ? 'fin' : s.position === 'middle' ? 'milieu' : 'partout';
        activeFilters.push({
            type: 'search',
            value: s.id,
            label: `${s.value} (${pos})`
        });
    });



    // Structures
    filters.structures.forEach(s => {
        activeFilters.push({
            type: 'structures',
            value: s,
            label: STRUCTURE_LABELS[s]
        });
    });

    // Graphemes (Complexity - renamed)
    filters.graphemeDisplay.forEach(g => {
        activeFilters.push({
            type: 'graphemeDisplay',
            value: g,
            label: GRAPHEME_LABELS[g]
        });
    });

    // Graphèmes (Text)
    filters.graphemes.forEach(g => {
        const pos = g.position === 'start' ? 'début' : g.position === 'end' ? 'fin' : g.position === 'middle' ? 'milieu' : 'partout';
        activeFilters.push({
            type: 'graphemes',
            value: g.id,
            label: `${g.value} (${pos})`
        });
    });

    // Phonèmes
    filters.phonemes.forEach(p => {
        const pos = p.position === 'start' ? 'début' : p.position === 'end' ? 'fin' : p.position === 'middle' ? 'milieu' : 'partout';
        activeFilters.push({
            type: 'phonemes',
            value: p.id,
            label: `[${p.value}] (${pos})`
        });
    });

    // Syllabes (range)
    if (filters.minSyllables !== 1 || filters.maxSyllables !== 5) {
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

    // If no active filters, don't render
    if (activeFilters.length === 0) return null;

    return (
        <div className="px-8 py-2.5 bg-background border-b border-border flex items-center gap-2 flex-wrap min-h-[48px]">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mr-1">
                ACTIFS :
            </span>
            {activeFilters.map((filter, i) => (
                <button
                    key={`${filter.type}-${filter.value}-${i}`}
                    onClick={() => onRemoveFilter(filter.type, filter.value)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eef2ff] border border-[#c7d2fe] hover:border-[#4f46e5]/40 hover:bg-[#e0e7ff] rounded-full text-xs font-semibold text-[#4f46e5] transition-all cursor-pointer shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                >
                    <span className="max-w-[200px] truncate">
                        {filter.label}
                    </span>
                    <X className="w-3 h-3 text-[#4f46e5]/50 group-hover:text-[#4f46e5] transition-colors" />
                </button>
            ))}
            <button
                className="text-xs font-bold text-muted-foreground hover:text-red-500 ml-2 transition-colors uppercase tracking-tight"
                onClick={onClearAll}
            >
                Effacer tout
            </button>
        </div>
    );
}
