import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from '@/lib/utils';

export function SessionPanel() {
    const { isPanelOpen, setIsPanelOpen } = usePlayer();

    return (
        <aside
            className={cn(
                "fixed inset-y-0 right-0 w-80 bg-neutral-900 border-l border-white/10 shadow-2xl z-[150] transition-transform duration-300 ease-in-out flex flex-col rounded-tl-xl",
                isPanelOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Header */}
            <div className="relative flex items-center justify-end p-4 border-b border-white/5 min-h-[60px]">
                <h2 className="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-neutral-300 uppercase tracking-[0.2em] pointer-events-none">
                    Session en cours
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors z-10"
                    onClick={() => setIsPanelOpen(false)}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Body - Word List Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-forwards">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                    <List className="w-5 h-5 text-neutral-500" />
                </div>
                <p className="text-sm font-medium text-neutral-300 mb-1">
                    Historique de session
                </p>
                <p className="text-xs text-neutral-500 max-w-[200px] leading-relaxed">
                    Les mots validés et à revoir s'afficheront ici en temps réel.
                </p>
            </div>
        </aside>
    );
}
