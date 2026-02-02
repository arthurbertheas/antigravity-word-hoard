import { useState } from "react";
import { Word } from "@/types/word";
import { Search, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { WordCard } from "./WordCard";
import { Button } from "@/components/ui/button";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { cn } from "@/lib/utils";

interface WordBankProps {
    words: Word[];
}

const INITIAL_PAGE_SIZE = 48;
const PAGE_INCREMENT = 48;

export function WordBank({ words }: WordBankProps) {
    const { addItems, removeItems, selectedWords } = useSelection();
    const [displayLimit, setDisplayLimit] = useState(INITIAL_PAGE_SIZE);

    const isAllSelected = words.length > 0 && words.every(word =>
        selectedWords.some(sw => getWordId(sw) === getWordId(word))
    );

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            removeItems(words);
        } else {
            addItems(words);
        }
    };

    const hasMore = words.length > displayLimit;
    const currentWords = words.slice(0, displayLimit);

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + PAGE_INCREMENT);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header Removed (Redundant with Site Banner) */}

            {/* Scrollable Content (Sandwich: Flexible) */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth pt-2">
                {words.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">Aucun mot trouvé</h3>
                            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                                Essayez de modifier vos filtres pour voir plus de résultats.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12 text-slate-900">
                        {/* Refined Ceramic Toolbar - Edge-to-edge divider */}
                        <div className="flex items-end justify-between py-3 px-6 -mx-6 border-b border-slate-100 mb-6">
                            {/* GAUCHE : Compteur */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                                    Résultats
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-800 leading-none">{words.length}</span>
                                    <span className="text-sm font-medium text-slate-500">mots trouvés</span>
                                </div>
                            </div>

                            {/* DROITE : Bouton Toggle Smart */}
                            <button
                                onClick={handleToggleSelectAll}
                                disabled={words.length === 0}
                                className={cn(
                                    "group flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                                    isAllSelected
                                        ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                                )}
                            >
                                {isAllSelected ? (
                                    <XCircle className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                                )}
                                <span className={cn(
                                    "text-sm font-bold",
                                    isAllSelected
                                        ? "text-slate-500 group-hover:text-slate-800"
                                        : "text-slate-600 group-hover:text-blue-700"
                                )}>
                                    {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                            {currentWords.map((word) => (
                                <WordCard
                                    key={`${word.ORTHO}-${word.PHON}`}
                                    word={word}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4 border-t border-dashed border-border/50">
                                <div className="text-sm text-muted-foreground font-medium">
                                    Affichage de {displayLimit} sur {words.length} mots
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    className="h-12 px-8 rounded-xl font-bold border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02] flex items-center gap-2 group transition-all"
                                >
                                    <PlusCircle className="w-4 h-4 text-primary transition-transform group-hover:rotate-90" />
                                    Charger plus de mots
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
