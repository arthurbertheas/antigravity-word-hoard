// Lovable Build Trigger 2: Applying Subtle Status Glow design
// Lovable Build Trigger: Restoring stable version of SessionPanel
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight } from "lucide-react";
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function SessionPanel() {
    const {
        isPanelOpen,
        setIsPanelOpen,
        queue,
        currentIndex,
        sessionLog,
        setCurrentIndex,
        resetSession
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

    // Performance stats based on attempted words (sessionLog)
    const totalAttempted = sessionLog.length;
    const successCount = sessionLog.filter(log => log.status === 'success').length;

    // Calculate success rate percentage (based on words played)
    const successRate = totalAttempted > 0 ? Math.round((successCount / totalAttempted) * 100) : 0;

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
                                    {successCount} <span className="text-[10px] opacity-70">/ {totalAttempted} Succès</span>
                                </span>
                                <span className="text-[10px] font-bold text-neutral-900">
                                    {successRate}%
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
                                const log = sessionLog.find(l => l.wordId === word.ORTHO);
                                const status = log?.status;

                                return (
                                    <li
                                        key={`${word.id}-${index}`}
                                        ref={isActive ? activeItemRef : null}
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl transition-all duration-300 cursor-pointer relative",
                                            "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)]",
                                            // Status Glow
                                            status === 'success' ? "border-l-4 border-l-emerald-500 hover:border-emerald-100" :
                                                status === 'failed' ? "border-l-4 border-l-rose-500 hover:border-rose-100" :
                                                    "border-l-4 border-l-transparent hover:border-slate-200",
                                            // Active State
                                            isActive && "ring-2 ring-slate-900/5 bg-slate-50/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-slate-300 w-4 tabular-nums">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                            <span className={cn(
                                                "text-base font-semibold transition-colors",
                                                status === 'success' ? "text-slate-700 group-hover:text-emerald-700" :
                                                    status === 'failed' ? "text-slate-700 group-hover:text-rose-700" :
                                                        isActive ? "text-slate-800" : "text-slate-400"
                                            )}>
                                                {word.ORTHO}
                                            </span>
                                        </div>

                                        {/* Circular Status Icon */}
                                        <div className="flex-none transition-transform duration-300 group-hover:scale-110">
                                            {status === 'success' && (
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                                                    <Check className="w-5 h-5 stroke-[2.5]" />
                                                </div>
                                            )}
                                            {status === 'failed' && (
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
                                                    <X className="w-5 h-5 stroke-[2.5]" />
                                                </div>
                                            )}
                                            {!status && (
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-100 group-hover:border-slate-300 transition-colors" />
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Sticky Footer CTA */}
                <div className="flex-none p-6 border-t border-slate-100 bg-white">
                    <button
                        onClick={() => {
                            resetSession();
                            setIsPanelOpen(false);
                        }}
                        className="w-full py-4 px-6 bg-[#3B82F6] text-white font-bold rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                        Terminer la session
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] text-center mt-4">
                        Appuyez sur Entrée pour valider
                    </p>
                </div>
            </aside>
        </>
    );
}
