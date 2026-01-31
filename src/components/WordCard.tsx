import { Card } from "@/components/ui/card";
import { Word } from "@/types/word";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    const { isSelected, toggleSelection } = useSelection();
    const selected = isSelected(word);

    const handleSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleSelection(word);
    };

    return (
        <Card
            onClick={() => onClick?.(word)}
            className={cn(
                "group relative aspect-square flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "border-border/40 bg-white/50 backdrop-blur-sm",
                "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5",
                selected
                    ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20"
                    : "hover:bg-white"
            )}
        >
            {/* Background Decoration */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-500",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />

            {/* Selection Trigger Area (Top Right) */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={handleSelection}
                    className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                        selected
                            ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20 rotate-0"
                            : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary -rotate-90 hover:rotate-0"
                    )}
                >
                    {selected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
            </div>

            {/* Word Content */}
            <div className="relative z-0 flex flex-col items-center text-center space-y-1">
                <h3 className={cn(
                    "text-xl font-bold tracking-tight transition-all duration-300",
                    selected ? "text-primary scale-110" : "text-foreground group-hover:text-primary"
                )}>
                    {word.ORTHO}
                </h3>

                {/* Secondary Info (Phonetic or Syl) */}
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                    selected ? "text-primary/60" : "text-muted-foreground/40 group-hover:text-primary/40"
                )}>
                    {word.NBSYLL} syll.
                </span>
            </div>

            {/* Bottom Glow (Active state) */}
            {selected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary animate-in slide-in-from-bottom-1 duration-300" />
            )}
        </Card>
    );
}
