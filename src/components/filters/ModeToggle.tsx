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
            onClick={onToggle}
            className={cn(
                "flex items-center gap-1 px-2 border-r text-[10px] font-['Sora'] font-bold tracking-[0.2px] whitespace-nowrap select-none transition-colors shrink-0",
                isInclude
                    ? "bg-[rgba(79,70,229,0.04)] text-[rgb(var(--filter-accent))] border-r-border hover:bg-[rgba(79,70,229,0.08)]"
                    : "bg-red-50/80 text-red-500 border-r-red-200 hover:bg-red-100"
            )}
        >
            {isInclude
                ? <Check className="w-3 h-3" />
                : <X className="w-3 h-3" />
            }
            {isInclude ? 'Contient' : 'Sans'}
            <ChevronDown className="w-2 h-2 opacity-40 -ml-0.5" />
        </button>
    );
}
