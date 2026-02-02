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
import { Search, RotateCcw, ChevronDown } from "lucide-react";
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

                {/* Recherche phonétique */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phonétique</label>
                    <Input
                        placeholder="/a/, /∫/..."
                        value={filters.phonSearch}
                        onChange={(e) => updateFilter('phonSearch', e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl text-sm font-mono text-slate-600 placeholder-slate-400 focus-visible:outline-none focus-visible:bg-white focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-50/50 transition-all border shadow-none h-11"
                    />
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-4">
                    <Accordion type="multiple" defaultValue={['structures', 'graphemes']} className="space-y-4">
                        {/* Structure syllabique */}
                        <AccordionItem value="structures" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                Structure syllabique
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 pt-2">
                                <div className="space-y-1">
                                    {structures.map((struct) => {
                                        const isActive = filters.structures.includes(struct);
                                        const count = stats.structures[struct] || 0;
                                        return (
                                            <label
                                                key={struct}
                                                className={cn(
                                                    "flex items-start cursor-pointer group p-2.5 -mx-2.5 rounded-lg transition-colors select-none",
                                                    isActive ? "bg-blue-50/50 border border-blue-100/50" : "hover:bg-slate-50 border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center h-5 mt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={() => toggleArrayFilter('structures', struct)}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer rounded"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className={cn(
                                                        "text-sm font-medium transition-colors",
                                                        isActive ? "text-blue-800 font-bold" : "text-slate-600 group-hover:text-slate-900"
                                                    )}>
                                                        {STRUCTURE_LABELS[struct]}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tight">{struct.toUpperCase()}</p>
                                                </div>
                                                <span className={cn(
                                                    "ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                                                    isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"
                                                )}>
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Complexité graphémique */}
                        <AccordionItem value="graphemes" className="border-0">
                            <AccordionTrigger className="hover:no-underline py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                Complexité graphémique
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 pt-2">
                                <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                    {graphemeCodes.map((code) => {
                                        const isActive = filters.graphemes.includes(code);
                                        const count = stats.graphemes[code] || 0;
                                        return (
                                            <label
                                                key={code}
                                                className={cn(
                                                    "flex items-start cursor-pointer group p-2.5 -mx-2.5 rounded-lg transition-colors select-none",
                                                    isActive ? "bg-blue-50/50 border border-blue-100/50" : "hover:bg-slate-50 border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center h-5 mt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={() => toggleArrayFilter('graphemes', code)}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer rounded"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className={cn(
                                                        "text-sm font-medium transition-colors leading-tight",
                                                        isActive ? "text-blue-800 font-bold" : "text-slate-600 group-hover:text-slate-900"
                                                    )}>
                                                        {GRAPHEME_LABELS[code]}
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                                                    isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"
                                                )}>
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-6">
                    {/* Catégories Grammaticales */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catégories</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => {
                                const isActive = filters.categories.includes(cat);
                                const count = stats.categories[cat] || 0;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => toggleArrayFilter('categories', cat)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-xs font-bold",
                                            isActive
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <span>{SYNT_LABELS[cat]}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-black",
                                            isActive ? "bg-blue-200/50 text-blue-800" : "bg-slate-100 text-slate-400"
                                        )}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nombre de syllabes */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre de syllabes</label>
                        <div className="flex flex-wrap gap-2">
                            {syllables.map((syll) => {
                                const isActive = filters.syllables.includes(syll);
                                const count = stats.syllables[syll] || 0;
                                return (
                                    <button
                                        key={syll}
                                        onClick={() => toggleArrayFilter('syllables', syll)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-xs font-bold",
                                            isActive
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <span>{syll} {syll > 1 ? 'syllabes' : 'syllabe'}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-black",
                                            isActive ? "bg-blue-200/50 text-blue-800" : "bg-slate-100 text-slate-400"
                                        )}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Fréquence */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fréquence</label>
                        <div className="flex flex-wrap gap-2">
                            {frequencyCodes.map((code) => {
                                const isActive = filters.frequencies.includes(code);
                                return (
                                    <button
                                        key={code}
                                        onClick={() => toggleArrayFilter('frequencies', code)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl border-2 transition-all text-xs font-bold",
                                            isActive
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {FREQUENCY_LABELS[code]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Longueur */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longueur (lettres)</label>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{filters.minLetters}-{filters.maxLetters}</span>
                        </div>
                        <div className="px-1 pt-2">
                            <Slider
                                value={[filters.minLetters, filters.maxLetters]}
                                min={1}
                                max={20}
                                step={1}
                                onValueChange={([min, max]) => {
                                    updateFilter('minLetters', min);
                                    updateFilter('maxLetters', max);
                                }}
                                className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-600 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-blue-600 [&_.bg-secondary]:bg-slate-200 h-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
