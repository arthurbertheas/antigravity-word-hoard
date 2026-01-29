import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Word } from '@/types/word';

interface SelectionContextType {
    selectedWords: Word[];
    toggleSelection: (word: Word) => void;
    clearSelection: () => void;
    isSelected: (word: Word) => boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selectedWords, setSelectedWords] = useState<Word[]>([]);

    const toggleSelection = (word: Word) => {
        setSelectedWords(prev => {
            const exists = prev.some(w => w.ORTHO === word.ORTHO); // Assuming ORTHO is unique enough for now, or use ID if available
            if (exists) {
                return prev.filter(w => w.ORTHO !== word.ORTHO);
            } else {
                return [...prev, word];
            }
        });
    };

    const clearSelection = () => {
        setSelectedWords([]);
    };

    const isSelected = (word: Word) => {
        return selectedWords.some(w => w.ORTHO === word.ORTHO);
    };

    return (
        <SelectionContext.Provider value={{ selectedWords, toggleSelection, clearSelection, isSelected }}>
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
