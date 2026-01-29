import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, RotateCcw } from "lucide-react";
import {
    WordFilters,
    SyntCategory,
    SYNT_LABELS,
    STRUCTURE_LABELS,
    GRAPHEME_LABELS,
    FREQUENCY_LABELS
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

export function FilterPanel({
    filters,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
    stats,
}: FilterPanelProps) {
    const categories: SyntCategory[] = ['NC', 'ADJ', 'VER', 'ADV', 'PRE'];
    const syllables = [1, 2, 3, 4];
    const structures = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const graphemeCodes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    const frequencyCodes = ['1', '2', '3', '4'];

    const hasActiveFilters =
        filters.search !== '' ||
        filters.phonSearch !== '' ||
        filters.categories.length > 0 ||
        filters.syllables.length > 0 ||
        filters.structures.length > 0 ||
        filters.graphemes.length > 0 ||
        filters.frequencies.length > 0 ||
        filters.minLetters !== 1 ||
        filters.maxLetters !== 20;

    return (
        <div className="h-full flex flex-col">
            {/* Header avec recherche */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Filtres</span>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Effacer
                        </button>
                    )}
                </div>

                {/* Recherche mot */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                {/* Recherche phonème */}
                <Input
                    placeholder="Phonème : /a/, /ʃ/..."
                    value={filters.phonSearch}
                    onChange={(e) => updateFilter('phonSearch', e.target.value)}
                    className="h-9 text-sm font-mono"
                />
            </div>

            <ScrollArea className="flex-1 px-4 pb-4">
                <div className="space-y-5">

                    {/* Catégorie grammaticale - Pills */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Catégorie</div>
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map((cat) => {
                                const isActive = filters.categories.includes(cat);
                                const count = stats.categories[cat] || 0;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => toggleArrayFilter('categories', cat)}
                                        className={`pill text-xs ${isActive ? 'pill-active' : ''}`}
                                    >
                                        {SYNT_LABELS[cat]}
                                        <span className="ml-1 opacity-50">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Syllabes - Pills */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Syllabes</div>
                        <div className="flex flex-wrap gap-1.5">
                            {syllables.map((syll) => {
                                const isActive = filters.syllables.includes(syll);
                                const count = stats.syllables[syll] || 0;
                                return (
                                    <button
                                        key={syll}
                                        onClick={() => toggleArrayFilter('syllables', syll)}
                                        className={`pill text-xs font-mono ${isActive ? 'pill-active' : ''}`}
                                    >
                                        {syll}
                                        <span className="ml-1 opacity-50">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Fréquence - Pills */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Fréquence</div>
                        <div className="flex flex-wrap gap-1.5">
                            {frequencyCodes.map((code) => {
                                const isActive = filters.frequencies.includes(code);
                                return (
                                    <button
                                        key={code}
                                        onClick={() => toggleArrayFilter('frequencies', code)}
                                        className={`pill text-xs ${isActive ? 'pill-active' : ''}`}
                                    >
                                        {FREQUENCY_LABELS[code]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Structure - Checkboxes */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Structure syllabique</div>
                        <div className="space-y-1.5">
                            {structures.map((struct) => {
                                const count = stats.structures[struct] || 0;
                                return (
                                    <div key={struct} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`struct-${struct}`}
                                            checked={filters.structures.includes(struct)}
                                            onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                            className="h-4 w-4"
                                        />
                                        <Label
                                            htmlFor={`struct-${struct}`}
                                            className="text-xs cursor-pointer flex-1 leading-tight"
                                        >
                                            <span className="font-mono text-primary font-medium">{struct}.</span>{' '}
                                            <span className="text-muted-foreground">{STRUCTURE_LABELS[struct]}</span>
                                        </Label>
                                        <span className="text-xs text-muted-foreground/60">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Graphèmes - Checkboxes (collapsible) */}
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Complexité graphémique</div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {graphemeCodes.map((code) => {
                                const count = stats.graphemes[code] || 0;
                                return (
                                    <div key={code} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`graph-${code}`}
                                            checked={filters.graphemes.includes(code)}
                                            onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                            className="h-4 w-4"
                                        />
                                        <Label
                                            htmlFor={`graph-${code}`}
                                            className="text-xs cursor-pointer flex-1 leading-tight truncate"
                                            title={GRAPHEME_LABELS[code]}
                                        >
                                            <span className="font-mono text-primary font-medium">{code}.</span>{' '}
                                            <span className="text-muted-foreground">{GRAPHEME_LABELS[code]}</span>
                                        </Label>
                                        <span className="text-xs text-muted-foreground/60">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Longueur - Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Longueur</span>
                            <span className="text-xs text-muted-foreground">
                                {filters.minLetters} - {filters.maxLetters} lettres
                            </span>
                        </div>
                        <Slider
                            value={[filters.minLetters, filters.maxLetters]}
                            min={1}
                            max={20}
                            step={1}
                            onValueChange={([min, max]) => {
                                updateFilter('minLetters', min);
                                updateFilter('maxLetters', max);
                            }}
                            className="w-full"
                        />
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
