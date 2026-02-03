import React, { useEffect, useCallback } from 'react';
import { usePlayer, PlayerProvider } from '@/contexts/PlayerContext';
import { Word } from '@/types/word';
import { WordDisplay } from './WordDisplay';
import { ControlBar } from './ControlBar';
import { SidePanel } from './SidePanel';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { playBeep } from '@/utils/audio';

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
        setIsPlaying,
        hasStarted
    } = usePlayer();

    // Refs for precise timing and state tracking
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = React.useRef<number>(0);
    const remainingRef = React.useRef<number>(0);
    const wasPlayingRef = React.useRef(isPlaying);
    const lastIndexRef = React.useRef(currentIndex);
    const lastPhaseRef = React.useRef(phase);

    useEffect(() => {
        // 1. Check Fin (Stop if needed)
        if (currentIndex >= queue.length - 1 && isPlaying) {
            setIsPlaying(false);
            setPhase('display');
            return;
        }

        // 2. Clear previous timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // 3. Handle PAUSE
        if (!isPlaying) {
            if (wasPlayingRef.current) {
                // Just paused
                const elapsed = Date.now() - startTimeRef.current;
                const totalDuration = phase === 'display' ? settings.speedMs : settings.gapMs;
                remainingRef.current = Math.max(0, totalDuration - elapsed);
            } else {
                // Already paused. Check if we navigated manually.
                const indexChanged = currentIndex !== lastIndexRef.current;
                const phaseChanged = phase !== lastPhaseRef.current;
                if (indexChanged || phaseChanged) {
                    remainingRef.current = 0; // Clear stale timing
                }
            }
            // Update state
            wasPlayingRef.current = false;
            lastIndexRef.current = currentIndex;
            lastPhaseRef.current = phase;
            return;
        }

        // 4. Handle PLAY (Resume or Continue)

        // Check for State Change (Index OR Phase changed manually or naturally)
        // If Index changed OR Phase changed manually (e.g. via Prev btn), we treat as fresh step.
        const indexChanged = currentIndex !== lastIndexRef.current;
        const phaseChanged = phase !== lastPhaseRef.current;

        if (indexChanged || phaseChanged) {
            // Reset resume state
            remainingRef.current = 0;

            // Logic for forcing display is now handled by nextWord/prevWord directly setting phase.
            // We purely react to the new state here.
        }

        // Determine Duration
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
        lastPhaseRef.current = phase;

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentIndex, phase, queue.length, settings.speedMs, settings.gapMs, setPhase, nextWord, setIsPlaying]);

    // Audio Feedback Trigger
    useEffect(() => {
        if (phase === 'display' && hasStarted && settings.enableSound) {
            playBeep();
        }
    }, [phase, hasStarted, settings.enableSound]);

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
        hasStarted,
        triggerFeedback,
        flashFeedback,
        togglePanelMode,
        setWordStatus,
        isPanelOpen
    } = usePlayer();

    const FIN_WORD = React.useMemo(() => ({
        ORTHO: "Bravo !",
        GSEG: "B.r.a.v.o.\u00A0.!",
        PHON: "bʀavo",
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
                    if (currentIndex < words.length) {
                        logResult(words[currentIndex].ORTHO, 'success');
                        flashFeedback('positive');
                        setWordStatus(currentIndex, 'validated');
                    }
                    break;
                case 'ArrowDown': // Fail (No Skip)
                    e.preventDefault();
                    if (currentIndex < words.length) {
                        logResult(words[currentIndex].ORTHO, 'failed');
                        flashFeedback('negative');
                        setWordStatus(currentIndex, 'failed');
                    }
                    break;
                case 'KeyC': // Config panel
                    e.preventDefault();
                    togglePanelMode('config');
                    break;
                case 'KeyL': // Liste panel
                    e.preventDefault();
                    togglePanelMode('session');
                    break;
                case 'Escape':
                    // e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentIndex, words, setIsPlaying, nextWord, prevWord, logResult, onClose, flashFeedback, togglePanelMode, setWordStatus]);

    useEffect(() => {
        console.log("TachistoscopeContent mounted with", words.length, "words");
    }, [words.length]);

    if (words.length === 0) return null;

    const PREVIEW_WORD = {
        ORTHO: "Prêt ?",
        GSEG: "P.r.ê.t.\u00A0.?",
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
            {/* Close Button - Hidden when SidePanel is open to prevent z-index conflict */}
            {!isPanelOpen && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-6 right-6 z-[110] hover:bg-zinc-100"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </Button>
            )}

            {/* Main Reading Area */}
            <WordDisplay
                word={showPreview ? PREVIEW_WORD : queue[currentIndex]}
                forceVisible={showPreview || currentIndex >= words.length} // Force visible for FIN word (index >= original length)
            />

            {/* Logic Hub */}
            <PlayerEngine />

            {/* Controls Overlay */}
            <ControlBar />

            {/* Side Panel Overlay */}
            <SidePanel />
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
