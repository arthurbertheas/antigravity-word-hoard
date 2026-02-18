import { cn } from "@/lib/utils";
import { Check, X, ChevronDown } from "lucide-react";
import { FilterMode } from "@/types/word";

interface ModeToggleProps {
    mode: FilterMode;
    onToggle: () => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
    const isInclude = mode === 'include';
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
                "flex items-center gap-1 px-2.5 border-r-[1.5px] text-[10px] font-['Sora'] font-bold tracking-[0.2px] whitespace-nowrap select-none transition-all shrink-0",
                isInclude
                    ? "bg-[#f8f9fc] text-[rgb(var(--filter-accent))] border-r-border hover:bg-[#eef0f7]"
                    : "bg-[#fef7f7] text-red-500 border-r-red-200 hover:bg-red-100"
            )}
        >
            {isInclude
                ? <Check className="w-[13px] h-[13px]" />
                : <X className="w-[13px] h-[13px]" />
            }
            {isInclude ? 'Contient' : 'Sans'}
            <ChevronDown className="w-2 h-2 opacity-40 -ml-0.5" />
        </button>
    );
}
