import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Word } from '@/types/word';
import { normalizeWords } from '@/utils/word-normalization';
import { loadUserTachistoscopeSettings, saveUserTachistoscopeSettings, TachistoscopeSettings } from '@/lib/supabase';

export type PlayerPhase = 'display' | 'gap';
export type FeedbackType = 'positive' | 'negative';

export interface PlayerSettings {
    speedMs: number;
    gapMs: number;
    fontSize: number;
    fontFamily: 'arial' | 'verdana' | 'mdi-ecole' | 'sans' | 'serif' | 'mono' | 'opendyslexic';
    highlightVowels: boolean;
    highlightSilent: boolean;
    spacingValue: number;
    spacingMode: 'letters' | 'graphemes' | 'syllables';
    showFocusPoint: boolean;
    enableSound: boolean;
}

export interface SessionLog {
    wordId: string;
    status: 'success' | 'failed' | 'skipped';
    timestamp: number;
}

export type PanelMode = 'config' | 'session' | 'stats';
export type WordStatus = 'neutral' | 'current' | 'validated' | 'failed';

interface PlayerContextType {
    queue: Word[];
    currentIndex: number;
    isPlaying: boolean;
    phase: PlayerPhase;
    hasStarted: boolean;
    startTime: number | null;
    settings: PlayerSettings;
    sessionLog: SessionLog[];
    setQueue: (words: Word[]) => void;
    setCurrentIndex: (index: number) => void;
    setIsPlaying: (updater: boolean | ((prev: boolean) => boolean)) => void;
    setPhase: (phase: PlayerPhase) => void;
    setHasStarted: (started: boolean) => void;
    updateSettings: (settings: Partial<PlayerSettings>) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    panelMode: PanelMode;
    togglePanelMode: (mode: PanelMode) => void;
    feedback: FeedbackType | null;
    triggerFeedback: (type: FeedbackType) => void;
    flashFeedback: (type: 'positive' | 'negative') => void;
    setWordStatus: (uid: string, status: WordStatus) => void;
    wordStatuses: Map<string, WordStatus>;
    cycleWordStatus: (uid: string) => void;
    isShuffled: boolean;
    toggleShuffle: () => void;
    logResult: (wordId: string, status: 'success' | 'failed' | 'skipped') => void;
    nextWord: () => void;
    prevWord: () => void;
    resetSession: () => void;
}

const STORAGE_KEY = 'tachistoscope-settings';

const DEFAULT_SETTINGS: PlayerSettings = {
    speedMs: 3000,           // 3 secondes d'exposition
    gapMs: 2000,             // 2 secondes de pause inter-mots
    fontSize: 10,            // Zoom 10x
    fontFamily: 'arial',     // Police Arial
    highlightVowels: false,  // Pas de coloration des voyelles
    highlightSilent: false,  // Pas de coloration des lettres muettes
    spacingValue: 2,         // Espacement 0,2x (divisé par 10 pour l'affichage)
    spacingMode: 'letters',  // Mode lettres
    showFocusPoint: true,    // Point de fixation activé
    enableSound: true,       // Son activé
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState<PlayerPhase>('display');
    const [hasStarted, setHasStarted] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>('session');
    const [feedback, setFeedback] = useState<FeedbackType | null>(null);
    const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
    const [wordStatuses, setWordStatuses] = useState<Map<string, WordStatus>>(new Map());
    const [isShuffled, setIsShuffled] = useState(false);
    const [originalQueue, setOriginalQueue] = useState<Word[] | null>(null);

    // Simple & Clean initialization
    const [settings, setSettings] = useState<PlayerSettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return DEFAULT_SETTINGS;

            const parsed = JSON.parse(saved);

            // Migration: rename letterSpacing to spacingValue if it exists
            if (parsed.letterSpacing !== undefined && parsed.spacingValue === undefined) {
                parsed.spacingValue = parsed.letterSpacing;
                delete parsed.letterSpacing;
            }

            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    });

    const [startTime, setStartTime] = useState<number | null>(null);
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Load settings from Supabase on mount (if user is authenticated)
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const userSettings = await loadUserTachistoscopeSettings();
                if (userSettings) {
                    // Convert TachistoscopeSettings to PlayerSettings format
                    const loadedSettings: PlayerSettings = {
                        speedMs: userSettings.speed_ms,
                        gapMs: userSettings.gap_ms,
                        fontSize: userSettings.font_size,
                        fontFamily: userSettings.font_family,
                        highlightVowels: userSettings.highlight_vowels,
                        highlightSilent: userSettings.highlight_silent,
                        spacingValue: userSettings.spacing_value,
                        spacingMode: userSettings.spacing_mode,
                        showFocusPoint: userSettings.show_focus_point,
                        enableSound: userSettings.enable_sound,
                    };
                    setSettings(loadedSettings);
                }
            } catch (error) {
                console.error('Failed to load user settings from Supabase:', error);
            } finally {
                setSettingsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    // Save settings to localStorage and Supabase when they change
    useEffect(() => {
        // Skip saving during initial load
        if (!settingsLoaded) return;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

        // Save to Supabase (async, fire-and-forget)
        const saveToSupabase = async () => {
            try {
                const supabaseSettings: Omit<TachistoscopeSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
                    speed_ms: settings.speedMs,
                    gap_ms: settings.gapMs,
                    font_size: settings.fontSize,
                    font_family: settings.fontFamily,
                    highlight_vowels: settings.highlightVowels,
                    highlight_silent: settings.highlightSilent,
                    spacing_value: settings.spacingValue,
                    spacing_mode: settings.spacingMode,
                    show_focus_point: settings.showFocusPoint,
                    enable_sound: settings.enableSound,
                };
                await saveUserTachistoscopeSettings(supabaseSettings);
            } catch (error) {
                console.error('Failed to save settings to Supabase:', error);
            }
        };

        saveToSupabase();
    }, [settings, settingsLoaded]);

    // Toggle body class for floating bar visibility
    useEffect(() => {
        if (isPanelOpen) {
            document.body.classList.add('panel-open');
        } else {
            document.body.classList.remove('panel-open');
        }
    }, [isPanelOpen]);

    // Set start time when hasStarted becomes true
    useEffect(() => {
        if (hasStarted && !startTime) {
            setStartTime(Date.now());
        } else if (!hasStarted) {
            setStartTime(null);
        }
    }, [hasStarted, startTime]);

    // Map font family setting to actual font name for preloading
    const getFontName = (family: string): string | null => {
        switch (family) {
            case 'mdi-ecole': return 'MDI Ecole';
            case 'opendyslexic': return 'OpenDyslexic';
            default: return null;
        }
    };

    const updateSettings = useCallback((newSettings: Partial<PlayerSettings>) => {
        if (newSettings.fontFamily) {
            const fontName = getFontName(newSettings.fontFamily);
            if (fontName && document.fonts) {
                document.fonts.load(`1em "${fontName}"`).catch(console.warn);
            }
        }
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const triggerFeedback = useCallback((type: FeedbackType) => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 200);
    }, []);

    const flashFeedback = useCallback((type: 'positive' | 'negative') => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 200);
    }, []);

    const handleSetQueue = useCallback((words: Word[]) => {
        const normalizedWords = normalizeWords(words);
        // Ensure ALL words have a stable UID based on content and position
        const wordsWithIds = normalizedWords.map((w, idx) => ({
            ...w,
            uid: w.uid || `${w.MOTS}-${w.PHONEMES}-${w.SYNT}-${idx}`
        }));
        setQueue(wordsWithIds);
        setIsShuffled(false);
        setOriginalQueue(null);
    }, []);

    const togglePanelMode = useCallback((mode: PanelMode) => {
        // Smart tabs logic
        if (isPanelOpen && panelMode === mode) {
            // Clicking same mode → close panel
            setIsPanelOpen(false);
        } else {
            // Open panel and switch to requested mode
            setIsPanelOpen(true);
            setPanelMode(mode);
        }
    }, [isPanelOpen, panelMode]);

    const toggleShuffle = useCallback(() => {
        if (!isShuffled) {
            // ACTIVATE SHUFFLE
            const currentWord = queue[currentIndex];
            const toShuffle = [...queue];

            // Keep the last word (usually "Bravo !") if it's there
            const hasFin = toShuffle.length > 0 && toShuffle[toShuffle.length - 1].MOTS === 'Bravo !';
            const finWord = hasFin ? toShuffle.pop() : null;

            // Fisher-Yates
            for (let i = toShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
            }

            if (finWord) toShuffle.push(finWord);

            // Save original if not already saved
            if (!originalQueue) {
                setOriginalQueue(queue);
            }

            setQueue(toShuffle);
            setIsShuffled(true);

            // If session has started, maintain current character
            if (hasStarted && currentWord) {
                const newIdx = toShuffle.findIndex(w => w.uid === currentWord.uid);
                if (newIdx !== -1) setCurrentIndex(newIdx);
            } else {
                // If session hasn't started, reset to 0 to show the new first word
                setCurrentIndex(0);
            }
        } else {
            // DEACTIVATE SHUFFLE
            if (originalQueue) {
                const currentWord = queue[currentIndex];
                setQueue(originalQueue);
                setIsShuffled(false);

                // If session has started, maintain current character
                if (hasStarted && currentWord) {
                    const originalIdx = originalQueue.findIndex(w => w.uid === currentWord.uid);
                    if (originalIdx !== -1) setCurrentIndex(originalIdx);
                } else {
                    // If session hasn't started, reset to 0
                    setCurrentIndex(0);
                }
            }
        }
    }, [isShuffled, queue, currentIndex, originalQueue, hasStarted]);

    const setWordStatus = useCallback((uid: string, status: WordStatus) => {
        setWordStatuses(prev => {
            const newMap = new Map(prev);
            if (status === 'neutral') {
                newMap.delete(uid);
            } else {
                newMap.set(uid, status);
            }
            return newMap;
        });
    }, []);

    const cycleWordStatus = useCallback((uid: string) => {
        setWordStatuses(prev => {
            const newMap = new Map(prev);
            const currentStatus = newMap.get(uid) || 'neutral';

            // Cycle: neutral → validated → failed → neutral
            const nextStatus: WordStatus =
                currentStatus === 'neutral' ? 'validated' :
                    currentStatus === 'validated' ? 'failed' :
                        'neutral';

            if (nextStatus === 'neutral') {
                newMap.delete(uid);
            } else {
                newMap.set(uid, nextStatus);
            }

            return newMap;
        });
    }, []);

    const logResult = useCallback((wordId: string, status: 'success' | 'failed' | 'skipped') => {
        setSessionLog(prev => {
            const existingIndex = prev.findIndex(log => log.wordId === wordId);
            if (existingIndex > -1) {
                // Update existing
                const next = [...prev];
                next[existingIndex] = { ...next[existingIndex], status, timestamp: Date.now() };
                return next;
            }
            // Add new
            return [...prev, { wordId, status, timestamp: Date.now() }];
        });
    }, []);

    const nextWord = useCallback(() => {
        if (!hasStarted) {
            setHasStarted(true);
            setPhase('display');
        } else {
            // Guard: Stop if we are already at the last word (Bravo !)
            if (currentIndex >= queue.length - 1) return;

            if (phase === 'display') {
                // Check if NEXT word is Fin (Bravo !). If so, SKIP GAP.
                const isNextLast = currentIndex + 1 >= queue.length - 1;
                const isNextBravo = queue[currentIndex + 1]?.MOTS === "Bravo !";

                if (isNextLast || isNextBravo) {
                    setCurrentIndex(prev => prev + 1);
                    setPhase('display');
                } else {
                    setPhase('gap');
                }
            } else {
                setCurrentIndex(prev => prev + 1);
                setPhase('display');
            }
        }
    }, [queue, hasStarted, phase, currentIndex]);

    const prevWord = useCallback(() => {
        if (phase === 'gap') {
            setPhase('display');
        } else {
            if (currentIndex > 0) {
                // If we are on Bravo !, skip gap when going back
                const isCurrentBravo = queue[currentIndex]?.MOTS === "Bravo !";

                setCurrentIndex(currentIndex - 1);
                if (isCurrentBravo) {
                    setPhase('display');
                } else {
                    setPhase('gap');
                }
            } else {
                setPhase('display');
                setHasStarted(false);
                setIsPlaying(false);
            }
        }
    }, [phase, currentIndex, queue]);

    const resetSession = useCallback(() => {
        setSessionLog([]);
        setWordStatuses(new Map());
        setCurrentIndex(0);
        setIsPlaying(false);
        setPhase('display');
        setHasStarted(false);
        setIsShuffled(false);
        setOriginalQueue(null);
    }, []);

    const handleSetIsPlaying = useCallback((updater: boolean | ((prev: boolean) => boolean)) => {
        setIsPlaying(prev => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            if (nextValue) {
                setHasStarted(true);
            }
            return nextValue;
        });
    }, []);

    return (
        <PlayerContext.Provider value={{
            queue, currentIndex, isPlaying, phase, hasStarted, startTime, settings, sessionLog, isPanelOpen,
            panelMode, togglePanelMode,
            feedback, triggerFeedback, flashFeedback,
            wordStatuses, cycleWordStatus, setWordStatus,
            setQueue: handleSetQueue, setCurrentIndex, setIsPlaying: handleSetIsPlaying, setPhase, setHasStarted, updateSettings,
            setIsPanelOpen, logResult, nextWord, prevWord, resetSession,
            isShuffled, toggleShuffle
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
