import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { ListChecks, ChevronRight, X, Trash2 } from "lucide-react";

export function SelectionTray() {
    const { selectedWords, clearSelection, removeItem } = useSelection();

    return (
        <aside className="w-80 shrink-0 bg-card/10 flex flex-col h-full border-l border-border transition-all duration-300">
            {/* Header (Sandwich: Fixed) */}
            <div className="flex-none p-4 border-b border-border bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-primary" />
                        Ma Liste
                    </h2>
                    {selectedWords.length > 0 && (
                        <button
                            onClick={clearSelection}
                            className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 group"
                        >
                            <Trash2 className="w-3 sil-3 group-hover:scale-110 transition-transform" />
                            Vider
                        </button>
                    )}
                </div>
                <div className="text-2xl font-black text-foreground">
                    {selectedWords.length} <span className="text-sm font-medium text-muted-foreground">mots</span>
                </div>
            </div>

            {/* List Content (Sandwich: Flexible) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-card/5">
                {selectedWords.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <ListChecks className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground italic max-w-[150px]">
                            Cliquez sur un mot pour l'ajouter à votre liste.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedWords.map((word, i) => (
                            <div
                                key={getWordId(word)}
                                className="group p-3 bg-white rounded-xl border border-border shadow-sm text-sm flex items-center justify-between hover:border-primary/30 hover:shadow-md transition-all duration-200"
                            >
                                <span className="font-medium text-foreground">{word.ORTHO}</span>
                                <button
                                    onClick={() => removeItem(getWordId(word))}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    title="Supprimer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Action (Sandwich: Fixed) */}
            <div className="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-border">
                <Button
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 group bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={selectedWords.length === 0}
                    onClick={() => {
                        window.parent.postMessage({ type: 'launch_diaporama' }, '*');
                    }}
                >
                    Lancer la sélection
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter font-semibold">
                    Appuyez sur Entrée pour valider
                </p>
            </div>
        </aside>
    );
}
