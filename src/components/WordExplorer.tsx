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

export function WordExplorer() {
    return (
        <SelectionProvider>
            <WordExplorerContent />
        </SelectionProvider>
    );
}

function WordExplorerContent() {
    const { words, totalWords, filters, updateFilter, resetFilters, toggleArrayFilter, stats } = useWords();
    const { selectedWords, isFocusModeOpen, setIsFocusModeOpen, addItems, removeItems } = useSelection();

    // V9/10: Adaptive Resize Logic
    useIframeResize(isFocusModeOpen);

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
                    isAllSelected={words.length > 0 && words.every(word =>
                        selectedWords.some(sw => sw.ORTHO === word.ORTHO)
                    )}
                    onToggleSelectAll={() => {
                        const isAllSelected = words.length > 0 && words.every(word =>
                            selectedWords.some(sw => sw.ORTHO === word.ORTHO)
                        );
                        if (isAllSelected) {
                            removeItems(words);
                        } else {
                            addItems(words);
                        }
                    }}
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

                        // Remove specific filter from array
                        const currentFilters = filters[filterType];
                        if (Array.isArray(currentFilters)) {
                            const newFilters = (currentFilters as any[]).filter(v => v !== value);
                            updateFilter(filterType, newFilters as any);
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
