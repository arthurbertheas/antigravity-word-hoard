import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, RotateCcw, BookOpen, Layers, Hash, BarChart3, Type, Zap } from "lucide-react";
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
    resultCount,
    totalCount,
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

    const activeFilterCount =
        (filters.search ? 1 : 0) +
        (filters.phonSearch ? 1 : 0) +
        filters.categories.length +
        filters.syllables.length +
        filters.structures.length +
        filters.graphemes.length +
        filters.frequencies.length +
        (filters.minLetters !== 1 || filters.maxLetters !== 20 ? 1 : 0);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                            <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Filtres</h2>
                            {activeFilterCount > 0 && (
                                <p className="text-xs text-muted-foreground">{activeFilterCount} actif{activeFilterCount > 1 ? 's' : ''}</p>
                            )}
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Compteur de résultats */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${(resultCount / totalCount) * 100}%` }}
                        />
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
                        {resultCount}
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-5 space-y-4">
                    {/* Recherche textuelle */}
                    <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Type className="w-3.5 h-3.5" />
                            Recherche par mot
                        </Label>
                        <div className="relative">
                            <Input
                                id="search"
                                placeholder="Tapez un mot..."
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="bg-muted/20 border-border/30 focus:border-primary/50 focus:ring-primary/20 pl-9"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        </div>
                    </div>

                    {/* Recherche phonétique */}
                    <div className="space-y-2">
                        <Label htmlFor="phonSearch" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-3.5 h-3.5" />
                            Recherche phonétique
                        </Label>
                        <div className="relative">
                            <Input
                                id="phonSearch"
                                placeholder="Tapez un phonème..."
                                value={filters.phonSearch}
                                onChange={(e) => updateFilter('phonSearch', e.target.value)}
                                className="bg-muted/20 border-border/30 focus:border-primary/50 focus:ring-primary/20 font-mono pl-9"
                            />
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        </div>
                    </div>

                    <Separator className="bg-border/30" />

                    <Accordion type="multiple" defaultValue={['categories', 'syllables']} className="space-y-2">
                        {/* Catégories syntaxiques */}
                        <AccordionItem value="categories" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Layers className="w-4 h-4 text-primary" />
                                    Catégorie
                                    {filters.categories.length > 0 && (
                                        <Badge className="ml-2 bg-primary/20 text-primary border-0 text-xs">
                                            {filters.categories.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <div key={cat} className="flex items-center justify-between group">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${cat}`}
                                                    checked={filters.categories.includes(cat)}
                                                    onCheckedChange={() => toggleArrayFilter('categories', cat)}
                                                    className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <Label
                                                    htmlFor={`cat-${cat}`}
                                                    className="text-sm cursor-pointer group-hover:text-foreground transition-colors"
                                                >
                                                    {SYNT_LABELS[cat]}
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-mono border-border/30 text-muted-foreground">
                                                {stats.categories[cat] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Nombre de syllabes */}
                        <AccordionItem value="syllables" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Hash className="w-4 h-4 text-secondary" />
                                    Syllabes
                                    {filters.syllables.length > 0 && (
                                        <Badge className="ml-2 bg-secondary/20 text-secondary border-0 text-xs">
                                            {filters.syllables.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {syllables.map((syll) => (
                                        <div key={syll} className="flex items-center justify-between group">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`syll-${syll}`}
                                                    checked={filters.syllables.includes(syll)}
                                                    onCheckedChange={() => toggleArrayFilter('syllables', syll)}
                                                    className="border-border/50 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                                />
                                                <Label
                                                    htmlFor={`syll-${syll}`}
                                                    className="text-sm cursor-pointer font-mono"
                                                >
                                                    {syll}
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-mono border-border/30 text-muted-foreground">
                                                {stats.syllables[syll] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Structure syllabique */}
                        <AccordionItem value="structures" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Layers className="w-4 h-4 text-accent" />
                                    Structure
                                    {filters.structures.length > 0 && (
                                        <Badge className="ml-2 bg-accent/20 text-accent border-0 text-xs">
                                            {filters.structures.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {structures.map((struct) => (
                                        <div key={struct} className="flex items-center justify-between gap-2 group">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Checkbox
                                                    id={`struct-${struct}`}
                                                    checked={filters.structures.includes(struct)}
                                                    onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                                    className="border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent shrink-0"
                                                />
                                                <Label
                                                    htmlFor={`struct-${struct}`}
                                                    className="text-xs cursor-pointer truncate"
                                                    title={STRUCTURE_LABELS[struct]}
                                                >
                                                    <span className="font-mono font-bold text-accent mr-1">{struct}.</span>
                                                    <span className="text-muted-foreground">{STRUCTURE_LABELS[struct]}</span>
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-mono border-border/30 text-muted-foreground shrink-0">
                                                {stats.structures[struct] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Complexité graphémique */}
                        <AccordionItem value="graphemes" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                                    Graphèmes
                                    {filters.graphemes.length > 0 && (
                                        <Badge className="ml-2 bg-emerald-400/20 text-emerald-400 border-0 text-xs">
                                            {filters.graphemes.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {graphemeCodes.map((code) => (
                                        <div key={code} className="flex items-center justify-between gap-2 group">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Checkbox
                                                    id={`graph-${code}`}
                                                    checked={filters.graphemes.includes(code)}
                                                    onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                                    className="border-border/50 data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-400 shrink-0"
                                                />
                                                <Label
                                                    htmlFor={`graph-${code}`}
                                                    className="text-xs cursor-pointer truncate"
                                                    title={GRAPHEME_LABELS[code]}
                                                >
                                                    <span className="font-mono font-bold text-emerald-400 mr-1">{code}.</span>
                                                    <span className="text-muted-foreground">{GRAPHEME_LABELS[code]}</span>
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-mono border-border/30 text-muted-foreground shrink-0">
                                                {stats.graphemes[code] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Fréquence */}
                        <AccordionItem value="frequency" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <BarChart3 className="w-4 h-4 text-rose-400" />
                                    Fréquence
                                    {filters.frequencies.length > 0 && (
                                        <Badge className="ml-2 bg-rose-400/20 text-rose-400 border-0 text-xs">
                                            {filters.frequencies.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {frequencyCodes.map((code) => (
                                        <div key={code} className="flex items-center space-x-2 group">
                                            <Checkbox
                                                id={`freq-${code}`}
                                                checked={filters.frequencies.includes(code)}
                                                onCheckedChange={() => toggleArrayFilter('frequencies', code)}
                                                className="border-border/50 data-[state=checked]:bg-rose-400 data-[state=checked]:border-rose-400"
                                            />
                                            <Label
                                                htmlFor={`freq-${code}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                <span className="font-mono font-bold text-rose-400 mr-1">{code}.</span>
                                                {FREQUENCY_LABELS[code]}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Longueur */}
                        <AccordionItem value="length" className="border border-border/30 rounded-xl px-4 bg-muted/10">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Hash className="w-4 h-4 text-sky-400" />
                                    Longueur
                                    {(filters.minLetters !== 1 || filters.maxLetters !== 20) && (
                                        <Badge className="ml-2 bg-sky-400/20 text-sky-400 border-0 text-xs font-mono">
                                            {filters.minLetters}-{filters.maxLetters}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-mono text-muted-foreground">
                                        <span className="bg-muted/30 px-2 py-0.5 rounded">{filters.minLetters}</span>
                                        <span className="text-muted-foreground/50">lettres</span>
                                        <span className="bg-muted/30 px-2 py-0.5 rounded">{filters.maxLetters}</span>
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </ScrollArea>
        </div>
    );
}
