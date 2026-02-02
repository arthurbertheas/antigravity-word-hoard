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
import { cn } from "@/lib/utils";
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
        <aside className="w-80 h-full bg-white border-r border-slate-100 flex flex-col font-sans z-10 overflow-hidden">
            {/* Header (Nano Clean: Fixed) */}
            <div className="px-6 py-8 pb-4">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Filtres</h2>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-700 transition-colors uppercase tracking-widest p-0 h-auto"
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
                <p className="text-xs text-slate-400 font-medium">Affinez votre recherche</p>
            </div>

            {/* Scroll Area (Nano Clean: Flexible) */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                {/* Search Input */}
                <div className="space-y-2 pt-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Rechercher un mot..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus-visible:outline-none focus-visible:bg-white focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-50/50 transition-all border shadow-none h-11"
                        />
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Recherche phonétique */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phonétique</label>
                        <Input
                            placeholder="/a/, /ʃ/..."
                            value={filters.phonSearch}
                            onChange={(e) => updateFilter('phonSearch', e.target.value)}
                            className="bg-white font-mono text-sm border-slate-200 focus-visible:ring-blue-50/50"
                        />
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* FILTRES PRIMAIRES */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4">
                            Structure & Graphie
                        </h4>

                        <Accordion type="multiple" defaultValue={['structures', 'graphemes']} className="space-y-4">
                            {/* Structure syllabique */}
                            <AccordionItem value="structures" className="border-0">
                                <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors group">
                                    <span className="flex items-center gap-2">
                                        Structure syllabique
                                        {filters.structures.length > 0 && (
                                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 h-4 border-0">
                                                {filters.structures.length}
                                            </Badge>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 pt-3">
                                    <div className="space-y-1">
                                        {structures.map((struct) => {
                                            const count = stats.structures[struct] || 0;
                                            return (
                                                <div key={struct} className="flex items-start gap-3 py-1.5 group/item hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                                                    onClick={() => toggleArrayFilter('structures', struct)}>
                                                    <Checkbox
                                                        id={`struct-${struct}`}
                                                        checked={filters.structures.includes(struct)}
                                                        onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                                        className="mt-0.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline flex-wrap gap-1.5">
                                                            <span className="shrink-0 inline-flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase h-4 min-w-[1.25rem] rounded px-1">
                                                                {struct}
                                                            </span>
                                                            <label
                                                                htmlFor={`struct-${struct}`}
                                                                className="text-sm text-slate-600 font-medium leading-snug cursor-pointer group-hover/item:text-slate-900 transition-colors"
                                                            >
                                                                {STRUCTURE_LABELS[struct]}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400 tabular-nums shrink-0 mt-0.5">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Complexité graphémique */}
                            <AccordionItem value="graphemes" className="border-0">
                                <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors group">
                                    <span className="flex items-center gap-2">
                                        Complexité graphémique
                                        {filters.graphemes.length > 0 && (
                                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 h-4 border-0">
                                                {filters.graphemes.length}
                                            </Badge>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 pt-3">
                                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                        {graphemeCodes.map((code) => {
                                            const count = stats.graphemes[code] || 0;
                                            return (
                                                <div key={code} className="flex items-start gap-3 py-1.5 group/item hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                                                    onClick={() => toggleArrayFilter('graphemes', code)}>
                                                    <Checkbox
                                                        id={`graph-${code}`}
                                                        checked={filters.graphemes.includes(code)}
                                                        onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                                        className="mt-0.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline flex-wrap gap-1.5">
                                                            <span className="shrink-0 inline-flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase h-4 min-w-[1.25rem] rounded px-1">
                                                                {code}
                                                            </span>
                                                            <label
                                                                htmlFor={`graph-${code}`}
                                                                className="text-sm text-slate-600 font-medium leading-snug cursor-pointer group-hover/item:text-slate-900 transition-colors"
                                                                title={GRAPHEME_LABELS[code]}
                                                            >
                                                                {GRAPHEME_LABELS[code]}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400 tabular-nums shrink-0 mt-0.5">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>


                    <Separator className="bg-slate-100" />

                    {/* FILTRES SECONDAIRES */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4">
                            Autres critères
                        </h4>

                        <Accordion type="multiple" defaultValue={[]} className="space-y-4">
                            {/* Nombre de syllabes */}
                            <AccordionItem value="syllables" className="border-0">
                                <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                    Nombre de syllabes
                                    {filters.syllables.length > 0 && (
                                        <Badge className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                            {filters.syllables.length}
                                        </Badge>
                                    )}
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 pt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {syllables.map((syll) => {
                                            const isActive = filters.syllables.includes(syll);
                                            return (
                                                <button
                                                    key={syll}
                                                    onClick={() => toggleArrayFilter('syllables', syll)}
                                                    className={cn(
                                                        "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all border-2",
                                                        isActive
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {syll}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Fréquence */}
                            <AccordionItem value="frequency" className="border-0">
                                <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                    Fréquence
                                    {filters.frequencies.length > 0 && (
                                        <Badge className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                            {filters.frequencies.length}
                                        </Badge>
                                    )}
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 pt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {frequencyCodes.map((code) => {
                                            const isActive = filters.frequencies.includes(code);
                                            return (
                                                <button
                                                    key={code}
                                                    onClick={() => toggleArrayFilter('frequencies', code)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2",
                                                        isActive
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
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
                                <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                    Longueur (lettres)
                                    {(filters.minLetters !== 1 || filters.maxLetters !== 20) && (
                                        <Badge className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                            {filters.minLetters}-{filters.maxLetters}
                                        </Badge>
                                    )}
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 pt-3">
                                    <div className="space-y-4 px-1">
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
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            <span>{filters.minLetters} lettres</span>
                                            <span>{filters.maxLetters} lettres</span>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
        </aside>
    );
}
