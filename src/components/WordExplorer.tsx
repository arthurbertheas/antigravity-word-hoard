import { useState, useEffect, useRef } from "react";
import { FilterPanel } from "./FilterPanel";
import { WordCard } from "./WordCard";
import { WordDetailView } from "./WordDetailView";
import { SelectionBar } from "./SelectionBar";
import { FocusFrame } from "./FocusFrame";
import { useWords } from "@/hooks/useWords";
import { useSelection } from "@/contexts/SelectionContext";
import { Word } from "@/types/word";
import { Button } from "@/components/ui/button";
import { SelectionProvider } from "@/contexts/SelectionContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useIframeResize } from "@/hooks/useIframeResize";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];



import { WordBank } from "./WordBank";
import { SelectionTray } from "./SelectionTray";
import { Tachistoscope } from "./tachistoscope/Tachistoscope";
import { ActiveFiltersBar } from "./ActiveFiltersBar";
import { ResultsHeader } from "./ResultsHeader";
import { SavedListsProvider } from "@/contexts/SavedListsContext";

export function WordExplorer() {
    return (
        <SelectionProvider>
            <SavedListsProvider>
                <WordExplorerContent />
            </SavedListsProvider>
        </SelectionProvider>
    );
}

function WordExplorerContent() {
    const { words, totalWords, filters, updateFilter, resetFilters, toggleArrayFilter, stats } = useWords();
    const { selectedWords, isFocusModeOpen, setIsFocusModeOpen, addItems, removeItems, randomSelectedCount, selectRandom, deselectRandom, clearSelection } = useSelection();

    // V9/10: Adaptive Resize Logic
    useIframeResize(isFocusModeOpen);

    // Reset selection when filters change (Ticket: Reset Selection on Filter Change)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // Always clear selection on filter change (no condition check to avoid stale closure)
        clearSelection();
    }, [filters, clearSelection]);

    // Reset page when filters change
    const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
        console.log("Filter change:", key, value);
        updateFilter(key, value);
    };

    // Listener for Webflow "Launch Diaporama" command
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'launch_diaporama') {
                console.log("Diaporama launch command received from postMessage");
                if (selectedWords.length > 0) {
                    setIsFocusModeOpen(true);
                } else {
                    alert("Veuillez d'abord sélectionner des mots.");
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [selectedWords, setIsFocusModeOpen]);

    // Send Focus Mode state to parent for fullscreen promotion
    useEffect(() => {
        console.log("Focus Mode Change:", isFocusModeOpen);
        window.parent.postMessage({
            type: 'focus_mode_change',
            isOpen: isFocusModeOpen
        }, '*');
    }, [isFocusModeOpen]);

    return (
        <div className="flex bg-white h-full w-full overflow-hidden">
            {/* Zone A: Sidebar - Filters */}
            <FilterPanel
                filters={filters}
                updateFilter={handleFilterChange}
                toggleArrayFilter={(key, value) => {
                    toggleArrayFilter(key, value);
                }}
                resetFilters={() => {
                    resetFilters();
                }}
                stats={stats}
                resultCount={words.length}
                totalCount={totalWords}
            />

            {/* Zone B: Results - Source (Sandwich) */}
            <main className="flex-1 min-w-0 bg-white h-full overflow-hidden flex flex-col">
                {/* Results Header */}
                <ResultsHeader
                    words={words}
                    filters={filters}
                    isAllSelected={words.length > 0 && words.every(word =>
                        selectedWords.some(sw => sw.MOTS === word.MOTS)
                    )}
                    randomSelectedCount={randomSelectedCount}
                    onToggleSelectAll={() => {
                        const isAllSelected = words.length > 0 && words.every(word =>
                            selectedWords.some(sw => sw.MOTS === word.MOTS)
                        );
                        if (isAllSelected) {
                            removeItems(words);
                        } else {
                            addItems(words);
                        }
                    }}
                    onRandomSelect={(count) => selectRandom(count, words, filters)}
                    onRandomDeselect={deselectRandom}
                />

                {/* Active Filters Bar */}
                <ActiveFiltersBar
                    filters={filters}
                    onRemoveFilter={(filterType, value) => {
                        if (filterType === 'minLetters' && value === 'reset') {
                            updateFilter('minLetters', 1);
                            updateFilter('maxLetters', 20);
                            return;
                        }

                        if (filterType === 'minSyllables' && value === 'reset') {
                            updateFilter('minSyllables', 1);
                            updateFilter('maxSyllables', 5);
                            return;
                        }

                        if (filterType === 'hasImage' && value === 'reset') {
                            updateFilter('hasImage', null);
                            return;
                        }

                        // Remove specific filter from array
                        const currentFilters = filters[filterType];
                        if (Array.isArray(currentFilters)) {
                            if (filterType === 'search' || filterType === 'graphemes' || filterType === 'phonemes') {
                                // For these types, value is the ID. We filter by id.
                                const newFilters = (currentFilters as any[]).filter(v => (v.id || v) !== value);
                                updateFilter(filterType, newFilters as any);
                            } else {
                                const newFilters = (currentFilters as any[]).filter(v => v !== value);
                                updateFilter(filterType, newFilters as any);
                            }
                        }
                    }}
                    onClearAll={() => {
                        resetFilters();
                    }}
                />

                {/* Word Bank */}
                <div className="flex-1 overflow-hidden">
                    <WordBank words={words} />
                </div>
            </main>

            {/* Zone C: My List - Destination (Sandwich) */}
            <SelectionTray />

            {/* Tachistoscope Overlay (Immersive Reader) */}
            <Tachistoscope
                words={selectedWords}
                isOpen={isFocusModeOpen}
                onClose={() => setIsFocusModeOpen(false)}
            />
        </div>
    );
}
