import { Card, CardContent } from "@/components/ui/card";
import { Word } from "@/types/word";
import { useSelection } from "@/contexts/SelectionContext";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    // Remplacer les tirets ou points par des points médians
    const formattedSyllables = word.PSYLL.replace(/[-.]/g, ' · ');

    // Selection logic
    const { isSelected, toggleSelection } = useSelection();
    const selected = isSelected(word);

    const handleSelection = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger the card click (detail view)
        toggleSelection(word);
    };

    return (
        <Card
            className={cn(
                "group cursor-pointer relative bg-white/50 border-transparent transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1",
                selected
                    ? "border-primary ring-1 ring-primary bg-primary/5 shadow-sm"
                    : "hover:border-black/5 hover:bg-white"
            )}
            onClick={() => onClick?.(word)}
        >
            <div className="absolute top-2 left-2 z-10 transition-opacity duration-200">
                {/* Selection Circle - Visible on hover or if selected */}
                <button
                    onClick={handleSelection}
                    className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border",
                        selected
                            ? "bg-primary border-primary text-white opacity-100"
                            : "bg-white border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:border-primary hover:text-primary"
                    )}
                >
                    {selected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
            </div>

            <CardContent className="p-3 flex flex-col items-center text-center justify-center min-h-[60px]">

                {/* Mot Principal - FOCUS */}
                <h3 className={cn(
                    "text-lg font-bold tracking-tight leading-none transition-colors",
                    selected ? "text-primary" : "text-foreground/90 group-hover:text-primary"
                )}>
                    {word.ORTHO.toLowerCase()}
                </h3>

            </CardContent>
        </Card>
    );
}
