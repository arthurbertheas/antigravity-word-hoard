import { useState } from "react";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, X as XClose } from "lucide-react";
import { Word } from "@/types/word";
import { cn } from "@/lib/utils";

// --- WordRow Component (Hover Reveal) ---
function WordRow({
    word,
    index,
    onRemove,
    status,
    onStatusChange
}: {
    word: Word,
    index: number,
    onRemove: () => void,
    status?: 'success' | 'failed' | 'neutral',
    onStatusChange: (status: 'success' | 'failed' | 'neutral') => void
}) {
    const currentStatus = status || 'neutral';

    return (
        <li className="group flex items-center justify-between p-3 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer border-b border-dashed border-neutral-100 last:border-0">
            {/* GAUCHE : Indicateur + Mot */}
            <div className="flex items-center gap-4">
                {/* Barre de couleur dynamique */}
                <div className={cn(
                    "w-1 h-8 rounded-full transition-colors",
                    currentStatus === 'success' ? 'bg-emerald-500' :
                        currentStatus === 'failed' ? 'bg-rose-500' : 'bg-neutral-200'
                )} />

                <span className="text-neutral-700 font-medium select-none">
                    {word.ORTHO}
                </span>
            </div>

            {/* DROITE : Actions (Visible uniquement au hover) */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

                {/* Actions de Scoring */}
                <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange('success'); }}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        currentStatus === 'success' ? "text-emerald-500 bg-emerald-50" : "text-neutral-300 hover:text-emerald-500 hover:bg-emerald-50"
                    )}
                    title="Valider"
                >
                    <Check className="w-5 h-5" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange('failed'); }}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        currentStatus === 'failed' ? "text-rose-500 bg-rose-50" : "text-neutral-300 hover:text-rose-500 hover:bg-rose-50"
                    )}
                    title="Raté"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Séparateur visuel */}
                <div className="w-px h-4 bg-neutral-200 mx-1"></div>

                {/* Action Delete */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="p-1.5 hover:bg-red-50 rounded text-neutral-300 hover:text-red-600 transition-colors"
                    title="Supprimer le mot"
                >
                    <Trash2 className="w-4 h-4 ml-1" />
                </button>
            </div>
        </li>
    );
}

// --- Main Panel Component ---
export function SelectionTray() {
    const { selectedWords, clearSelection, removeItem, isTrayOpen, setIsTrayOpen, setIsFocusModeOpen } = useSelection();
    // Local state for word statuses (simple map for demo purposes, reset on reload)
    // In a real app, this should likely be in context or persisted if it matters before "Launch".
    const [wordStatuses, setWordStatuses] = useState<Record<string, 'success' | 'failed' | 'neutral'>>({});

    const handleStatusChange = (wordId: string, status: 'success' | 'failed' | 'neutral') => {
        setWordStatuses(prev => ({ ...prev, [wordId]: status }));
    };

    if (!isTrayOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                onClick={() => setIsTrayOpen(false)}
            />

            {/* Clean List Panel */}
            <aside className="fixed right-0 top-0 h-full w-[400px] z-[70] bg-white shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Ma Liste</h2>
                        <p className="text-sm text-neutral-500 mt-1">{selectedWords.length} mots sélectionnés</p>
                    </div>

                    <button
                        onClick={() => setIsTrayOpen(false)}
                        className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <XClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {selectedWords.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">📝</span>
                            </div>
                            <p className="text-sm text-neutral-500">Votre liste est vide.</p>
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {selectedWords.map((word, i) => {
                                const id = getWordId(word);
                                return (
                                    <WordRow
                                        key={id}
                                        index={i + 1}
                                        word={word}
                                        onRemove={() => removeItem(id)}
                                        status={wordStatuses[id]}
                                        onStatusChange={(status) => handleStatusChange(id, status)}
                                    />
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-neutral-100 space-y-3">
                    <Button
                        onClick={() => {
                            setIsTrayOpen(false);
                            setIsFocusModeOpen(true);
                        }}
                        disabled={selectedWords.length === 0}
                        className="w-full h-12 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
                    >
                        Lancer l'entraînement
                    </Button>

                    {selectedWords.length > 0 && (
                        <button
                            onClick={clearSelection}
                            className="w-full text-center text-xs font-semibold text-neutral-400 hover:text-rose-500 uppercase tracking-wider py-2 transition-colors"
                        >
                            Tout effacer
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
