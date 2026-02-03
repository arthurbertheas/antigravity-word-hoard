import { useState } from "react";
import { Word } from "@/types/word";
import { Search, PlusCircle } from "lucide-react";
import { WordCard } from "./WordCard";
import { Button } from "@/components/ui/button";

interface WordBankProps {
    words: Word[];
}

const INITIAL_PAGE_SIZE = 48;
const PAGE_INCREMENT = 48;

export function WordBank({ words }: WordBankProps) {
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
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
