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
                "relative inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer select-none min-h-[50px] min-w-[70px] text-center transition-all duration-200",
                "hover:border-[#4f46e5] hover:bg-[#f0f1f4] hover:shadow-[0_2px_8px_rgba(79,70,229,0.12)] hover:-translate-y-px",
                selected
                    ? "border-[#4f46e5] bg-[#eef2ff] text-[#4f46e5] font-semibold shadow-sm"
                    : "border-[#e4e6eb] bg-white"
            )}
        >
            {/* Le Mot */}
            <span className={cn(
                "text-[15px] font-medium whitespace-nowrap",
                selected ? "text-[#4f46e5] font-semibold" : "text-[#1a1c23]"
            )}>
                {word.ORTHO}
            </span>

            {/* Indicateur de sélection (Check) - Absolute positioned to avoid text shift */}
            {selected && (
                <div className="absolute right-2 top-2 flex items-center">
                    <Check className="w-4 h-4 text-[#4f46e5]" />
                </div>
            )}
        </div>
    );
}
