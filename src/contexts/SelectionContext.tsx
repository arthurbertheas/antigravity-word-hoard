import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Word } from '@/types/word';
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
    selectRandom: (count: number, words: Word[], filters: any) => void;
    deselectRandom: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

// Helper to generate a unique ID for a word
export function getWordId(word: Word): string {
    return `${word.MOTS}_${word.SYNT}_${word.PHONEMES}_${word.NBSYLL}`;
}

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selectedWords, setSelectedWords] = useState<Word[]>([]);
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [randomSelectedCount, setRandomSelectedCount] = useState(0);

    const selectRandom = (count: number, words: Word[], filters: any) => {
        const selected = selectRandomWords(count, words, filters);
        setSelection(selected);
        setRandomSelectedCount(count);
    };

    const deselectRandom = () => {
        clearSelection();
        setRandomSelectedCount(0);
    };

    const addItem = (word: Word) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const normalized = normalizeWord(word);
        const targetId = getWordId(normalized);
        setSelectedWords(prev => {
            const exists = prev.some(w => getWordId(w) === targetId);
            if (exists) return prev;
            return [...prev, normalized];
        });
    };

    const addItems = (words: Word[]) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const normalizedWords = normalizeWords(words);
        setSelectedWords(prev => {
            const newWords = normalizedWords.filter(word => {
                const targetId = getWordId(word);
                return !prev.some(w => getWordId(w) === targetId);
            });
            return [...prev, ...newWords];
        });
    };

    const removeItem = (wordId: string) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        setSelectedWords(prev => prev.filter(w => getWordId(w) !== wordId));
    };

    const removeItems = (words: Word[]) => {
        setRandomSelectedCount(0); // Reset random state on manual change
        const idsToRemove = new Set(words.map(w => getWordId(w)));
        setSelectedWords(prev => prev.filter(w => !idsToRemove.has(getWordId(w))));
    };

    const toggleSelection = (word: Word) => {
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
    };

    const clearSelection = () => {
        setSelectedWords([]);
        setRandomSelectedCount(0);
    };

    const setSelection = (words: Word[]) => {
        setSelectedWords(normalizeWords(words));
        // Note: selectRandom uses setSelection, so we don't reset count here
        // selectRandom will set the count itself after calling this.
        // Wait, selectRandom calls selectRandomWords -> returns array.
        // selectRandom calls setSelection(selected).
        // If setSelection resets count, it breaks selectRandom?
        // Yes.
        // So setSelection should NOT reset count?
        // But if I call setSelection manually elsewhere?
        // I should probably move setRandomSelectedCount(count) inside selectRandom AFTER setSelection.
        // And setSelection should probably reset it?
        // Or I assume setSelection is a low-level setter.
        // Let's keep setSelection "pure" and handle reset in high-level methods.
        // But manual selection methods (addItem, etc) DO reset it.
    };

    const isSelected = (word: Word) => {
        const targetId = getWordId(word);
        return selectedWords.some(w => getWordId(w) === targetId);
    };

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
    }, [selectedWords]);

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
