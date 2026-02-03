import { Word } from "@/types/word";
import { useSelection } from "@/contexts/SelectionContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    const { isSelected, toggleSelection } = useSelection();
    const selected = isSelected(word);

    return (
        <div
            onClick={() => toggleSelection(word)}
            title={`${word.ORTHO} - ${word.NBSYLL} syll.`}
            className={cn(
                "relative flex items-center justify-center px-4 py-2.5 rounded-lg border-[1.5px] cursor-pointer select-none h-[50px] text-center transition-all duration-200",
                "hover:border-primary hover:shadow-md hover:-translate-y-0.5",
                selected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-gray-200 bg-white hover:bg-white"
            )}
        >
            {/* Le Mot */}
            <span className={cn(
                "text-sm font-medium truncate w-full px-4",
                selected ? "text-blue-700" : "text-foreground"
            )}>
                {word.ORTHO}
            </span>

            {/* Indicateur de sélection (Check) - Absolute positioned to avoid text shift */}
            {selected && (
                <div className="absolute right-2 flex items-center">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                </div>
            )}
        </div>
    );
}
