import { WordFilters, STRUCTURE_LABELS, GRAPHEME_LABELS, FREQUENCY_LABELS } from "@/types/word";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveFiltersBarProps {
    filters: WordFilters;
    onRemoveFilter: (filterType: keyof WordFilters, value: any) => void;
    onClearAll: () => void;
}

export function ActiveFiltersBar({ filters, onRemoveFilter, onClearAll }: ActiveFiltersBarProps) {
    // Build list of active filters
    const activeFilters: Array<{ type: keyof WordFilters; value: any; label: string; isExclude?: boolean }> = [];

    // Search (Advanced)
    filters.search.forEach(s => {
        const pos = s.position === 'start' ? 'début' : s.position === 'end' ? 'fin' : s.position === 'middle' ? 'milieu' : 'partout';
        const isExc = s.mode === 'exclude';
        activeFilters.push({
            type: 'search',
            value: s.id,
            label: `${isExc ? 'Sans ' : ''}${s.value} (${pos})`,
            isExclude: isExc
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
        const isExc = g.mode === 'exclude';
        activeFilters.push({
            type: 'graphemes',
            value: g.id,
            label: `${isExc ? 'Sans ' : ''}${g.value} (${pos})`,
            isExclude: isExc
        });
    });

    // Phonèmes
    filters.phonemes.forEach(p => {
        const pos = p.position === 'start' ? 'début' : p.position === 'end' ? 'fin' : p.position === 'middle' ? 'milieu' : 'partout';
        const isExc = p.mode === 'exclude';
        activeFilters.push({
            type: 'phonemes',
            value: p.id,
            label: `${isExc ? 'Sans ' : ''}[${p.value}] (${pos})`,
            isExclude: isExc
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

    // Images (only show when enabled)
    if (filters.hasImage === true) {
        activeFilters.push({
            type: 'hasImage',
            value: 'reset',
            label: 'Avec image'
        });
    }

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
                    className={cn(
                        "group inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm hover:translate-y-[-1px] active:translate-y-0",
                        filter.isExclude
                            ? "bg-red-50 border-red-200 text-red-500 hover:border-red-400 hover:bg-red-100"
                            : "bg-[#eef2ff] border-[#c7d2fe] text-[#4f46e5] hover:border-[#4f46e5]/40 hover:bg-[#e0e7ff]"
                    )}
                >
                    <span className="max-w-[200px] truncate">
                        {filter.label}
                    </span>
                    <X className={cn(
                        "w-3 h-3 transition-colors",
                        filter.isExclude
                            ? "text-red-400 group-hover:text-red-600"
                            : "text-[#4f46e5]/50 group-hover:text-[#4f46e5]"
                    )} />
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
