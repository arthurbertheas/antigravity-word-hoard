import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Word } from '@/types/word';

export type PlayerPhase = 'display' | 'gap';
export type FeedbackType = 'success' | 'error';

export interface PlayerSettings {
    speedMs: number;
    gapMs: number;
    fontSize: number;
    fontFamily: 'arial' | 'verdana' | 'mdi-ecole' | 'sans' | 'serif' | 'mono' | 'opendyslexic';
    highlightVowels: boolean;
    letterSpacing: number;
    showFocusPoint: boolean;
    enableSound: boolean;
}

export interface SessionLog {
    wordId: string;
    status: 'success' | 'failed' | 'skipped';
    timestamp: number;
}

interface PlayerContextType {
    queue: Word[];
    currentIndex: number;
    isPlaying: boolean;
    phase: PlayerPhase;
    hasStarted: boolean;
    settings: PlayerSettings;
    sessionLog: SessionLog[];
    setQueue: (words: Word[]) => void;
    setCurrentIndex: (index: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setPhase: (phase: PlayerPhase) => void;
    updateSettings: (settings: Partial<PlayerSettings>) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    feedback: FeedbackType | null;
    triggerFeedback: (type: FeedbackType) => void;
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
    const [feedback, setFeedback] = useState<FeedbackType | null>(null);
    const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);

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

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<PlayerSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const triggerFeedback = useCallback((type: FeedbackType) => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 200);
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

    const handleSetIsPlaying = useCallback((playing: boolean) => {
        setIsPlaying(playing);
        if (playing) {
            setHasStarted(true);
        }
    }, []);

    return (
        <PlayerContext.Provider value={{
            queue, currentIndex, isPlaying, phase, hasStarted, settings, sessionLog, isPanelOpen,
            feedback, triggerFeedback,
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
