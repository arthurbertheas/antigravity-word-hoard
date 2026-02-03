import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    WordFilters,
    STRUCTURE_LABELS,
    GRAPHEME_LABELS,
    FREQUENCY_LABELS,
} from "@/types/word";

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

// Level badge color classes
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

interface CollapsibleSectionProps {
    title: string;
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function CollapsibleSection({ title, badge, isOpen, onToggle, children }: CollapsibleSectionProps) {
    return (
        <div className="px-[22px] mb-1">
            <div
                className="flex items-center gap-2 py-[10px] pb-2 cursor-pointer group"
                onClick={onToggle}
            >
                <span className="font-sora text-[11px] font-bold uppercase tracking-[1.2px] text-[rgb(var(--filter-text-secondary))] group-hover:text-[rgb(var(--filter-accent))] transition-colors">
                    {title}
                </span>
                {badge !== undefined && badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] bg-[rgb(var(--filter-accent))] text-white text-[10px] font-bold rounded-full">
                        {badge}
                    </span>
                )}
                <ChevronDown className={cn(
                    "ml-auto text-[rgb(var(--filter-text-muted))] transition-transform duration-250 w-[14px] h-[14px]",
                    !isOpen && "-rotate-90"
                )} />
            </div>
            {isOpen && <div className="pb-[6px]">{children}</div>}
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
        structures: true,
        graphemes: true,
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

    return (
        <aside className="w-[300px] min-w-[300px] h-full bg-[rgb(var(--filter-surface))] border-r border-[rgb(var(--filter-border))] flex flex-col font-['DM_Sans'] z-10 overflow-hidden">
            {/* Header */}
            <div className="px-[22px] pt-6 pb-4 border-b border-[rgb(var(--filter-border))]">
                <h2 className="font-sora text-lg font-bold text-[rgb(var(--filter-text-primary))] mb-[2px]">
                    Filtres
                </h2>
                <p className="text-xs text-[rgb(var(--filter-text-muted))]">
                    Affinez votre recherche
                </p>
            </div>

            {/* Search */}
            <div className="p-[14px_22px] relative">
                <Search className="absolute left-[34px] top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[rgb(var(--filter-text-muted))] pointer-events-none" />
                <Input
                    type="text"
                    placeholder="Rechercher un mot…"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-[38px] pr-[14px] py-[10px] bg-[rgb(var(--filter-bg))] border-[1.5px] border-[rgb(var(--filter-border))] rounded-[10px] text-[13px] text-[rgb(var(--filter-text-primary))] placeholder:text-[rgb(var(--filter-text-muted))] focus-visible:outline-none focus-visible:border-[rgb(var(--filter-border-focus))] focus-visible:ring-[3px] focus-visible:ring-[rgba(79,70,229,0.12)] transition-all shadow-none h-auto"
                />
            </div>

            {/* Phonetic */}
            <div className="px-[22px] pb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--filter-text-muted))] mb-[6px]">
                    Phonétique
                </label>
                <Input
                    type="text"
                    placeholder="/a/, /l/…"
                    value={filters.phonSearch}
                    onChange={(e) => updateFilter('phonSearch', e.target.value)}
                    className="w-full px-3 py-2 bg-[rgb(var(--filter-bg))] border-[1.5px] border-[rgb(var(--filter-border))] rounded-[6px] text-[13px] text-[rgb(var(--filter-text-primary))] font-sora placeholder:text-[rgb(var(--filter-text-muted))] focus-visible:outline-none focus-visible:border-[rgb(var(--filter-border-focus))] transition-all shadow-none h-auto"
                />
            </div>

            {/* Scrollable Sections */}
            <div className="flex-1 overflow-y-auto py-2 pb-6 scrollbar-thin scrollbar-thumb-[rgb(var(--filter-border))]">
                {/* Structure syllabique */}
                <CollapsibleSection
                    title="Structure syllabique"
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
                </CollapsibleSection>

                {/* Divider */}
                <div className="h-[1px] bg-[rgb(var(--filter-border))] my-1 mx-[22px]" />

                {/* Complexité graphémique */}
                <CollapsibleSection
                    title="Complexité graphique"
                    badge={filters.graphemes.length}
                    isOpen={openSections.graphemes}
                    onToggle={() => toggleSection('graphemes')}
                >
                    <div className="space-y-0">
                        {graphemeCodes.map((code) => (
                            <FilterOption
                                key={code}
                                code={code}
                                label={getGraphemeLabel(code)}
                                description={getGraphemeDescription(code)}
                                isActive={filters.graphemes.includes(code)}
                                onToggle={() => toggleArrayFilter('graphemes', code)}
                                levelColor={GRAPHEME_LEVEL_COLORS[code]}
                            />
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Divider */}
                <div className="h-[1px] bg-[rgb(var(--filter-border))] my-1 mx-[22px]" />

                {/* AUTRES CRITÈRES */}
                <div className="px-[22px] mb-1">
                    <div className="py-[10px] pb-2">
                        <span className="font-sora text-[11px] font-bold uppercase tracking-[1.2px] text-[rgb(var(--filter-text-secondary))]">
                            Autres critères
                        </span>
                    </div>
                </div>

                {/* Nombre de syllabes */}
                <CollapsibleSection
                    title="Nombre de syllabes"
                    badge={filters.syllables.length}
                    isOpen={openSections.syllables || false}
                    onToggle={() => toggleSection('syllables')}
                >
                    <div className="flex flex-wrap gap-2 px-2">
                        {[1, 2, 3, 4].map((syll) => {
                            const isActive = filters.syllables.includes(syll);
                            return (
                                <button
                                    key={syll}
                                    onClick={() => toggleArrayFilter('syllables', syll)}
                                    className={cn(
                                        "flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all border-2",
                                        isActive
                                            ? "bg-[rgb(var(--filter-accent))] border-[rgb(var(--filter-accent))] text-white shadow-md shadow-[rgba(79,70,229,0.3)]"
                                            : "bg-white border-[rgb(var(--filter-border))] text-[rgb(var(--filter-text-secondary))] hover:border-[rgb(var(--filter-text-secondary))] hover:bg-[rgb(var(--filter-surface-hover))]"
                                    )}
                                >
                                    {syll}
                                </button>
                            );
                        })}
                    </div>
                </CollapsibleSection>

                {/* Fréquence */}
                <CollapsibleSection
                    title="Fréquence"
                    badge={filters.frequencies.length}
                    isOpen={openSections.frequencies || false}
                    onToggle={() => toggleSection('frequencies')}
                >
                    <div className="flex flex-wrap gap-2 px-2">
                        {['1', '2', '3', '4'].map((code) => {
                            const isActive = filters.frequencies.includes(code);
                            const label = FREQUENCY_LABELS[code];
                            return (
                                <button
                                    key={code}
                                    onClick={() => toggleArrayFilter('frequencies', code)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap",
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
                </CollapsibleSection>

                {/* Longueur */}
                <CollapsibleSection
                    title="Longueur (lettres)"
                    badge={(filters.minLetters !== 1 || filters.maxLetters !== 20) ? 1 : 0}
                    isOpen={openSections.length || false}
                    onToggle={() => toggleSection('length')}
                >
                    <div className="space-y-4 px-2">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={filters.minLetters}
                            onChange={(e) => updateFilter('minLetters', parseInt(e.target.value))}
                            className="w-full h-2 bg-[rgb(var(--filter-bg))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--filter-accent))]"
                        />
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={filters.maxLetters}
                            onChange={(e) => updateFilter('maxLetters', parseInt(e.target.value))}
                            className="w-full h-2 bg-[rgb(var(--filter-bg))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--filter-accent))]"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-[rgb(var(--filter-text-muted))] uppercase tracking-wide">
                            <span>{filters.minLetters} lettres</span>
                            <span>{filters.maxLetters} lettres</span>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </aside>
    );
}
