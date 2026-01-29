import { useState } from "react";
import { FilterPanel } from "./FilterPanel";
import { WordCard } from "./WordCard";
import { WordDetailModal } from "./WordDetailModal";
import { useWords } from "@/hooks/useWords";
import { Word } from "@/types/word";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export function WordExplorer() {
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

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Two-column layout */}
                <div className="flex gap-6">

                    {/* Sidebar - Filters */}
                    <aside className="w-64 shrink-0">
                        <div className="sticky top-6 bg-white rounded-xl border border-border overflow-hidden">
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

                    {/* Main - Results */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{words.length}</span> mot{words.length > 1 ? 's' : ''}
                            </p>

                            <div className="flex items-center gap-2">
                                {/* View toggle */}
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : 'bg-white hover:bg-muted/50'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-muted' : 'bg-white hover:bg-muted/50'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Items per page */}
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => {
                                        setItemsPerPage(parseInt(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-24 h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option.toString()}>
                                                {option}/page
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="min-h-[400px]">
                            {paginatedWords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/30 rounded-xl">
                                    <p className="text-sm">Aucun mot trouvé</p>
                                    <button
                                        onClick={() => {
                                            setCurrentPage(1);
                                            resetFilters();
                                        }}
                                        className="text-sm text-primary hover:underline mt-1"
                                    >
                                        Effacer les filtres
                                    </button>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 stagger-fade-in">
                                    {paginatedWords.map((word, index) => (
                                        <WordCard
                                            key={`${word.ORTHO}-${index}`}
                                            word={word}
                                            onClick={setSelectedWord}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1 stagger-fade-in">
                                    {paginatedWords.map((word, index) => (
                                        <div
                                            key={`${word.ORTHO}-${index}`}
                                            className="flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 cursor-pointer transition-colors"
                                            onClick={() => setSelectedWord(word)}
                                        >
                                            <span className="font-medium w-28">{word.ORTHO}</span>
                                            <span className="font-mono text-sm text-muted-foreground">/{word.PHON}/</span>
                                            <span className="pill text-xs py-0.5 px-2">{word.SYNT}</span>
                                            <span className="text-sm text-muted-foreground">{word.NBSYLL} syll</span>
                                            <span className="font-mono text-sm text-muted-foreground ml-auto">{word.PSYLL}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination - Simple style like the SaaS */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </button>

                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} sur {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal */}
            <WordDetailModal
                word={selectedWord}
                onClose={() => setSelectedWord(null)}
            />
        </div>
    );
}
