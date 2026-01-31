import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize2
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
        settings
    } = usePlayer();

    const isManual = settings.mode === 'manual';

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
            <div className="flex items-center gap-6 px-6 py-3 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={prevWord}
                        disabled={currentIndex === 0}
                    >
                        <SkipBack className="w-5 h-5 fill-white" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 shadow-lg scale-110 transition-opacity",
                            isManual && "opacity-30 pointer-events-none"
                        )}
                        onClick={() => !isManual && setIsPlaying(!isPlaying)}
                        disabled={isManual}
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
                        className="text-white hover:bg-white/10"
                        onClick={nextWord}
                        disabled={currentIndex === queue.length - 1}
                    >
                        <SkipForward className="w-5 h-5 fill-white" />
                    </Button>
                </div>

                {/* Center: Info */}
                <div className="px-4 border-x border-white/10 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Progress</span>
                    <span className="text-sm font-black text-white tabular-nums tracking-widest">
                        {currentIndex + 1} <span className="text-white/30">/</span> {queue.length}
                    </span>
                </div>

                {/* Right: Settings */}
                <div className="flex items-center gap-2">
                    <SettingsPopover />
                </div>
            </div>
        </div>
    );
}
