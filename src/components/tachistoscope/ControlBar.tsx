import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Settings2,
    List
} from "lucide-react";
import { cn } from '@/lib/utils';

export function ControlBar() {
    const {
        isPlaying,
        setIsPlaying,
        currentIndex,
        queue,
        nextWord,
        prevWord,
        hasStarted,
        panelMode,
        togglePanelMode,
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

    // Calculate progress
    const lastWord = queue[queue.length - 1];
    const hasFin = lastWord?.ORTHO === 'FIN';
    const totalRealWords = hasFin ? queue.length - 1 : queue.length;
    const current = currentIndex + 1;

    return (
        <div
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-[60] transition-all duration-500",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
            )}
            style={{ bottom: '32px' }}
        >
            <div className="flex flex-col gap-4 px-8 py-5 bg-white/98 backdrop-blur-[20px] border border-border rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-w-[520px]">
                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(current / totalRealWords) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold font-sora text-primary tabular-nums min-w-[50px] text-right">
    {
        !hasStarted ?"PRÊT" : (hasFin && currentIndex >= totalRealWords) ? "FIN" : `${current}/${totalRealWords}`}
                    </span >
                </div >

            {/* Controls */ }
            < div className ="flex items-center justify-between gap-5">
        {/* Left: Playback buttons */ }
        <div className="flex items-center gap-3">
            < Button
        variant ="ghost"
        size ="icon"
        className ="w-11 h-11 rounded-full border-[1.5px] border-border bg-white text-muted-foreground hover:border-primary/60 hover:text-primary hover:bg-primary/5  transition-all"
        onClick = { prevWord }
        disabled = {!hasStarted
    }
                        >
        <SkipBack className="w-[18px] h-[18px] fill-current" />
                        </Button >

        <Button
            variant="secondary"
    size ="icon"
    className ="w-14 h-14 rounded-full bg-primary text-white hover:bg-primary-hover shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.4)]  transition-all duration-200"
    onClick = {() => setIsPlaying((p: boolean) => !p)
}
                        >
{
    isPlaying?(
                                <Pause className ="w-5 h-5 fill-current" />
    ): (
            <Play className ="w-5 h-5 fill-current ml-0.5" />
        )
}
                        </Button >

    <Button
        variant="ghost"
size ="icon"
className ="w-11 h-11 rounded-full border-[1.5px] border-border bg-white text-muted-foreground hover:border-primary/60 hover:text-primary hover:bg-primary/5  transition-all"
onClick = { nextWord }
disabled = { currentIndex === queue.length - 1}
                        >
    <SkipForward className="w-[18px] h-[18px] fill-current" />
                        </Button >
                    </div >

    {/* Center: Feedback Dot */ }
    < div
className = {
    cn(
        "w-3 h-3 rounded-full transition-all duration-200 ease-out",
        feedback === 'positive' ?"bg-[hsl(var(--dot-positive))]" :
feedback === 'negative' ?"bg-[hsl(var(--dot-negative))]" :
"bg-[hsl(var(--dot-neutral))]"
                        )}
                    />

{/* Right: Panel toggles */ }
<div className="flex items-center gap-2">
    < Button
variant ="ghost"
size ="icon"
className = {
    cn(
        "w-10 h-10 rounded-[10px] border-[1.5px] border-border bg-white text-muted-foreground hover:bg-background hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all",
        panelMode === 'config' && "bg-primary border-primary text-white hover:bg-primary-hover"
                            )}
onClick = {() => togglePanelMode('config')}
title ="Configuration (C)"
    >
    <Settings2 className="w-4 h-4" />
                        </Button >

    <Button
        variant="ghost"
size ="icon"
className = {
    cn(
        "w-10 h-10 rounded-[10px] border-[1.5px] border-border bg-white text-muted-foreground hover:bg-background hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all",
        panelMode === 'session' && "bg-primary border-primary text-white hover:bg-primary-hover"
                            )}
onClick = {() => togglePanelMode('session')}
title ="Liste des mots (L)"
    >
    <List className="w-4 h-4" />
                        </Button >
                    </div >
                </div >
            </div >
        </div >
    );
}

