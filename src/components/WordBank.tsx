import { useState } from "react";
import { Word } from "@/types/word";
import { Search, PlusCircle } from "lucide-react";
import { WordCard } from "./WordCard";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useSelection } from "@/contexts/SelectionContext";

interface WordBankProps {
    words: Word[];
}

const INITIAL_PAGE_SIZE = 48;
const PAGE_INCREMENT = 48;

export function WordBank({ words }: WordBankProps) {
    const { addItems } = useSelection();
    const [displayLimit, setDisplayLimit] = useState(INITIAL_PAGE_SIZE);

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
                        <div className="flex items-center justify-between py-3 px-6 -mx-6 border-b border-slate-100 mb-6">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">
                                {words.length} {words.length > 1 ? "mots" : "mot"}
                            </span>

                            <button
                                className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-out hover:bg-blue-100 hover:border-blue-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => addItems(words)}
                                disabled={words.length === 0}
                            >
                                <CheckCircle className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                <span>Tout sélectionner</span>
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
