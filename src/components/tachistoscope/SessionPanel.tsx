import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function SessionPanel() {
    const {
        isPanelOpen,
        setIsPanelOpen,
        queue,
        currentIndex,
        sessionLog,
        setCurrentIndex
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

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300",
                    isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsPanelOpen(false)}
            />

            {/* Side Panel */}
            <aside
                className={cn(
                    "fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
                    isPanelOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header (Sticky Top) */}
                <div className="flex-none p-6 pb-0 relative bg-white sticky top-0 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            Session en cours
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            onClick={() => setIsPanelOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                                RÉSUMÉ SESSION
                            </span>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-neutral-500">
                                    {successCount} <span className="text-[10px] opacity-70">/ {totalWords} Succès</span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-900">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px w-full bg-neutral-100" />
                </div>

                {/* Body (Scroll Area) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {visualQueue.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-neutral-400 italic text-sm">
                            Aucun mot dans la session
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {visualQueue.map((word, index) => {
                                const isActive = index === currentIndex;
                                const isPast = index < currentIndex;
                                const isFuture = index > currentIndex;

                                // Find log for this index/word (simplified for now)
                                const log = sessionLog.find(l => l.wordId === word.id); // This might need refinement if wordId is not unique in queue
                                const status = log?.status;

                                return (
                                    <li
                                        key={`${word.id}-${index}`}
                                        ref={isActive ? activeItemRef : null}
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg text-sm transition-all cursor-pointer group",
                                            isActive ? "bg-neutral-100 text-neutral-900 font-semibold ring-1 ring-neutral-200" : "hover:bg-neutral-50",
                                            isPast && "text-neutral-500",
                                            isFuture && "text-neutral-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-[10px] tabular-nums text-neutral-300 w-4 inline-block shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="truncate">
                                                {word.ORTHO}
                                            </span>
                                        </div>

                                        <div className="flex-none ml-2">
                                            {isPast && status === 'success' && (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            )}
                                            {isPast && status === 'failed' && (
                                                <XCircle className="w-4 h-4 text-rose-500" />
                                            )}
                                            {isFuture && (
                                                <span className="text-[10px] font-bold text-neutral-300 group-hover:text-neutral-400 transition-colors">

                                                </span>
                                            )}
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
