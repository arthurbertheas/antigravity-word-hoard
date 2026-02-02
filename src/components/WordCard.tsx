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
                "relative flex items-center justify-center px-3 py-2 rounded-md border cursor-pointer transition-all select-none h-11 text-center",
                selected
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
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
