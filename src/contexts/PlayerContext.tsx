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

    const nextWord = useCallback(() => {
        setCurrentIndex(prev => (prev < queue.length - 1 ? prev + 1 : prev));
        setPhase('gap');
    }, [queue.length]);

    const prevWord = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
        setPhase('gap');
    }, []);

    const resetSession = useCallback(() => {
        setSessionLog([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setPhase('gap');
    }, []);

    return (
        <PlayerContext.Provider value={{
            queue, currentIndex, isPlaying, phase, settings, sessionLog,
            setQueue, setCurrentIndex, setIsPlaying, setPhase, updateSettings,
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
