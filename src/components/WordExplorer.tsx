import { useState, useEffect, useRef } from "react";
import { FilterPanel } from "./FilterPanel";
import { WordCard } from "./WordCard";
import { WordDetailView } from "./WordDetailView";
import { SelectionBar } from "./SelectionBar";
import { useWords } from "@/hooks/useWords";
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

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

import { useIframeResize } from "@/hooks/useIframeResize";

export function WordExplorer() {
    return (
        <SelectionProvider>
            <WordExplorerContent />
        </SelectionProvider>
    );
}

function WordExplorerContent() {
    useIframeResize();
    const { words, totalWords, filters, updateFilter, resetFilters, toggleArrayFilter, stats } = useWords();
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(24);

    // Pagination
    const totalPages = Math.ceil(words.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedWords = words.slice(startIndex, endIndex);



    // Reset page when filters change
    const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
        setCurrentPage(1);
        updateFilter(key, value);
    };

    const topRef = useRef<HTMLDivElement>(null);
    const isPaginationTrigger = useRef(false);

    // Scroll to top ONLY on specific interactions (Pagination)
    useEffect(() => {
        if (isPaginationTrigger.current) {
            // Send message to parent (Webflow) to scroll to the custom anchor
            window.parent.postMessage({ type: 'scroll_to_offset' }, '*');

            // Fallback: simple scroll to top within iframe
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset trigger
            isPaginationTrigger.current = false;
        }
    }, [currentPage]);

    return (
        <div ref={topRef} className="bg-white min-h-0">
            {/* Main application container - designed to embed in Webflow */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Two-column layout like the SaaS */}
                <div className="flex gap-8">

                    {/* Left sidebar - Filters */}
                    <aside className="w-72 shrink-0">
                        <div className="sticky top-6 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <FilterPanel
                                filters={filters}
                                updateFilter={handleFilterChange}
                                toggleArrayFilter={(key, value) => {
                                    setCurrentPage(1);
                                    toggleArrayFilter(key, value);
                                }}
                                resetFilters={() => {
                                    setCurrentPage(1);
                                    resetFilters();
                                }}
                                stats={stats}
                                resultCount={words.length}
                                totalCount={totalWords}
                            />
                        </div>
                    </aside>

                    {/* Right side - Results or Detail */}
                    <main className="flex-1 min-w-0">
                        {selectedWord ? (
                            <WordDetailView
                                word={selectedWord}
                                onBack={() => setSelectedWord(null)}
                            />
                        ) : (
                            <>
                                {/* Toolbar */}
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-muted-foreground">
                                        <span className="font-semibold text-foreground">{words.length}</span> résultat{words.length > 1 ? 's' : ''}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        {/* Toggle vue */}
                                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                            <Button
                                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('grid')}
                                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                                className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                            >
                                                <List className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Items per page */}
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onValueChange={(value) => {
                                                setItemsPerPage(parseInt(value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-28 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                                    <SelectItem key={option} value={option.toString()}>
                                                        {option} / page
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Grille/Liste de mots */}
                                <div className="min-h-[400px]">
                                    {paginatedWords.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-card rounded-2xl border border-border">
                                            <p className="text-lg font-medium">Aucun mot ne correspond</p>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setCurrentPage(1);
                                                    resetFilters();
                                                }}
                                                className="mt-2 text-primary"
                                            >
                                                Réinitialiser les filtres
                                            </Button>
                                        </div>
                                    ) : viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-fade-in">
                                            {paginatedWords.map((word, index) => (
                                                <WordCard
                                                    key={`${word.ORTHO}-${index}`}
                                                    word={word}
                                                    onClick={setSelectedWord}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 stagger-fade-in">
                                            {paginatedWords.map((word, index) => (
                                                <div
                                                    key={`${word.ORTHO}-${index}`}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 cursor-pointer transition-all hover-lift group"
                                                    onClick={() => setSelectedWord(word)}
                                                >
                                                    <span className="font-bold text-lg min-w-28 group-hover:text-primary transition-colors">{word.ORTHO}</span>
                                                    <span className="font-mono text-muted-foreground text-sm">/{word.PHON}/</span>
                                                    <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">{word.SYNT}</span>
                                                    <span className="text-sm text-muted-foreground">{word.NBSYLL} syll.</span>
                                                    <span className="font-mono text-sm text-muted-foreground ml-auto">{word.PSYLL}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Page {currentPage} sur {totalPages}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    isPaginationTrigger.current = true;
                                                    setCurrentPage((p) => Math.max(1, p - 1));
                                                }}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Précédent
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum: number;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? 'default' : 'ghost'}
                                                            size="sm"
                                                            onClick={() => {
                                                                isPaginationTrigger.current = true;
                                                                setCurrentPage(pageNum);
                                                            }}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    isPaginationTrigger.current = true;
                                                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                                                }}
                                                disabled={currentPage === totalPages}
                                            >
                                                Suivant
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            <SelectionBar />
        </div>
    );
}
