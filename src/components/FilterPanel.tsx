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
import { Search, RotateCcw, BookOpen, Layers, Hash, BarChart3, Type } from "lucide-react";
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

    return (
        <div className="h-full flex flex-col bg-card/30 backdrop-blur-sm border-r border-border/50">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Filtres
                    </h2>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Réinitialiser
                        </Button>
                    )}
                </div>

                {/* Compteur de résultats */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {resultCount} / {totalCount} mots
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* Recherche textuelle */}
                    <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Recherche par mot
                        </Label>
                        <Input
                            id="search"
                            placeholder="Tapez un mot..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="bg-background/50"
                        />
                    </div>

                    {/* Recherche phonétique */}
                    <div className="space-y-2">
                        <Label htmlFor="phonSearch" className="text-sm font-medium flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Recherche phonétique
                        </Label>
                        <Input
                            id="phonSearch"
                            placeholder="Tapez un phonème..."
                            value={filters.phonSearch}
                            onChange={(e) => updateFilter('phonSearch', e.target.value)}
                            className="bg-background/50 font-mono"
                        />
                    </div>

                    <Separator />

                    <Accordion type="multiple" defaultValue={['categories', 'syllables']} className="space-y-2">
                        {/* Catégories syntaxiques */}
                        <AccordionItem value="categories" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Layers className="w-4 h-4 text-primary" />
                                    Catégorie grammaticale
                                    {filters.categories.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.categories.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <div key={cat} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${cat}`}
                                                    checked={filters.categories.includes(cat)}
                                                    onCheckedChange={() => toggleArrayFilter('categories', cat)}
                                                />
                                                <Label
                                                    htmlFor={`cat-${cat}`}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {SYNT_LABELS[cat]}
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {stats.categories[cat] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Nombre de syllabes */}
                        <AccordionItem value="syllables" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Hash className="w-4 h-4 text-primary" />
                                    Nombre de syllabes
                                    {filters.syllables.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.syllables.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {syllables.map((syll) => (
                                        <div key={syll} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`syll-${syll}`}
                                                    checked={filters.syllables.includes(syll)}
                                                    onCheckedChange={() => toggleArrayFilter('syllables', syll)}
                                                />
                                                <Label
                                                    htmlFor={`syll-${syll}`}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {syll} syll.
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {stats.syllables[syll] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Structure syllabique */}
                        <AccordionItem value="structures" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Layers className="w-4 h-4 text-primary" />
                                    Structure syllabique
                                    {filters.structures.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.structures.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {structures.map((struct) => (
                                        <div key={struct} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Checkbox
                                                    id={`struct-${struct}`}
                                                    checked={filters.structures.includes(struct)}
                                                    onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                                />
                                                <Label
                                                    htmlFor={`struct-${struct}`}
                                                    className="text-xs cursor-pointer truncate"
                                                    title={STRUCTURE_LABELS[struct]}
                                                >
                                                    <span className="font-mono font-bold mr-1">{struct}.</span>
                                                    {STRUCTURE_LABELS[struct]}
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {stats.structures[struct] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Complexité graphémique */}
                        <AccordionItem value="graphemes" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    Complexité graphémique
                                    {filters.graphemes.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.graphemes.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {graphemeCodes.map((code) => (
                                        <div key={code} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Checkbox
                                                    id={`graph-${code}`}
                                                    checked={filters.graphemes.includes(code)}
                                                    onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                                />
                                                <Label
                                                    htmlFor={`graph-${code}`}
                                                    className="text-xs cursor-pointer truncate"
                                                    title={GRAPHEME_LABELS[code]}
                                                >
                                                    <span className="font-mono font-bold mr-1">{code}.</span>
                                                    {GRAPHEME_LABELS[code]}
                                                </Label>
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {stats.graphemes[code] || 0}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Fréquence */}
                        <AccordionItem value="frequency" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    Fréquence d'usage
                                    {filters.frequencies.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.frequencies.length}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {frequencyCodes.map((code) => (
                                        <div key={code} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`freq-${code}`}
                                                checked={filters.frequencies.includes(code)}
                                                onCheckedChange={() => toggleArrayFilter('frequencies', code)}
                                            />
                                            <Label
                                                htmlFor={`freq-${code}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {FREQUENCY_LABELS[code]}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Longueur */}
                        <AccordionItem value="length" className="border rounded-lg px-3">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Hash className="w-4 h-4 text-primary" />
                                    Nombre de lettres
                                    {(filters.minLetters !== 1 || filters.maxLetters !== 20) && (
                                        <Badge variant="secondary" className="ml-2">
                                            {filters.minLetters}-{filters.maxLetters}
                                        </Badge>
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Min: {filters.minLetters}</span>
                                        <span>Max: {filters.maxLetters}</span>
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
