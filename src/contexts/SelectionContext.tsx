import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Word, WordFilters } from '@/types/word';
import { normalizeWord, normalizeWords } from '@/utils/word-normalization';
import { selectRandomWords } from '@/utils/random-selection';

interface SelectionContextType {
    selectedWords: Word[];
    toggleSelection: (word: Word) => void;
    addItem: (word: Word) => void;
    addItems: (words: Word[]) => void;
    removeItem: (wordId: string) => void;
    removeItems: (words: Word[]) => void;
    clearSelection: () => void;
    setSelection: (words: Word[]) => void;
    isSelected: (word: Word) => boolean;
    isFocusModeOpen: boolean;
    setIsFocusModeOpen: (open: boolean) => void;
    randomSelectedCount: number;
    randomFiltersSnapshot: string | null;
    selectRandom: (count: number, words: Word[], filters: WordFilters) => void;
    deselectRandom: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

// Helper to generate a unique ID for a word
export function getWordId(word: Word): string {
    return `${word.MOTS}_${word.SYNT}_${word.PHONEMES}_${word.NBSYLL}`;
}

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selectedWords, setSelectedWords] = useState<Word[]>(() => {
        try {
            const saved = localStorage.getItem('wordHoard_selectedWords');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [randomSelectedCount, setRandomSelectedCount] = useState(0);
    const [randomFiltersSnapshot, setRandomFiltersSnapshot] = useState<string | null>(null);

    const selectRandom = useCallback((count: number, words: Word[], filters: WordFilters) => {
        const selected = selectRandomWords(count, words, filters);
        setSelection(selected);
        setRandomSelectedCount(count);
        setRandomFiltersSnapshot(JSON.stringify(filters));
    }, []);

    const deselectRandom = useCallback(() => {
        clearSelection();
        setRandomSelectedCount(0);
        setRandomFiltersSnapshot(null);
    }, []);

    const addItem = useCallback((word: Word) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const normalized = normalizeWord(word);
        const targetId = getWordId(normalized);
        setSelectedWords(prev => {
            const exists = prev.some(w => getWordId(w) === targetId);
            if (exists) return prev;
            return [...prev, normalized];
        });
    }, []);

    const addItems = useCallback((words: Word[]) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const normalizedWords = normalizeWords(words);
        setSelectedWords(prev => {
            const newWords = normalizedWords.filter(word => {
                const targetId = getWordId(word);
                return !prev.some(w => getWordId(w) === targetId);
            });
            return [...prev, ...newWords];
        });
    }, []);

    const removeItem = useCallback((wordId: string) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        setSelectedWords(prev => prev.filter(w => getWordId(w) !== wordId));
    }, []);

    const removeItems = useCallback((words: Word[]) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const idsToRemove = new Set(words.map(w => getWordId(w)));
        setSelectedWords(prev => prev.filter(w => !idsToRemove.has(getWordId(w))));
    }, []);

    const toggleSelection = useCallback((word: Word) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const targetId = getWordId(word);
        setSelectedWords(prev => {
            const exists = prev.some(w => getWordId(w) === targetId);
            if (exists) {
                return prev.filter(w => getWordId(w) !== targetId);
            } else {
                return [...prev, word];
            }
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedWords([]);
        setRandomSelectedCount(0);
    }, []);

    const setSelection = useCallback((words: Word[]) => {
        setSelectedWords(normalizeWords(words));
    }, []);

    const isSelected = useCallback((word: Word) => {
        const targetId = getWordId(word);
        return selectedWords.some(w => getWordId(w) === targetId);
    }, [selectedWords]);

    // Persist selectedWords to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('wordHoard_selectedWords', JSON.stringify(selectedWords));
        } catch { /* quota exceeded — ignore */ }
    }, [selectedWords]);

    // Webflow Bridge: Sync state with parent (send updates)
    useEffect(() => {
        window.parent.postMessage({
            type: 'selection_update',
            count: selectedWords.length,
            selectedIds: selectedWords.map(w => w.MOTS)
        }, '*');
    }, [selectedWords]);

    // Webflow Bridge: Listen for commands from parent
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;

            if (event.data.type === 'clear_selection_command') {
                clearSelection();
            }
            if (event.data.type === 'export_selection_command') {
                // Trigger export logic (simple alert for now as per current feature set)
                alert(`Export de ${selectedWords.length} mots (commande reçue de Webflow)`);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [selectedWords, clearSelection]);

    return (
        <SelectionContext.Provider value={{
            selectedWords,
            toggleSelection,
            addItem,
            addItems,
            removeItem,
            removeItems,
            clearSelection,
            setSelection,
            isSelected,
            isFocusModeOpen,
            setIsFocusModeOpen,
            randomSelectedCount,
            randomFiltersSnapshot,
            selectRandom,
            deselectRandom
        }}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    const context = useContext(SelectionContext);
    if (!context) {
        throw new Error('useSelection must be used within a SelectionProvider');
    }
    return context;
}
