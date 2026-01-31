import React, { useEffect, useCallback } from 'react';
import { usePlayer, PlayerProvider } from '@/contexts/PlayerContext';
import { Word } from '@/types/word';
import { WordDisplay } from './WordDisplay';
import { ControlBar } from './ControlBar';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TachistoscopeProps {
    words: Word[];
    isOpen: boolean;
    onClose: () => void;
}

function PlayerEngine() {
    const {
        isPlaying,
        currentIndex,
        settings,
        setPhase,
        nextWord
    } = usePlayer();

    useEffect(() => {
        if (!isPlaying) return;

        let timer: NodeJS.Timeout;

        const runLoop = () => {
            // Phase 1: Display Word
            setPhase('display');

            timer = setTimeout(() => {
                // Phase 2: Gap
                setPhase('gap');

                timer = setTimeout(() => {
                    // Finish gap -> Next word (which restarts the loop via currentIndex dependency)
                    nextWord();
                }, settings.gapMs);

            }, settings.speedMs);
        };

        runLoop();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isPlaying, currentIndex, settings.speedMs, settings.gapMs, setPhase, nextWord]);

    return null; // Headless component
}

function TachistoscopeContent({ onClose, words }: { onClose: () => void, words: Word[] }) {
    const {
        currentIndex,
        isPlaying,
        setIsPlaying,
        nextWord,
        prevWord,
        logResult,
        setQueue,
        resetSession
    } = usePlayer();

    // Initialize queue
    useEffect(() => {
        setQueue(words);
        return () => resetSession();
    }, [words, setQueue, resetSession]);

    // Keyboard Mapping
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    setIsPlaying(!isPlaying);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextWord();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevWord();
                    break;
                case 'ArrowUp': // Success
                    e.preventDefault();
                    if (words[currentIndex]) {
                        logResult(words[currentIndex].ORTHO, 'success');
                        // Visual feedback could be added to ControlBar
                    }
                    break;
                case 'ArrowDown': // Fail + Skip
                    e.preventDefault();
                    if (words[currentIndex]) {
                        logResult(words[currentIndex].ORTHO, 'failed');
                        nextWord();
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentIndex, words, setIsPlaying, nextWord, prevWord, logResult, onClose]);

    if (words.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-6 right-6 z-[110] hover:bg-zinc-100"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </Button>

            {/* Main Reading Area */}
            <WordDisplay word={words[currentIndex]} />

            {/* Logic Hub */}
            <PlayerEngine />

            {/* Controls Overlay */}
            <ControlBar />
        </div>
    );
}

export function Tachistoscope({ words, isOpen, onClose }: TachistoscopeProps) {
    if (!isOpen) return null;

    return (
        <PlayerProvider>
            <TachistoscopeContent onClose={onClose} words={words} />
        </PlayerProvider>
    );
}
