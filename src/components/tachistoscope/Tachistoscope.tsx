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
        queue,
        phase,
        settings,
        setPhase,
        nextWord,
        setIsPlaying
    } = usePlayer();

    // Refs for precise timing and state tracking
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = React.useRef<number>(0);
    const remainingRef = React.useRef<number>(0);
    const wasPlayingRef = React.useRef(isPlaying);
    const lastIndexRef = React.useRef(currentIndex);

    useEffect(() => {
        // 1. Check Fin (Stop if needed)
        // If we reached the end (FIN word), stop auto-play.
        if (currentIndex >= queue.length - 1) {
            if (isPlaying) {
                setIsPlaying(false);
                setPhase('display');
            }
            return;
        }

        // 2. Clear previous timer to prevent overlap
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // 3. Handle PAUSE
        if (!isPlaying) {
            if (wasPlayingRef.current) {
                // We just paused. Capture remaining time.
                const elapsed = Date.now() - startTimeRef.current;
                const totalDuration = phase === 'display' ? settings.speedMs : settings.gapMs;
                remainingRef.current = Math.max(0, totalDuration - elapsed);
            }
            // Update state trackers even when paused
            wasPlayingRef.current = false;
            lastIndexRef.current = currentIndex;
            return;
        }

        // 4. Handle PLAY (Resume or Continue)

        // Check for Index Change (New Word Manually or Automatically)
        if (currentIndex !== lastIndexRef.current) {
            // New word context. Reset resume state.
            remainingRef.current = 0;

            // Force 'display' phase for new word logic
            // Note: If context already set it to gap (via nextWord), we override it here.
            if (phase !== 'display') {
                setPhase('display');
                lastIndexRef.current = currentIndex;
                wasPlayingRef.current = true;
                return; // Wait for effect re-run with new phase
            }
        }

        // Determine Duration
        // If remaining > 0, we are resuming an interrupted phase.
        // Otherwise use full phase duration.
        const duration = remainingRef.current > 0
            ? remainingRef.current
            : (phase === 'display' ? settings.speedMs : settings.gapMs);

        // Start Timer
        startTimeRef.current = Date.now();

        timerRef.current = setTimeout(() => {
            remainingRef.current = 0; // Consumed

            if (phase === 'display') {
                setPhase('gap');
            } else {
                nextWord();
            }
        }, duration);

        // Update trackers
        wasPlayingRef.current = true;
        lastIndexRef.current = currentIndex;

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentIndex, phase, queue.length, settings.speedMs, settings.gapMs, setPhase, nextWord, setIsPlaying]);

    return null;
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
        resetSession,
        hasStarted
    } = usePlayer();

    const FIN_WORD = React.useMemo(() => ({
        ORTHO: "FIN",
        GSEG: "F.I.N",
        PHON: "fɛ̃",
        SYNT: "NC",
        "fréquence": "", "code fréquence": "", NBSYLL: "", PSYLL: "",
        "code structure": "a", "code graphèmes": "", NBLET: "", NBPHON: "",
        NBGRAPH: "", PSEG: "", GPMATCH: ""
    } as unknown as Word), []);

    // Initialize queue with FIN word appended
    useEffect(() => {
        const effectiveWords = [...words, FIN_WORD];
        setQueue(effectiveWords);
        return () => resetSession();
    }, [words, FIN_WORD, setQueue, resetSession]);

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
                    if (words[currentIndex]) { // Only log for real words
                        // Check implies we shouldn't log for FIN_WORD ideally, or index check
                        // words[currentIndex] works because words doesn't have FIN_WORD
                        // So if currentIndex == words.length (which is FIN_WORD index), words[currentIndex] is undefined.
                        if (currentIndex < words.length) {
                            logResult(words[currentIndex].ORTHO, 'success');
                        }
                    }
                    break;
                case 'ArrowDown': // Fail + Skip
                    e.preventDefault();
                    if (currentIndex < words.length) {
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

    useEffect(() => {
        console.log("TachistoscopeContent mounted with", words.length, "words");
    }, [words.length]);

    if (words.length === 0) return null;

    const PREVIEW_WORD = {
        ORTHO: "PRÊT ?",
        GSEG: "P.R.Ê.T. ?",
        PHON: "pʀɛ",
        SYNT: "NC",
        "fréquence": "", "code fréquence": "", NBSYLL: "", PSYLL: "",
        "code structure": "a", "code graphèmes": "", NBLET: "", NBPHON: "",
        NBGRAPH: "", PSEG: "", GPMATCH: ""
    } as unknown as Word;

    const showPreview = !hasStarted;

    // Use queue from context to get the FIN word for display?
    // WordDisplay uses words[currentIndex].
    // Note: The parent `Tachistoscope` passes `words` prop.
    // But `queue` in context has `words + FIN`.
    // We should use `queue` for display source if possible, OR construct effectiveWords for display.
    // BUT `usePlayer` provides `queue`. We should probably use `queue[currentIndex]` for `WordDisplay`.
    // However, `TachistoscopeContent` here uses `words` prop for `WordDisplay`.

    // Let's grab `queue` from usePlayer to be safe and consistent with the appended word.
    const { queue } = usePlayer();

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
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
            <WordDisplay
                word={showPreview ? PREVIEW_WORD : queue[currentIndex]}
                forceVisible={showPreview || currentIndex >= words.length} // Force visible for FIN word (index >= original length)
            />

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
