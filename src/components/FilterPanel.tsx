import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ALargeSmall, Pencil, MessageSquare, Layers, BarChart3, Binary } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
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
    stats: {
        categories: Record<string, number>;
        syllables: Record<number, number>;
        structures: Record<string, number>;
        graphemes: Record<string, number>;
    };
    resultCount: number;
    totalCount: number;
}

// Level color mapping for structure codes
const STRUCTURE_LEVEL_COLORS: Record<string, string> = {
    'a': 'level-1',
    'b': 'level-2',
    'c': 'level-3',
    'd': 'level-4',
    'e': 'level-4b',
    'f': 'level-5',
    'g': 'level-6',
};

// Level color mapping for grapheme codes
const GRAPHEME_LEVEL_COLORS: Record<string, string> = {
    '1': 'level-1',
    '2': 'level-2',
    '3': 'level-3',
    '4': 'level-4',
    '5': 'level-5',
    '6': 'level-6',
    '7': 'level-7',
    '8': 'level-8',
    '9': 'level-1',
    '10': 'level-2',
    '11': 'level-3',
    '12': 'level-4',
    '13': 'level-5',
};

// Level badge color classes (matching ticket requirements)
const LEVEL_COLORS: Record<string, string> = {
    'level-1': 'bg-green-100 text-green-700',
    'level-2': 'bg-green-50 text-green-600',
    'level-3': 'bg-yellow-100 text-yellow-700',
    'level-4': 'bg-orange-100 text-orange-600',
    'level-4b': 'bg-orange-200 text-orange-700',
    'level-5': 'bg-red-100 text-red-600',
    'level-6': 'bg-purple-100 text-purple-600',
    'level-7': 'bg-blue-100 text-blue-600',
    'level-8': 'bg-indigo-100 text-indigo-600',
};

interface FilterOptionProps {
    code: string;
    label: string;
    description?: string;
    isActive: boolean;
    onToggle: () => void;
    levelColor: string;
}

function FilterOption({ code, label, description, isActive, onToggle, levelColor }: FilterOptionProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-[10px] px-3 py-2 rounded-lg cursor-pointer transition-all mb-1",
                "hover:bg-[rgb(var(--filter-surface-hover))]",
                isActive && "bg-[rgb(var(--filter-accent-light))]"
            )}
            onClick={onToggle}
        >
            {/* Custom Radio */}
            <div className={cn(
                "mt-[3px] w-4 h-4 min-w-4 border-2 rounded-full flex items-center justify-center transition-all",
                isActive
                    ? "border-[rgb(var(--filter-accent))] bg-[rgb(var(--filter-accent))]"
                    : "border-[rgb(var(--filter-border))] bg-white"
            )}>
                <div className={cn(
                    "w-[6px] h-[6px] rounded-full bg-white transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                )} />
            </div>

            {/* Level Badge */}
            <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 min-w-6 rounded-[6px] text-xs font-bold font-sora",
                LEVEL_COLORS[levelColor]
            )}>
                {code}
            </span>

            {/* Text */}
            <div className="flex-1">
                <div className={cn(
                    "text-[13px] font-medium transition-all",
                    isActive
                        ? "text-[rgb(var(--filter-accent))] font-semibold"
                        : "text-[rgb(var(--filter-text-primary))]"
                )}>
                    {label}
                </div>
                {description && (
                    <div className="text-[11px] text-[rgb(var(--filter-text-muted))] mt-[1px]">
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

export function FilterPanel({
    filters,
    updateFilter,
    toggleArrayFilter,
    stats,
}: FilterPanelProps) {
    const structures = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const graphemeCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

    // Collapsible state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        search: true, // NEW
        structures: true,
        graphemeDisplay: false, // Renamed from graphemes
        graphemes: true, // New text filter
        phonemes: true, // New text filter
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Extract descriptions from labels
    const getStructureDescription = (code: string): string | undefined => {
        const label = STRUCTURE_LABELS[code];
        if (label.includes('(')) {
            return label.split('(')[1].replace(')', '');
        }
        return undefined;
    };

    const getStructureLabel = (code: string): string => {
        const label = STRUCTURE_LABELS[code];
        return label.split('(')[0].trim();
    };

    const getGraphemeDescription = (code: string): string | undefined => {
        const label = GRAPHEME_LABELS[code];
        if (label.includes('(')) {
            return label.split('(')[1].replace(')', '');
        }
        return undefined;
    };

    const getGraphemeLabel = (code: string): string => {
        const label = GRAPHEME_LABELS[code];
        return label.split('(')[0].trim();
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
        updateFilter('graphemes', filters.graphemes.filter(g => g.id !== id));
    };

    const handleAddPhonemes = (tags: FilterTag[]) => {
        updateFilter('phonemes', [...filters.phonemes, ...tags]);
    };

    const handleRemovePhoneme = (id: string) => {
        updateFilter('phonemes', filters.phonemes.filter(g => g.id !== id));
    };

    return (
        <aside className="w-[300px] min-w-[300px] h-full bg-[rgb(var(--filter-surface))] border-r border-[rgb(var(--filter-border))] flex flex-col font-['DM_Sans'] z-10 overflow-hidden">
            {/* Header */}
            <div className="px-[22px] pt-6 pb-2">
                <h2 className="font-sora text-lg font-bold text-[rgb(var(--filter-text-primary))] mb-[2px]">
                    Filtres
                </h2>
                <p className="text-xs text-[rgb(var(--filter-text-muted))]">
                    Affinez votre recherche
                </p>
            </div>

            {/* Scrollable Sections */}
            <div className="flex-1 overflow-y-auto py-2 pb-6 scrollbar-thin scrollbar-thumb-[rgb(var(--filter-border))]">

                {/* [NEW] GROUP: TEXTUEL */}
                <FilterGroup label="Textuel" variant="text" />

                <SearchFilter
                    isOpen={openSections.search || false}
                    onToggle={() => toggleSection('search')}
                    searchTags={filters.search}
                    onAddFilter={handleAddSearch}
                    onRemoveFilter={handleRemoveSearch}
                />

                {/* [NEW] GRAPHÈMES */}
                <GraphemeFilter
                    isOpen={openSections.graphemes || false}
                    onToggle={() => toggleSection('graphemes')}
                    graphemes={filters.graphemes}
                    onAddFilter={handleAddGrapheme}
                    onRemoveFilter={handleRemoveGrapheme}
                />

                {/* [NEW] PHONÈMES */}
                <PhonemeFilter
                    isOpen={openSections.phonemes || false}
                    onToggle={() => toggleSection('phonemes')}
                    phonemes={filters.phonemes}
                    onAddFilter={handleAddPhonemes}
                    onRemoveFilter={handleRemovePhoneme}
                />

                {/* [NEW] GROUP: STRUCTURE */}
                <FilterGroup label="Structure" variant="struct" />

                {/* Structure syllabique */}
                <FilterSection
                    title="Structures"
                    icon={<Layers className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
                    badge={filters.structures.length}
                    isOpen={openSections.structures}
                    onToggle={() => toggleSection('structures')}
                >
                    <div className="space-y-0">
                        {structures.map((code) => (
                            <FilterOption
                                key={code}
                                code={code}
                                label={getStructureLabel(code)}
                                description={getStructureDescription(code)}
                                isActive={filters.structures.includes(code)}
                                onToggle={() => toggleArrayFilter('structures', code)}
                                levelColor={STRUCTURE_LEVEL_COLORS[code]}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Complexité graphémique (RENAMED) */}
                <FilterSection
                    title="Complexité (G)"
                    icon={<Binary className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
                    badge={filters.graphemeDisplay.length}
                    isOpen={openSections.graphemeDisplay}
                    onToggle={() => toggleSection('graphemeDisplay')}
                >
                    <div className="space-y-0">
                        {graphemeCodes.map((code) => (
                            <FilterOption
                                key={code}
                                code={code}
                                label={getGraphemeLabel(code)}
                                description={getGraphemeDescription(code)}
                                isActive={filters.graphemeDisplay.includes(code)}
                                onToggle={() => toggleArrayFilter('graphemeDisplay', code)}
                                levelColor={GRAPHEME_LEVEL_COLORS[code]}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* [NEW] GROUP: MÉTRIQUES */}
                <FilterGroup label="Métriques" variant="metric" />

                {/* Lettres (Word Length) */}
                <FilterSection
                    title="Longueur"
                    icon={<ALargeSmall className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
                    badge={(filters.minLetters !== 1 || filters.maxLetters !== 14) ? 1 : 0}
                    isOpen={openSections.length || false}
                    onToggle={() => toggleSection('length')}
                >
                    <div className="space-y-4 px-1 pb-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[rgb(var(--filter-text-secondary))]">
                                Longueur du mot
                            </span>
                            <span className="font-mono text-[12px] font-medium text-[rgb(var(--filter-accent))] bg-[rgb(var(--filter-accent-light))] px-2.5 py-1 rounded-[6px]">
                                {filters.minLetters} — {filters.maxLetters}
                            </span>
                        </div>

                        <div className="px-1 py-4">
                            <Slider
                                min={1}
                                max={14}
                                step={1}
                                value={[filters.minLetters, filters.maxLetters]}
                                onValueChange={([min, max]) => {
                                    updateFilter('minLetters', min);
                                    updateFilter('maxLetters', max);
                                }}
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Syllabes */}
                <FilterSection
                    title="Syllabes"
                    icon={<MessageSquare className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
                    badge={(filters.minSyllables !== 1 || filters.maxSyllables !== 5) ? 1 : 0}
                    isOpen={openSections.syllables || false}
                    onToggle={() => toggleSection('syllables')}
                >
                    <div className="space-y-4 px-1 pb-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-[rgb(var(--filter-text-secondary))]">
                                Nombre de syllabes
                            </span>
                            <span className="font-mono text-[12px] font-medium text-[rgb(var(--filter-accent))] bg-[rgb(var(--filter-accent-light))] px-2.5 py-1 rounded-[6px]">
                                {filters.minSyllables} — {filters.maxSyllables}
                            </span>
                        </div>

                        <div className="px-1 py-4">
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[filters.minSyllables, filters.maxSyllables]}
                                onValueChange={([min, max]) => {
                                    updateFilter('minSyllables', min);
                                    updateFilter('maxSyllables', max);
                                }}
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Fréquence */}
                <FilterSection
                    title="Fréquence"
                    icon={<BarChart3 className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
                    badge={filters.frequencies.length}
                    isOpen={openSections.frequencies || false}
                    onToggle={() => toggleSection('frequencies')}
                >
                    <div className="flex flex-wrap gap-2 px-1">
                        {['1', '2', '3', '4'].map((code) => {
                            const isActive = filters.frequencies.includes(code);
                            const label = FREQUENCY_LABELS[code];
                            return (
                                <button
                                    key={code}
                                    onClick={() => toggleArrayFilter('frequencies', code)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap font-display",
                                        isActive
                                            ? "bg-[rgb(var(--filter-accent))] border-[rgb(var(--filter-accent))] text-white shadow-md shadow-[rgba(79,70,229,0.3)]"
                                            : "bg-white border-[rgb(var(--filter-border))] text-[rgb(var(--filter-text-secondary))] hover:border-[rgb(var(--filter-text-secondary))] hover:bg-[rgb(var(--filter-surface-hover))]"
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>
            </div>
        </aside>
    );
}
