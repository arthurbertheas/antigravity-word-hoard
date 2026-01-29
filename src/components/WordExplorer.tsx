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

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

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
        <div className="h-screen flex overflow-hidden bg-background">
            {/* Panneau de filtres */}
            <aside className="w-80 shrink-0 border-r border-border/50 overflow-hidden">
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
            </aside>

            {/* Zone principale */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="shrink-0 px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold gradient-text">
                                Banque de Mots
                            </h1>
                            <span className="text-muted-foreground">
                                {words.length} résultat{words.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Toggle vue */}
                            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="h-8 w-8 p-0"
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
                                <SelectTrigger className="w-24">
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
                </div>

                {/* Grille/Liste de mots */}
                <div className="flex-1 overflow-auto p-6">
                    {paginatedWords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p className="text-lg">Aucun mot ne correspond à vos critères</p>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setCurrentPage(1);
                                    resetFilters();
                                }}
                                className="mt-2"
                            >
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {paginatedWords.map((word, index) => (
                                <WordCard
                                    key={`${word.ORTHO}-${index}`}
                                    word={word}
                                    onClick={setSelectedWord}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {paginatedWords.map((word, index) => (
                                <div
                                    key={`${word.ORTHO}-${index}`}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-card/50 hover:bg-card/80 cursor-pointer transition-colors"
                                    onClick={() => setSelectedWord(word)}
                                >
                                    <span className="font-bold text-lg min-w-32">{word.ORTHO}</span>
                                    <span className="font-mono text-muted-foreground">/{word.PHON}/</span>
                                    <span className="text-sm text-muted-foreground">{word.SYNT}</span>
                                    <span className="text-sm text-muted-foreground">{word.NBSYLL} syll.</span>
                                    <span className="text-sm text-muted-foreground ml-auto">{word.PSYLL}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                                                variant={currentPage === pageNum ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
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
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal détail */}
            <WordDetailModal
                word={selectedWord}
                onClose={() => setSelectedWord(null)}
            />
        </div>
    );
}
