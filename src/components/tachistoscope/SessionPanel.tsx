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
        <aside
            className={cn(
                "fixed inset-y-0 right-0 w-80 bg-neutral-900 border-l border-white/10 shadow-2xl z-[150] transition-transform duration-300 ease-in-out flex flex-col rounded-tl-2xl overflow-hidden",
                isPanelOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Header (Sticky Top) */}
            <div className="flex-none p-4 pb-0 border-b border-white/5 relative min-h-[64px] bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em]">
                        Session en cours
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsPanelOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                            RÉSUMÉ SESSION
                        </span>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-400">
                                {successCount} <span className="text-[10px] opacity-50">/ {totalWords} Succès</span>
                            </span>
                            <span className="text-[10px] font-bold text-neutral-500">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Body (Scroll Area) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {visualQueue.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-600 italic text-sm">
                        Aucun mot dans la session
                    </div>
                ) : (
                    <ul className="p-2 space-y-1">
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
                                        "flex items-center justify-between p-3 rounded-md text-sm transition-all cursor-pointer group",
                                        isActive ? "bg-white/5 text-white font-semibold border-l-2 border-purple-500 pl-2.5" : "hover:bg-white/5",
                                        isPast && "text-neutral-400",
                                        isFuture && "text-neutral-600"
                                    )}
                                >
                                    <span className="truncate pr-2">
                                        <span className="text-[10px] tabular-nums opacity-30 mr-2 w-4 inline-block">
                                            {index + 1}
                                        </span>
                                        {word.ORTHO}
                                    </span>

                                    <div className="flex-none">
                                        {isPast && status === 'success' && (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        )}
                                        {isPast && status === 'failed' && (
                                            <XCircle className="w-4 h-4 text-rose-500" />
                                        )}
                                        {isFuture && (
                                            <span className="text-[10px] font-bold text-neutral-800 group-hover:text-neutral-700 transition-colors">
                                                {index + 1}
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
    );
}
