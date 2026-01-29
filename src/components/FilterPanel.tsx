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
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-foreground">Filtres</h2>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-muted-foreground hover:text-primary h-8 px-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Input
                        placeholder="Rechercher un mot..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-9 bg-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-1">

                    {/* Recherche phonétique */}
                    <div className="mb-4">
                        <Label className="text-xs text-muted-foreground mb-2 block">Phonème</Label>
                        <Input
                            placeholder="/a/, /ʃ/..."
                            value={filters.phonSearch}
                            onChange={(e) => updateFilter('phonSearch', e.target.value)}
                            className="bg-white font-mono text-sm"
                        />
                    </div>

                    <Separator />

                    <Accordion type="multiple" defaultValue={['categories', 'syllables']} className="space-y-1">

                        {/* Catégories syntaxiques */}
                        <AccordionItem value="categories" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Catégorie
                                {filters.categories.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.categories.length}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => {
                                        const isActive = filters.categories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleArrayFilter('categories', cat)}
                                                className={`
                          pill text-xs
                          ${isActive ? 'pill-active' : 'pill-default'}
                        `}
                                            >
                                                {SYNT_LABELS[cat]}
                                                <span className="ml-1 text-muted-foreground/70">
                                                    {stats.categories[cat] || 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Nombre de syllabes */}
                        <AccordionItem value="syllables" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Syllabes
                                {filters.syllables.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.syllables.length}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="flex flex-wrap gap-2">
                                    {syllables.map((syll) => {
                                        const isActive = filters.syllables.includes(syll);
                                        return (
                                            <button
                                                key={syll}
                                                onClick={() => toggleArrayFilter('syllables', syll)}
                                                className={`
                          pill text-xs font-mono
                          ${isActive ? 'pill-active' : 'pill-default'}
                        `}
                                            >
                                                {syll}
                                                <span className="ml-1 text-muted-foreground/70">
                                                    ({stats.syllables[syll] || 0})
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Structure syllabique */}
                        <AccordionItem value="structures" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Structure
                                {filters.structures.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.structures.length}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2">
                                    {structures.map((struct) => (
                                        <div key={struct} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`struct-${struct}`}
                                                checked={filters.structures.includes(struct)}
                                                onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                            />
                                            <Label
                                                htmlFor={`struct-${struct}`}
                                                className="text-xs cursor-pointer flex-1"
                                            >
                                                <span className="font-mono font-bold text-primary">{struct}.</span>{' '}
                                                <span className="text-muted-foreground">{STRUCTURE_LABELS[struct]}</span>
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {stats.structures[struct] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Complexité graphémique */}
                        <AccordionItem value="graphemes" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Graphèmes
                                {filters.graphemes.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.graphemes.length}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {graphemeCodes.map((code) => (
                                        <div key={code} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`graph-${code}`}
                                                checked={filters.graphemes.includes(code)}
                                                onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                            />
                                            <Label
                                                htmlFor={`graph-${code}`}
                                                className="text-xs cursor-pointer flex-1 truncate"
                                                title={GRAPHEME_LABELS[code]}
                                            >
                                                <span className="font-mono font-bold text-primary">{code}.</span>{' '}
                                                <span className="text-muted-foreground">{GRAPHEME_LABELS[code]}</span>
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {stats.graphemes[code] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Fréquence */}
                        <AccordionItem value="frequency" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Fréquence
                                {filters.frequencies.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.frequencies.length}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="flex flex-wrap gap-2">
                                    {frequencyCodes.map((code) => {
                                        const isActive = filters.frequencies.includes(code);
                                        return (
                                            <button
                                                key={code}
                                                onClick={() => toggleArrayFilter('frequencies', code)}
                                                className={`
                          pill text-xs
                          ${isActive ? 'pill-active' : 'pill-default'}
                        `}
                                            >
                                                {FREQUENCY_LABELS[code]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Longueur */}
                        <AccordionItem value="length" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium">
                                Longueur
                                {(filters.minLetters !== 1 || filters.maxLetters !== 20) && (
                                    <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0">
                                        {filters.minLetters}-{filters.maxLetters}
                                    </Badge>
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{filters.minLetters} lettres</span>
                                        <span>{filters.maxLetters} lettres</span>
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
