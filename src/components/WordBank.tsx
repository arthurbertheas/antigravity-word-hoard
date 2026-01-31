import { Word } from "@/types/word";
import { Search } from "lucide-react";

interface WordBankProps {
    words: Word[];
}

export function WordBank({ words }: WordBankProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Banque de mots
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {words.length} résultats trouvés
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                        {/* Placeholder for Lot 2 */}
                        {words.slice(0, 50).map((word, i) => (
                            <div
                                key={i}
                                className="aspect-square p-4 rounded-2xl border border-dashed border-border/60 text-xs font-medium text-muted-foreground/60 flex items-center justify-center text-center animate-in fade-in zoom-in duration-300"
                                style={{ animationDelay: `${i * 20}ms` }}
                            >
                                {word.ORTHO}
                            </div>
                        ))}
                    </div>
                )}

                {words.length > 50 && (
                    <div className="py-8 flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Chargement (Lot 2)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
