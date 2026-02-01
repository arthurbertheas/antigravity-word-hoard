import { useState } from "react";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { ListChecks, ChevronRight, X, Trash2 } from "lucide-react";

export function SelectionTray() {
    const { selectedWords, clearSelection, removeItem, setIsFocusModeOpen } = useSelection();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Stats calculation
    const totalSyllables = selectedWords.reduce((acc, word) => acc + Number(word.SYLL || 0), 0);
    const avgSyllables = selectedWords.length > 0 ? (totalSyllables / selectedWords.length).toFixed(1) : 0;

    const handleClearRequest = () => {
        if (selectedWords.length > 5) {
            setShowClearConfirm(true);
        } else {
            clearSelection();
        }
    };

    return (
        <aside className="w-80 shrink-0 bg-card/10 flex flex-col h-full border-l border-border transition-all duration-300 rounded-tl-2xl overflow-hidden">
            {/* Header (Sandwich: Fixed) */}
            <div className="flex-none p-4 border-b border-border bg-white">
                <div className="flex items-center w-full mb-1 relative min-h-[24px]">
                    {/* Centered Title */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                            <ListChecks className="w-4 h-4 text-primary" />
                            Ma Liste
                        </h2>
                    </div>

                    {/* Right Actions */}
                    <div className="ml-auto flex items-center gap-2 z-10">
                        {selectedWords.length > 0 && (
                            <div className="flex items-center gap-2">
                                {showClearConfirm ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <button
                                            onClick={() => setShowClearConfirm(false)}
                                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => {
                                                clearSelection();
                                                setShowClearConfirm(false);
                                            }}
                                            className="text-[10px] font-bold text-destructive hover:underline"
                                        >
                                            Confirmer
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleClearRequest}
                                        className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 group"
                                    >
                                        <Trash2 className="w-3 group-hover:scale-110 transition-transform" />
                                        Vider
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-black text-foreground">
                        {selectedWords.length} <span className="text-sm font-medium text-muted-foreground">mots</span>
                    </div>
                </div>

                {/* Micro Stats Bar */}
                {selectedWords.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                            <div className="flex items-center gap-1">
                                <span className="text-primary">{totalSyllables}</span> Syllabes
                            </div>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="flex items-center gap-1">
                                Moy. <span className="text-primary">{avgSyllables}</span>
                            </div>
                        </div>

                        {/* Category Tags */}
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(
                                selectedWords.reduce((acc, word) => {
                                    const cat = word.SYNT || 'AUTRE';
                                    acc[cat] = (acc[cat] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([cat, count]) => (
                                <span key={cat} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-bold text-muted-foreground">
                                    {count} {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
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

            {/* Footer Action (Sandwich: Fixed at bottom) */}
            <div className="flex-none p-4 bg-white border-t border-border">
                <Button
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 group bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={selectedWords.length === 0}
                    onClick={() => {
                        setIsFocusModeOpen(true);
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
