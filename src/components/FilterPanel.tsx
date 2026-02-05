import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Box, Calculator, Type, Layers, BarChart3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
    WordFilters,
    STRUCTURE_LABELS,
    GRAPHEME_LABELS,
    FREQUENCY_LABELS,
    FilterTag
} from "@/types/word";
import { GraphemeFilter } from "./filters/GraphemeFilter";
import { PhonemeFilter } from "./filters/PhonemeFilter";
import { SearchFilter } from "./filters/SearchFilter";
import { FilterSection } from "./filters/FilterSection";
import { FilterGroup } from "./filters/FilterGroup";

interface FilterPanelProps {
    filters: WordFilters;
    updateFilter: <K extends keyof WordFilters>(key: K, value: WordFilters[K]) => void;
    toggleArrayFilter: <K extends keyof WordFilters>(
        key: K,
        value: WordFilters[K] extends (infer T)[] ? T : never
    ) => void;
    resetFilters: () => void;
    stats: any;
    resultCount: number;
    totalCount: number;
}

export function FilterPanel({ filters, updateFilter, toggleArrayFilter, resetFilters, stats, resultCount, totalCount }: FilterPanelProps) {

    // Collapsible state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        search: true,
        graphemes: true,
        phonemes: false,
        structures: true,
        graphemeDisplay: false,
        length: false,
        syllables: false,
        frequency: false,
    });

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddSearch = (tag: FilterTag) => {
        updateFilter('search', [...filters.search, tag]);
    };

    const handleRemoveSearch = (id: string) => {
        updateFilter('search', filters.search.filter(t => t.id !== id));
    };

    const handleAddGrapheme = (tag: FilterTag) => {
        updateFilter('graphemes', [...filters.graphemes, tag]);
    };

    const handleRemoveGrapheme = (id: string) => {
        updateFilter('graphemes', filters.graphemes.filter(t => t.id !== id));
    };

    const handleAddPhonemes = (tag: FilterTag) => {
        updateFilter('phonemes', [...filters.phonemes, tag]);
    };

    const handleRemovePhoneme = (id: string) => {
        updateFilter('phonemes', filters.phonemes.filter(t => t.id !== id));
    };

    return (
        <aside className="w-[300px] shrink-0 bg-[#f4f5f7] flex flex-col h-full border-r border-[#e4e6eb] shadow-[0_10px_20px_-4px_rgba(0,0,0,0.12)] z-10">
            {/* Header */}
            <div className="p-[22px] pb-[14px] bg-white">
                <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#1a1c23] mb-[2px]">
                    Filtres
                </h2>
                <p className="text-[12px] text-[#9ca3af]">
                    Affinez votre recherche
                </p>
            </div>

            <ScrollArea className="flex-1 bg-white">
                <div className="pb-6">

                    {/* ═══ GROUP 1: TEXTUEL (Violet) ═══ */}
                    <FilterGroup label="Textuel" variant="text" />

                    <SearchFilter
                        isOpen={openSections.search || false}
                        onToggle={() => toggleSection('search')}
                        searchTags={filters.search}
                        onAddFilter={handleAddSearch}
                        onRemoveFilter={handleRemoveSearch}
                    />

                    <GraphemeFilter
                        isOpen={openSections.graphemes || false}
                        onToggle={() => toggleSection('graphemes')}
                        graphemes={filters.graphemes}
                        onAddFilter={handleAddGrapheme}
                        onRemoveFilter={handleRemoveGrapheme}
                    />

                    <PhonemeFilter
                        isOpen={openSections.phonemes || false}
                        onToggle={() => toggleSection('phonemes')}
                        phonemes={filters.phonemes}
                        onAddFilter={handleAddPhonemes}
                        onRemoveFilter={handleRemovePhoneme}
                    />

                    {/* ═══ GROUP 2: STRUCTURE (Cyan) ═══ */}
                    <FilterGroup label="Structure" variant="struct" />

                    <FilterSection
                        title="Structures"
                        icon={<Box className="w-3.5 h-3.5 text-[rgb(var(--cat-struct))]" />}
                        badge={filters.structures.length}
                        isOpen={openSections.structures || false}
                        onToggle={() => toggleSection('structures')}
                        variant="struct"
                    >
                        <div className="space-y-1">
                            {Object.entries(STRUCTURE_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.structures.includes(key)}
                                        onChange={() => toggleArrayFilter('structures', key)}
                                        className="rounded border-slate-300 text-[rgb(var(--cat-struct))] focus:ring-[rgb(var(--cat-struct))]"
                                    />
                                    <span className="text-[12px] text-slate-600 group-hover:text-slate-900">{label}</span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    <FilterSection
                        title="Complexité (G)"
                        icon={<Calculator className="w-3.5 h-3.5 text-[rgb(var(--cat-struct))]" />}
                        badge={filters.graphemeDisplay.length}
                        isOpen={openSections.graphemeDisplay || false}
                        onToggle={() => toggleSection('graphemeDisplay')}
                        variant="struct"
                    >
                        <div className="space-y-1">
                            {Object.entries(GRAPHEME_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.graphemeDisplay.includes(key)}
                                        onChange={() => toggleArrayFilter('graphemeDisplay', key)}
                                        className="rounded border-slate-300 text-[rgb(var(--cat-struct))] focus:ring-[rgb(var(--cat-struct))]"
                                    />
                                    <span className="text-[12px] text-slate-600 group-hover:text-slate-900">
                                        {label.split('(')[0].trim()}
                                        <span className="text-[10px] text-slate-400 ml-1">
                                            ({label.split('(')[1]?.replace(')', '')})
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* ═══ GROUP 3: MÉTRIQUES (Ambre) ═══ */}
                    <FilterGroup label="Métriques" variant="metric" />

                    <FilterSection
                        title="Longueur"
                        icon={<Type className="w-3.5 h-3.5 text-[rgb(var(--cat-metric))]" />}
                        badge={(filters.minLetters !== 1 || filters.maxLetters !== 14) ? 1 : 0}
                        isOpen={openSections.length || false}
                        onToggle={() => toggleSection('length')}
                        variant="metric"
                    >
                        <div className="space-y-4 px-1 pb-2 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-[rgb(var(--filter-text-secondary))]">
                                    Longueur du mot
                                </span>
                                <span className="text-[12px] font-bold text-[rgb(var(--filter-text-primary))] bg-[rgb(var(--filter-bg))] px-2 py-0.5 rounded">
                                    {filters.minLetters === filters.maxLetters
                                        ? `${filters.minLetters} lettres`
                                        : `${filters.minLetters} - ${filters.maxLetters}`}
                                </span>
                            </div>
                            <div className="px-2">
                                {/* Using native range inputs temporarily if slider component needs updating, or check Slider usage */}
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min={1} max={25}
                                        value={filters.minLetters}
                                        onChange={(e) => updateFilter('minLetters', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(var(--cat-metric))]"
                                    />
                                </div>
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection
                        title="Syllabes"
                        icon={<Layers className="w-3.5 h-3.5 text-[rgb(var(--cat-metric))]" />}
                        badge={(filters.minSyllables !== 1 || filters.maxSyllables !== 8) ? 1 : 0}
                        isOpen={openSections.syllables || false}
                        onToggle={() => toggleSection('syllables')}
                        variant="metric"
                    >
                        <div className="space-y-4 px-1 pb-2 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-[rgb(var(--filter-text-secondary))]">
                                    Nombre de syllabes
                                </span>
                                <span className="text-[12px] font-bold text-[rgb(var(--filter-text-primary))] bg-[rgb(var(--filter-bg))] px-2 py-0.5 rounded">
                                    {filters.minSyllables === filters.maxSyllables
                                        ? `${filters.minSyllables}`
                                        : `${filters.minSyllables} - ${filters.maxSyllables}`}
                                </span>
                            </div>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min={1} max={8}
                                    value={filters.minSyllables}
                                    onChange={(e) => updateFilter('minSyllables', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(var(--cat-metric))]"
                                />
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection
                        title="Fréquence"
                        icon={<BarChart3 className="w-3.5 h-3.5 text-[rgb(var(--cat-metric))]" />}
                        badge={filters.frequencies.length}
                        isOpen={openSections.frequency || false}
                        onToggle={() => toggleSection('frequency')}
                        variant="metric"
                    >
                        <div className="space-y-1">
                            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.frequencies.includes(key)}
                                        onChange={() => toggleArrayFilter('frequencies', key)}
                                        className="rounded border-slate-300 text-[rgb(var(--cat-metric))] focus:ring-[rgb(var(--cat-metric))]"
                                    />
                                    <span className="text-[12px] text-slate-600 group-hover:text-slate-900">{label}</span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    <div className="h-4" />

                    {/* Legend */}
                    <div className="mx-[22px] pt-[14px] border-t border-[#e4e6eb] flex gap-[14px]">
                        <div className="flex items-center gap-[5px] text-[10px] font-medium text-[#9ca3af]">
                            <div className="w-[7px] h-[7px] rounded-[3px] bg-[rgb(var(--cat-text))]"></div>
                            Textuel
                        </div>
                        <div className="flex items-center gap-[5px] text-[10px] font-medium text-[#9ca3af]">
                            <div className="w-[7px] h-[7px] rounded-[3px] bg-[rgb(var(--cat-struct))]"></div>
                            Structure
                        </div>
                        <div className="flex items-center gap-[5px] text-[10px] font-medium text-[#9ca3af]">
                            <div className="w-[7px] h-[7px] rounded-[3px] bg-[rgb(var(--cat-metric))]"></div>
                            Métriques
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </aside>
    );
}
