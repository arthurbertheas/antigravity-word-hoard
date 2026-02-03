import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Word } from '@/types/word';

export type PlayerPhase = 'display' | 'gap';
export type FeedbackType = 'positive' | 'negative';

export interface PlayerSettings {
    speedMs: number;
    gapMs: number;
    fontSize: number;
    fontFamily: 'arial' | 'verdana' | 'mdi-ecole' | 'sans' | 'serif' | 'mono' | 'opendyslexic';
    highlightVowels: boolean;
    highlightSilent: boolean;
    letterSpacing: number;
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
    updateSettings: (settings: Partial<PlayerSettings>) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    panelMode: PanelMode;
    togglePanelMode: (mode: PanelMode) => void;
    feedback: FeedbackType | null;
    triggerFeedback: (type: FeedbackType) => void;
    flashFeedback: (type: 'positive' | 'negative') => void;
    setWordStatus: (index: number, status: WordStatus) => void;
    wordStatuses: Map<number, WordStatus>;
    cycleWordStatus: (index: number) => void;
    logResult: (wordId: string, status: 'success' | 'failed' | 'skipped') => void;
    nextWord: () => void;
    prevWord: () => void;
    resetSession: () => void;
}

const STORAGE_KEY = 'tachistoscope-settings';

const DEFAULT_SETTINGS: PlayerSettings = {
    speedMs: 1000,
    gapMs: 500,
    fontSize: 15,
    fontFamily: 'arial',
    highlightVowels: false,
    highlightSilent: false,
    letterSpacing: 0,
    showFocusPoint: true,
    enableSound: false,
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
    const [wordStatuses, setWordStatuses] = useState<Map<number, WordStatus>>(new Map());

    // Simple & Clean initialization
    const [settings, setSettings] = useState<PlayerSettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            // Merge defaults (for focus point) with saved choices
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    });

    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

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

    const setWordStatus = useCallback((index: number, status: WordStatus) => {
        setWordStatuses(prev => {
            const newMap = new Map(prev);
            if (status === 'neutral') {
                newMap.delete(index);
            } else {
                newMap.set(index, status);
            }
            return newMap;
        });
    }, []);

    const cycleWordStatus = useCallback((index: number) => {
        setWordStatuses(prev => {
            const newMap = new Map(prev);
            const currentStatus = newMap.get(index) || 'neutral';

            // Cycle: neutral → validated → failed → neutral
            const nextStatus: WordStatus =
                currentStatus === 'neutral' ? 'validated' :
                    currentStatus === 'validated' ? 'failed' :
                        'neutral';

            if (nextStatus === 'neutral') {
                newMap.delete(index);
            } else {
                newMap.set(index, nextStatus);
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
            if (phase === 'display') {
                setPhase('gap');
            } else {
                setCurrentIndex(prev => (prev < queue.length - 1 ? prev + 1 : prev));
                setPhase('display');
            }
        }
    }, [queue.length, hasStarted, phase]);

    const prevWord = useCallback(() => {
        if (phase === 'gap') {
            setPhase('display');
        } else {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setPhase('gap');
            } else {
                setPhase('display');
                setHasStarted(false);
                setIsPlaying(false);
            }
        }
    }, [phase, currentIndex]);

    const resetSession = useCallback(() => {
        setSessionLog([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setPhase('display');
        setHasStarted(false);
    }, []);

    const handleSetIsPlaying = useCallback((updater: boolean | ((prev: boolean) => boolean)) => {
        setSettings(prevSettings => {
            // This is just a dummy use to avoid lint error if needed, but wait
            return prevSettings;
        });

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
            setQueue, setCurrentIndex, setIsPlaying: handleSetIsPlaying, setPhase, updateSettings,
            setIsPanelOpen, logResult, nextWord, prevWord, resetSession
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
