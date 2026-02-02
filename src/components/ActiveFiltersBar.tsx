import { WordFilters, STRUCTURE_LABELS, GRAPHEME_LABELS } from "@/types/word";
import { X } from "lucide-react";

interface ActiveFiltersBarProps {
    filters: WordFilters;
    onRemoveFilter: (filterType: keyof WordFilters, value: string | number) => void;
    onClearAll: () => void;
}

export function ActiveFiltersBar({ filters, onRemoveFilter, onClearAll }: ActiveFiltersBarProps) {
    // Build list of active filters
    const activeFilters: Array<{ type: keyof WordFilters; value: string | number; label: string }> = [];

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

    // If no active filters, don't render
    if (activeFilters.length === 0) return null;

    return (
        <div className="px-8 py-[10px] bg-[rgb(var(--filter-surface))] border-b border-[rgb(var(--filter-border))] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[rgb(var(--filter-text-muted))] uppercase tracking-[0.8px] mr-1">
                Actifs :
            </span>
            {activeFilters.map((filter, i) => (
                <span
                    key={`${filter.type}-${filter.value}-${i}`}
                    className="inline-flex items-center gap-[6px] px-[10px] py-1 bg-[rgb(var(--filter-accent-light))] border border-[rgb(var(--filter-tag-active-border))] rounded-full text-xs font-semibold text-[rgb(var(--filter-accent))]"
                >
                    {filter.label}
                    <span
                        className="cursor-pointer text-sm leading-none opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveFilter(filter.type, filter.value)}
                    >
                        ×
                    </span>
                </span>
            ))}
            <span
                className="text-xs text-[rgb(var(--filter-text-muted))] cursor-pointer ml-1 hover:text-[#ef4444] transition-colors"
                onClick={onClearAll}
            >
                Effacer tout
            </span>
        </div>
    );
}
