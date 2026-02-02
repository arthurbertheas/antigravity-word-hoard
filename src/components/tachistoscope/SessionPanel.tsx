import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { X, Check, X as XMark, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export function SessionPanel() {
    const {
        isPanelOpen,
        setIsPanelOpen,
        queue,
        currentIndex,
        sessionLog,
        setCurrentIndex,
        logResult,
        triggerFeedback,
        setQueue
    } = usePlayer();

    const activeItemRef = useRef<HTMLLIElement>(null);

    // Auto-scroll to active item
    useEffect(() => {
        if (isPanelOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentIndex, isPanelOpen]);

    // Exclude "FIN" for visual representaiton and stats
    const visualQueue = queue.filter(w => w.ORTHO !== 'FIN');
    const totalWords = visualQueue.length;
    const successCount = sessionLog.filter(log => log.status === 'success').length;
    const progressPercentage = totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0;

    const handleDelete = (wordId: string) => {
        const newQueue = queue.filter(w => w.id !== wordId);
        setQueue(newQueue);
        // Adjust index if needed
        if (currentIndex >= newQueue.length && newQueue.length > 0) {
            setCurrentIndex(newQueue.length - 1);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] transition-opacity duration-300",
                    isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsPanelOpen(false)}
            />

            <aside
                className={cn(
                    "fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-[150] transition-transform duration-300 ease-in-out flex flex-col",
                    isPanelOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header (Sticky Top) */}
                <div className="flex-none pt-6 px-6 relative bg-white sticky top-0 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            SESSION EN COURS
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            onClick={() => setIsPanelOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Fine Progress Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Body (Scroll Area) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {visualQueue.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-neutral-400 italic text-sm">
                            Aucun mot dans la session
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {visualQueue.map((word, index) => {
                                const isActive = index === currentIndex;
                                // Find log for this word/index
                                const log = sessionLog.find(l => l.wordId === word.id);
                                const status = log?.status || 'pending';

                                return (
                                    <li
                                        key={`${word.id}-${index}`}
                                        ref={isActive ? activeItemRef : null}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg transition-colors cursor-default",
                                            isActive ? "bg-neutral-50 ring-1 ring-neutral-200" : "hover:bg-neutral-50"
                                        )}
                                    >
                                        {/* ZONE GAUCHE : Indicateur + Texte */}
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Status Pill */}
                                            <div className={cn(
                                                "w-1.5 h-5 rounded-full transition-colors shrink-0",
                                                status === 'success' ? 'bg-emerald-500' :
                                                    status === 'failed' ? 'bg-rose-500' :
                                                        'bg-neutral-200'
                                            )} />

                                            <span
                                                onClick={() => setCurrentIndex(index)}
                                                className={cn(
                                                    "text-sm font-medium transition-colors cursor-pointer truncate",
                                                    status === 'pending' ? 'text-neutral-400' : 'text-neutral-700',
                                                    isActive && "text-neutral-900 font-bold"
                                                )}
                                            >
                                                {word.ORTHO}
                                            </span>
                                        </div>

                                        {/* ZONE DROITE : Actions (Visible on Hover only) */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                                            {/* Actions de Scoring */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    logResult(word.id, 'success');
                                                    triggerFeedback('success');
                                                }}
                                                className="p-1.5 rounded-md hover:bg-emerald-50 text-neutral-300 hover:text-emerald-500 transition-colors"
                                                title="Valider"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    logResult(word.id, 'failed');
                                                    triggerFeedback('error');
                                                }}
                                                className="p-1.5 rounded-md hover:bg-rose-50 text-neutral-300 hover:text-rose-500 transition-colors"
                                                title="Marquer comme raté"
                                            >
                                                <XMark className="w-5 h-5" />
                                            </button>
                                            <div className="w-px h-4 bg-neutral-200 mx-2" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(word.id);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-red-50 text-neutral-300 hover:text-red-600 transition-colors"
                                                title="Supprimer le mot"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </aside>
        </>
    );
}
