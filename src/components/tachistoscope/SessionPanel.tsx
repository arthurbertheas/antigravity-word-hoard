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
            <div className="flex items-center p-4 border-b border-white/5 relative min-h-[64px]">
                {/* Centered Title */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em]">
                        Session en cours
                    </h2>
                </div>

                {/* Right Actions */}
                <div className="ml-auto z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsPanelOpen(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Body - Placeholder for word list */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Future word list will go here */}
                <div className="flex items-center justify-center h-full text-neutral-600 italic text-sm">
                    Liste bientôt disponible...
                </div>
            </div>
        </aside>
    );
}
