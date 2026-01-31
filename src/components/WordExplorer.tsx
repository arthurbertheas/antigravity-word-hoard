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

    return (
        <div className="flex bg-white h-full w-full overflow-hidden">
            {/* Zone A: Sidebar - Filters (Scrollable) */}
            <aside className="w-72 shrink-0 border-r border-border bg-card/5 overflow-y-auto h-full">
                <div className="p-4 pb-20">
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

            {/* Zone B: Results - Source (Scrollable) */}
            <main className="flex-1 min-w-0 bg-white overflow-y-auto h-full border-r border-border">
                <WordBank words={words} />
            </main>

            {/* Zone C: My List - Destination (Scrollable) */}
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
