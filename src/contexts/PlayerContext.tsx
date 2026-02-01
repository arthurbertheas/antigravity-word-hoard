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
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState<PlayerPhase>('gap');
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);
    const [settings, setSettings] = useState<PlayerSettings>(() => {
        const saved = localStorage.getItem('tachistoscope-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: if fontSize is in the old pixel range (> 50), reset to default vmin level
            if (parsed.fontSize > 50) {
                return { ...parsed, fontSize: DEFAULT_SETTINGS.fontSize };
            }
            return parsed;
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
        setCurrentIndex(prev => (prev < queue.length - 1 ? prev + 1 : prev));
        setPhase('gap');
        setHasStarted(true);
    }, [queue.length]);

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
                setPhase('gap'); // Reset phase to default
                setHasStarted(false);
                setIsPlaying(false);
            }
        }
    }, [phase, currentIndex]);

    const resetSession = useCallback(() => {
        setSessionLog([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setPhase('gap');
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
