import { useState, useEffect } from "react";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { ListChecks, ChevronRight, X, Trash2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectionTray() {
    const { selectedWords, clearSelection, removeItem, setIsFocusModeOpen } = useSelection();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('maListe_collapsed');
        if (saved !== null) return saved === 'true';
        return window.innerWidth <= 1440;
    });

    useEffect(() => {
        localStorage.setItem('maListe_collapsed', String(isCollapsed));
    }, [isCollapsed]);

    const togglePanel = () => setIsCollapsed(!isCollapsed);

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
        <aside className={cn(
            "shrink-0 bg-card/10 flex flex-col h-full border-l border-border transition-width-smooth overflow-hidden relative",
            isCollapsed ? "w-[64px]" : "w-80"
        )}>
            {/* Header (Sandwich: Fixed) */}
            <div className="flex-none p-4 border-b border-slate-100 bg-white min-h-[80px] flex items-center gap-3">
                {/* NOUVEAU : Bouton collapse */}
                <button
                    onClick={togglePanel}
                    className="flex-none w-8 h-8 rounded-lg border-[1.5px] border-border bg-white text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center group"
                    title={isCollapsed ? "Ouvrir (C)" : "Réduire (C)"}
                >
                    {isCollapsed ? (
                        <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    ) : (
                        <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Contenu du header (ne change pas mais fade out) */}
                <div className={cn(
                    "flex-1 flex items-center justify-between min-w-0 transition-all duration-300",
                    isCollapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
                )}>
                    <div className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-[rgb(var(--filter-accent))]" />
                        <h2 className="font-sora text-sm font-bold text-[rgb(var(--filter-text-primary))]">
                            Ma Liste
                        </h2>
                    </div>

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
            </div>

            {/* Stats Section with Collapsed Indicator */}
            <div className="flex-none p-4 border-b border-slate-50 bg-gradient-to-b from-white to-transparent relative min-h-[100px] flex flex-col justify-center">
                {/* Collapsed Indicator (Icon + Badge) */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-400 delay-200",
                    isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}>
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <ListChecks className="w-7 h-7 text-muted-foreground flex-none" />
                        {selectedWords.length > 0 && (
                            <span className="absolute top-0 right-0 translate-x-[25%] translate-y-[-25%] bg-primary text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-primary/30 origin-center z-10">
                                {selectedWords.length}
                            </span>
                        )}
                    </div>
                </div>

                {/* Full Stats (fade out) */}
                <div className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
                )}>
                    <div className="flex items-baseline gap-2 mb-2">
                        <div className="text-2xl font-black text-foreground">
                            {selectedWords.length} <span className="text-sm font-medium text-muted-foreground">mots</span>
                        </div>
                    </div>

                    {selectedWords.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                <div className="flex items-center gap-1">
                                    <span className="text-primary">{totalSyllables}</span> Syllabes
                                </div>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-1">
                                    Moy. <span className="text-primary">{avgSyllables}</span>
                                </div>
                            </div>

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
            </div>

            {/* List Content (Sandwich: Flexible) */}
            <div className={cn(
                "flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-card/5 transition-opacity duration-300",
                isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
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
            <div className="flex-none p-4 bg-white border-t border-border flex items-center justify-center">
                <button
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white border-none rounded-[14px] font-sora font-bold text-[15px] shadow-lg shadow-primary/30 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group whitespace-nowrap overflow-hidden",
                        isCollapsed ? "opacity-0 scale-75 pointer-events-none w-0 p-0" : "opacity-100 scale-100"
                    )}
                    disabled={selectedWords.length === 0}
                    onClick={() => {
                        setIsFocusModeOpen(true);
                    }}
                >
                    Lancer la sélection
                    <svg
                        className="w-4 h-4 transition-transform duration-250 ease-out group-hover:translate-x-[3px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Mini Launch Button */}
                <button
                    className={cn(
                        "absolute w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100",
                        isCollapsed ? "opacity-100 scale-100 delay-200" : "opacity-0 scale-75 pointer-events-none"
                    )}
                    disabled={selectedWords.length === 0}
                    onClick={() => setIsFocusModeOpen(true)}
                    title="Lancer la sélection"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </aside>
    );
}
