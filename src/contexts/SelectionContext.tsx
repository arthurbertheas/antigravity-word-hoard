import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

    // Webflow Bridge: Sync state with parent (send updates)
    useEffect(() => {
        window.parent.postMessage({
            type: 'selection_update',
            count: selectedWords.length,
            selectedIds: selectedWords.map(w => w.ORTHO)
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
