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
import { LayoutGrid, List, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Top gradient orb */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-float-slow" />
                {/* Bottom gradient orb */}
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '-3s' }} />
                {/* Accent orb */}
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-5s' }} />
            </div>

            {/* Panneau de filtres */}
            <aside className="w-80 shrink-0 border-r border-border/30 overflow-hidden glass relative z-10">
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
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Toolbar */}
                <div className="shrink-0 px-6 py-5 border-b border-border/30 glass">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold gradient-text tracking-tight">
                                        Banque de Mots
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {words.length} résultat{words.length > 1 ? 's' : ''} sur {totalWords}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Toggle vue */}
                            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border/30">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : ''}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-primary/20 text-primary' : ''}`}
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
                                <SelectTrigger className="w-28 bg-muted/30 border-border/30">
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
                            <div className="p-4 rounded-full bg-muted/20 mb-4">
                                <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-lg font-medium">Aucun mot ne correspond à vos critères</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 stagger-fade-in">
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
                                    className="flex items-center gap-4 p-4 rounded-xl glass border border-border/30 hover:border-primary/30 cursor-pointer transition-all duration-300 hover-lift group"
                                    onClick={() => setSelectedWord(word)}
                                >
                                    <span className="font-bold text-lg min-w-32 group-hover:gradient-text transition-all">{word.ORTHO}</span>
                                    <span className="font-mono text-muted-foreground text-sm">/{word.PHON}/</span>
                                    <span className="text-sm text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">{word.SYNT}</span>
                                    <span className="text-sm text-muted-foreground">{word.NBSYLL} syll.</span>
                                    <span className="font-mono text-sm text-muted-foreground ml-auto bg-muted/30 px-2 py-0.5 rounded">{word.PSYLL}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="shrink-0 px-6 py-4 border-t border-border/30 glass">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-mono">
                                Page {currentPage} / {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="border-border/50 hover:border-primary/50 hover:bg-primary/10"
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
                                                className={`w-8 h-8 p-0 font-mono ${currentPage === pageNum ? 'bg-primary/20 text-primary border border-primary/30' : ''}`}
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
                                    className="border-border/50 hover:border-primary/50 hover:bg-primary/10"
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
