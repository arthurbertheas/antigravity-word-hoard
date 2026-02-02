import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize2,
    List
} from "lucide-react";
import { cn } from '@/lib/utils';
import { SettingsPopover } from './SettingsPopover';

export function ControlBar() {
    const {
        isPlaying,
        setIsPlaying,
        currentIndex,
        queue,
        nextWord,
        prevWord,
        hasStarted,
        isPanelOpen,
        setIsPanelOpen,
        feedback
    } = usePlayer();

    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-hide logic
    useEffect(() => {
        const handleMouseMove = () => {
            setIsVisible(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                if (isPlaying) setIsVisible(false);
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        handleMouseMove(); // Initial trigger

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isPlaying]);

    return (
        <div
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-[60] transition-all duration-500",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
            )}
            style={{ bottom: '8%' }}
        >
            <div className="flex items-center gap-2 px-3 py-3 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                {/* Left: Navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        onClick={prevWord}
                        disabled={!hasStarted}
                    >
                        <SkipBack className="w-5 h-5 fill-current" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        className="w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:scale-105 transition-all duration-200"
                        onClick={() => setIsPlaying((p: boolean) => !p)}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-1" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        onClick={nextWord}
                        disabled={currentIndex === queue.length - 1}
                    >
                        <SkipForward className="w-5 h-5 fill-current" />
                    </Button>
                </div>

                <div className="w-px h-8 bg-slate-200 mx-1"></div>

                {/* Center: Info */}
                <div className="flex flex-col items-center px-2 min-w-[80px] select-none">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Progress</span>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {(() => {
                            const lastWord = queue[queue.length - 1];
                            const hasFin = lastWord?.ORTHO === 'FIN';
                            const totalRealWords = hasFin ? queue.length - 1 : queue.length;

                            if (!hasStarted) {
                                return "PRÊT";
                            }

                            if (hasFin && currentIndex >= totalRealWords) {
                                return "FIN";
                            }

                            return (
                                <>
                                    {currentIndex + 1} <span className="text-slate-300">/</span> {totalRealWords}
                                </>
                            );
                        })()}
                    </span>
                </div>

                {/* Micro-Feedback: Status Dot (Hidden or integrated subtly) */}
                <div
                    className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-200 ease-in-out ml-2 mr-1",
                        feedback === 'success' ? "bg-neutral-300 shadow-[0_0_8px_rgba(255,255,255,0.2)]" :
                            feedback === 'error' ? "bg-neutral-800" :
                                "bg-neutral-600"
                    )}
                />

                {/* Right: Settings & List */}
                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "w-10 h-10 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors",
                            isPanelOpen && "bg-blue-50 text-blue-600"
                        )}
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                    <SettingsPopover />
                </div>
            </div>
        </div>
    );
}
