import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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
}: FilterPanelProps) {
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
            {/* Header (Soft Professional: Fixed) */}
            <div className="px-6 py-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Filtres</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-400 font-medium">Affinez votre recherche</p>
            </div>

            {/* Scrollable Content (Soft Professional: Overflow Auto) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                {/* Search Input */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Rechercher un mot..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-10 bg-slate-50 border-0 rounded-xl h-11 text-sm font-medium text-slate-700 placeholder-slate-400 focus-visible:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-none"
                    />
                </div>

                {/* Recherche phonétique */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Phonétique
                    </label>
                    <Input
                        placeholder="/a/, /ʃ/..."
                        value={filters.phonSearch}
                        onChange={(e) => updateFilter('phonSearch', e.target.value)}
                        className="font-mono bg-white border border-slate-200 rounded-xl h-10 text-sm focus-visible:ring-blue-100"
                    />
                </div>

                <div className="space-y-6">
                    <Separator className="bg-slate-100" />

                    {/* FILTRES SECONDAIRES (STRUCTURE & GRAPHIE) */}
                    <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-4">
                            Structure & Graphie
                        </h4>

                        <Accordion type="multiple" defaultValue={['structures', 'graphemes']} className="space-y-4">
                            {/* Structure syllabique */}
                            <AccordionItem value="structures" className="border-0">
                                <AccordionTrigger className="py-2 hover:no-underline group">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        Structure syllabique
                                        {filters.structures.length > 0 && (
                                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 h-4 border-0">
                                                {filters.structures.length}
                                            </Badge>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 pt-1">
                                    <div className="space-y-1">
                                        {structures.map((struct) => {
                                            const count = stats.structures[struct] || 0;
                                            return (
                                                <div key={struct} className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group/item"
                                                    onClick={() => toggleArrayFilter('structures', struct)}>
                                                    <Checkbox
                                                        id={`struct-${struct}`}
                                                        checked={filters.structures.includes(struct)}
                                                        onCheckedChange={() => toggleArrayFilter('structures', struct)}
                                                        className="mt-0.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                                        <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase">
                                                            {struct}
                                                        </span>
                                                        <label
                                                            htmlFor={`struct-${struct}`}
                                                            className="text-sm font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors leading-snug cursor-pointer"
                                                        >
                                                            {STRUCTURE_LABELS[struct]}
                                                        </label>
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
                                <AccordionTrigger className="py-2 hover:no-underline group">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        Complexité graphémique
                                        {filters.graphemes.length > 0 && (
                                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 h-4 border-0">
                                                {filters.graphemes.length}
                                            </Badge>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 pt-1">
                                    <div className="space-y-1">
                                        {graphemeCodes.map((code) => {
                                            const count = stats.graphemes[code] || 0;
                                            return (
                                                <div key={code} className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group/item"
                                                    onClick={() => toggleArrayFilter('graphemes', code)}>
                                                    <Checkbox
                                                        id={`graph-${code}`}
                                                        checked={filters.graphemes.includes(code)}
                                                        onCheckedChange={() => toggleArrayFilter('graphemes', code)}
                                                        className="mt-0.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                                        <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase">
                                                            {code}
                                                        </span>
                                                        <label
                                                            htmlFor={`graph-${code}`}
                                                            className="text-sm font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors leading-snug cursor-pointer"
                                                            title={GRAPHEME_LABELS[code]}
                                                        >
                                                            {GRAPHEME_LABELS[code]}
                                                        </label>
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

                    {/* AUTRES CRITÈRES */}
                    <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-4">
                            Autres critères
                        </h4>

                        <Accordion type="multiple" defaultValue={[]} className="space-y-4">
                            {/* Nombre de syllabes */}
                            <AccordionItem value="syllables" className="border-0">
                                <AccordionTrigger className="py-2 hover:no-underline group">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        Nombre de syllabes
                                        {filters.syllables.length > 0 && (
                                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                                {filters.syllables.length}
                                            </Badge>
                                        )}
                                    </span>
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
                                                        "flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all border-2",
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
                                <AccordionTrigger className="py-2 hover:no-underline group">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        Fréquence
                                        {filters.frequencies.length > 0 && (
                                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                                {filters.frequencies.length}
                                            </Badge>
                                        )}
                                    </span>
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
                                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2",
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
                                <AccordionTrigger className="py-2 hover:no-underline group">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        Longueur (lettres)
                                        {(filters.minLetters !== 1 || filters.maxLetters !== 20) && (
                                            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 h-4 border-blue-100">
                                                {filters.minLetters}-{filters.maxLetters}
                                            </Badge>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 pt-3">
                                    <div className="space-y-4 px-2">
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
            </div>
        </aside>
    );
}
