import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
                    "fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-[150] transition-transform duration-300 ease-in-out flex flex-col rounded-tl-2xl overflow-hidden",
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
                        <ul className="space-y-2 p-2">
                            {visualQueue.map((word, index) => {
                                const isActive = index === currentIndex;
                                const isPast = index < currentIndex;

                                // Find log for this index/word
                                const log = sessionLog.find(l => l.wordId === word.id);
                                const status = log?.status;

                                return (
                                    <li
                                        key={`${word.id}-${index}`}
                                        ref={isActive ? activeItemRef : null}
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border border-neutral-200/60 transition-all cursor-pointer group relative",
                                            // Status Borders
                                            status === 'success' ? "border-l-emerald-500" :
                                                status === 'failed' ? "border-l-rose-500" :
                                                    "border-l-transparent hover:border-l-neutral-200",
                                            // Active State
                                            isActive && "ring-1 ring-neutral-900/5 bg-neutral-50/50"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-medium ml-3 text-sm flex items-center gap-3",
                                            status === 'failed' ? "text-neutral-700" : "text-neutral-900",
                                            isPast && !status && "text-neutral-400"
                                        )}>
                                            <span className="text-neutral-400 font-normal text-xs">{index + 1}</span>
                                            {word.ORTHO}
                                        </span>
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
