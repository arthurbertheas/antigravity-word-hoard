import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Word } from '@/types/word';

export type PlayerPhase = 'display' | 'gap';

export interface PlayerSettings {
    speedMs: number;
    gapMs: number;
    fontSize: number;
    fontFamily: 'arial' | 'verdana' | 'mdi-ecole' | 'sans' | 'serif' | 'mono' | 'opendyslexic';
    highlightVowels: boolean;
    letterSpacing: number;
    showFocusPoint: boolean;
    version: number;
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
    logResult: (wordId: string, status: 'success' | 'failed' | 'skipped') => void;
    nextWord: () => void;
    prevWord: () => void;
    resetSession: () => void;
}

const DEFAULT_SETTINGS: PlayerSettings = {
    speedMs: 1000,
    gapMs: 500,
    fontSize: 15,
    fontFamily: 'arial',
    highlightVowels: false,
    letterSpacing: 0,
    showFocusPoint: true,
    version: 1,
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState<PlayerPhase>('display'); // Default to display to ensure first word shows
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
    const [settings, setSettings] = useState<PlayerSettings>(() => {
        const saved = localStorage.getItem('tachistoscope-settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const merged = { ...DEFAULT_SETTINGS, ...parsed };

                // Migration Strategy: 
                // If the user has an old config (no version or version < 1), 
                // we force showFocusPoint to true to ensure they see the new feature.
                if (!merged.version || merged.version < 1) {
                    merged.showFocusPoint = true;
                    merged.version = 1;
                }

                return merged;
            } catch (e) {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('tachistoscope-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<PlayerSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const logResult = useCallback((wordId: string, status: 'success' | 'failed' | 'skipped') => {
        setSessionLog(prev => [
            ...prev,
            { wordId, status, timestamp: Date.now() }
        ]);
    }, []);

    // Start next next word (also used for skip)
    const nextWord = useCallback(() => {
        if (!hasStarted) {
            setHasStarted(true);
            setPhase('display');
            // Do NOT increment index, just "Start" on current (0)
        } else {
            // Granular navigation:
            // Display -> Gap
            // Gap -> Next Word Display
            if (phase === 'display') {
                setPhase('gap');
            } else {
                setCurrentIndex(prev => (prev < queue.length - 1 ? prev + 1 : prev));
                setPhase('display');
            }
        }
    }, [queue.length, hasStarted, phase]);

    // Go to previous step (Gap -> Display -> Prev Gap)
    const prevWord = useCallback(() => {
        // We need to access current phase and index. 
        // Since we are inside a provider, we can rely on state values if we didn't use functional updates, 
        // but here we might have stale closures if we don't allow dependencies.
        // Actually, `phase` and `currentIndex` are state variables in this scope.
        // We need to add them to dependencies.

        if (phase === 'gap') {
            // If in Gap, go to Display of SAME word
            setPhase('display');
        } else {
            // If function is 'display'
            if (currentIndex > 0) {
                // Go to Gap of PREVIOUS word
                setCurrentIndex(currentIndex - 1);
                setPhase('gap');
            } else {
                // Return to Ready Loop (Index 0)
                setPhase('display'); // Reset to display (Ready screen handles visibility)
                setHasStarted(false);
                setIsPlaying(false);
            }
        }
    }, [phase, currentIndex]);

    const resetSession = useCallback(() => {
        setSessionLog([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setPhase('display'); // Reset to display
        setHasStarted(false);
    }, []);

    // Wrapper for setIsPlaying to trigger start
    const handleSetIsPlaying = useCallback((playing: boolean) => {
        setIsPlaying(playing);
        if (playing) {
            setHasStarted(true);
        }
    }, []);

    return (
        <PlayerContext.Provider value={{
            queue, currentIndex, isPlaying, phase, hasStarted, settings, sessionLog,
            setQueue, setCurrentIndex, setIsPlaying: handleSetIsPlaying, setPhase, updateSettings,
            logResult, nextWord, prevWord, resetSession
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
