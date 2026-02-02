import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    WordFilters,
    STRUCTURE_LABELS,
    GRAPHEME_LABELS,
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
    'd': 'level-3',
    'e': 'level-4',
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
const LEVEL_COLORS: Record<string, string> = {
    'level-1': 'bg-[rgb(var(--level-1-bg))] text-[rgb(var(--level-1-text))]',
    'level-2': 'bg-[rgb(var(--level-2-bg))] text-[rgb(var(--level-2-text))]',
    'level-3': 'bg-[rgb(var(--level-3-bg))] text-[rgb(var(--level-3-text))]',
    'level-4': 'bg-[rgb(var(--level-4-bg))] text-[rgb(var(--level-4-text))]',
    'level-5': 'bg-[rgb(var(--level-5-bg))] text-[rgb(var(--level-5-text))]',
    'level-6': 'bg-[rgb(var(--level-6-bg))] text-[rgb(var(--level-6-text))]',
    'level-7': 'bg-[rgb(var(--level-7-bg))] text-[rgb(var(--level-7-text))]',
    'level-8': 'bg-[rgb(var(--level-8-bg))] text-[rgb(var(--level-8-text))]',
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
                "flex items-start gap-[10px] p-[7px_10px] rounded-[6px] cursor-pointer transition-all",
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
                "inline-flex items-center justify-center w-5 h-5 min-w-5 rounded-[6px] text-[11px] font-bold font-['Sora']",
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
                <span className="font-['Sora'] text-[11px] font-bold uppercase tracking-[1.2px] text-[rgb(var(--filter-text-secondary))] group-hover:text-[rgb(var(--filter-accent))] transition-colors">
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
                <h2 className="font-['Sora'] text-lg font-bold text-[rgb(var(--filter-text-primary))] mb-[2px]">
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
                    className="w-full px-3 py-2 bg-[rgb(var(--filter-bg))] border-[1.5px] border-[rgb(var(--filter-border))] rounded-[6px] text-[13px] text-[rgb(var(--filter-text-primary))] font-['Sora'] placeholder:text-[rgb(var(--filter-text-muted))] focus-visible:outline-none focus-visible:border-[rgb(var(--filter-border-focus))] transition-all shadow-none h-auto"
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
            </div>
        </aside>
    );
}
