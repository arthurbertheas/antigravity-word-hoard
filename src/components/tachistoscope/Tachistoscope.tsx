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
        hasStarted,
        setCurrentIndex
    } = usePlayer();

    // Refs for precise timing and state tracking
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const beepTimerRef = React.useRef<NodeJS.Timeout | null>(null);
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
        if (beepTimerRef.current) {
            clearTimeout(beepTimerRef.current);
            beepTimerRef.current = null;
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

        // Audio Timing Logic: Beep 500ms before end of gap (if gap is long enough)
        // Skip beep if the NEXT word is the FIN word (Bravo) OR if it is the FIRST word (index 0)
        // For the first word (index 0), we want to beep ON DISPLAY, not before so we skip pre-roll.
        const isNextWordFin = currentIndex + 1 >= queue.length - 1;
        const isFirstWord = currentIndex === 0;

        if (phase === 'gap' && settings.enableSound && settings.gapMs >= 500 && !isNextWordFin) {
            const beepPreRoll = 500;
            const beepDelay = duration - beepPreRoll;

            if (beepDelay >= 0) {
                beepTimerRef.current = setTimeout(() => {
                    playBeep();
                }, beepDelay);
            } else {
                // If we resume with less than 500ms left, beep immediately
                // because the "display" trigger won't fire (since gapMs >= 500)
                playBeep();
            }
        }

        timerRef.current = setTimeout(() => {
            remainingRef.current = 0; // Consumed
            nextWord();
        }, duration);

        // Update trackers
        wasPlayingRef.current = true;
        lastIndexRef.current = currentIndex;
        lastPhaseRef.current = phase;

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
        };
    }, [isPlaying, currentIndex, phase, queue, settings.speedMs, settings.gapMs, setPhase, nextWord, setIsPlaying]);

    // Audio Feedback Trigger (On Display)
    // Only fires if gap is too short for the pre-roll logic (< 500ms) OR if it is the first word
    useEffect(() => {
        const isShortGap = settings.gapMs < 500;
        // Skip beep if CURRENT word is the FIN word
        const isFinWord = currentIndex >= queue.length - 1;
        const isFirstWord = currentIndex === 0;

        // We beep on display if:
        // 1. It's manual mode (!isPlaying)
        // 2. OR it's a short gap in auto mode (standard fallback)
        // 3. OR it's the first word (exception request)
        // AND it's not the Fin card.
        const shouldBeepOnDisplay = (!isPlaying || isShortGap || isFirstWord) && !isFinWord;

        if (phase === 'display' && hasStarted && settings.enableSound && shouldBeepOnDisplay) {
            playBeep();
        }
    }, [phase, hasStarted, settings.enableSound, settings.gapMs, currentIndex, queue, isPlaying]);

    return null;
}

function TachistoscopeContent({ onClose, words }: { onClose: () => void, words: Word[] }) {
    const {
        currentIndex,
        queue,
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
        MOTS: "Bravo !",
        PHONEMES: "bʀavo",
        GRAPHEMES: "",
        "segmentation graphèmes": "B-r-a-v-o-\u00A0-!",
        SYNT: "NC",
        "APPUI LEXICAL": "",
        NBSYLL: "2",
        "segmentation syllabique": "Bra.vo",
        "progression structure": "a",
        "progression graphèmes": "",
        GPMATCH: ""
    } as unknown as Word), []);

    // Initialize queue with FIN word appended
    useEffect(() => {
        if (!words || words.length === 0) return;

        // Skip update if queue already matches current words (plus FIN_WORD)
        // This prevents the "flash" and reset that wipes wordStatuses if words prop re-renders
        if (queue.length === words.length + 1 &&
            queue.slice(0, words.length).every((w, i) => w.MOTS === words[i].MOTS)) {
            return;
        }

        const effectiveWords = [...words, FIN_WORD];
        setQueue(effectiveWords);
        return () => resetSession();
    }, [words, FIN_WORD, setQueue, resetSession, queue.length]); // Added queue.length to trigger check

    // Keyboard Mapping
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore keyboard events if an interactive element has focus
            // This prevents conflicts with sliders, inputs, selects, etc. in the side panel
            const target = e.target as HTMLElement;
            const isInteractiveElement = target.tagName === 'INPUT' ||
                                        target.tagName === 'TEXTAREA' ||
                                        target.tagName === 'SELECT' ||
                                        target.getAttribute('role') === 'slider' ||
                                        target.getAttribute('role') === 'spinbutton' ||
                                        target.closest('[role="slider"]') !== null;

            if (isInteractiveElement) {
                // Let the interactive element handle the keyboard event
                return;
            }

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
                    if (currentIndex < words.length && queue[currentIndex]) {
                        const word = queue[currentIndex];
                        logResult(word.MOTS, 'success');
                        flashFeedback('positive');
                        if (word.uid) setWordStatus(word.uid, 'validated');
                    }
                    break;
                case 'ArrowDown': // Fail (No Skip)
                    e.preventDefault();
                    if (currentIndex < words.length && queue[currentIndex]) {
                        const word = queue[currentIndex];
                        logResult(word.MOTS, 'failed');
                        flashFeedback('negative');
                        if (word.uid) setWordStatus(word.uid, 'failed');
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
        MOTS: "Prêt ?",
        PHONEMES: "pʀɛ",
        GRAPHEMES: "",
        "segmentation graphèmes": "P-r-ê-t-\u00A0-?",
        SYNT: "NC",
        "APPUI LEXICAL": "",
        NBSYLL: "1",
        "segmentation syllabique": "Prêt",
        "progression structure": "a",
        "progression graphèmes": "",
        GPMATCH: ""
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
