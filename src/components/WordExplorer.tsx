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
import { LayoutGrid, List, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useIframeResize } from "@/hooks/useIframeResize";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];



import { WordBank } from "./WordBank";
import { SelectionTray } from "./SelectionTray";

export function WordExplorer() {
    return (
        <SelectionProvider>
            <WordExplorerContent />
        </SelectionProvider>
    );
}

function WordExplorerContent() {
    const { words, totalWords, filters, updateFilter, resetFilters, toggleArrayFilter, stats } = useWords();
    const { selectedWords } = useSelection();
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);

    // Zen Mode Toggle Logic
    const toggleZenMode = () => {
        const newState = !isZenMode;
        setIsZenMode(newState);
        window.parent.postMessage({
            type: 'toggle_zen_mode',
            isZenMode: newState
        }, '*');
    };

    // V9/10: Adaptive Resize Logic
    useIframeResize(isFocusModeOpen);

    // Reset page when filters change
    const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
        updateFilter(key, value);
    };

    // Listener for Webflow "Launch Diaporama" command
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'launch_diaporama') {
                if (selectedWords.length > 0) {
                    setIsFocusModeOpen(true);
                } else {
                    alert("Veuillez d'abord sélectionner des mots.");
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [selectedWords]);

    // Send Focus Mode state to parent for fullscreen promotion
    useEffect(() => {
        window.parent.postMessage({
            type: 'focus_mode_change',
            isOpen: isFocusModeOpen
        }, '*');
    }, [isFocusModeOpen]);

    return (
        <div className="flex bg-white h-full w-full overflow-hidden">
            {/* Zone A: Sidebar - Filters (Sandwich-ready container) */}
            <aside className="w-72 shrink-0 border-r border-border bg-card/5 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 pb-20">
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
                </div>
            </aside>

            {/* Zone B: Results - Source (Sandwich) */}
            <main className="flex-1 min-w-0 bg-white h-full border-r border-border overflow-hidden relative">
                {/* Zen Mode Toggle Button */}
                <div className="absolute top-4 right-6 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleZenMode}
                        className="bg-white/80 backdrop-blur-md hover:bg-primary/10 hover:text-primary shadow-sm border border-border/50 rounded-full w-8 h-8"
                        title={isZenMode ? "Réduire" : "Plein écran"}
                    >
                        {isZenMode ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                <WordBank words={words} />
            </main>

            {/* Zone C: My List - Destination (Sandwich) */}
            <SelectionTray />

            {/* Focus Frame Overlay (Slideshow) */}
            <FocusFrame
                words={selectedWords}
                isOpen={isFocusModeOpen}
                onClose={() => setIsFocusModeOpen(false)}
            />
        </div>
    );
}
