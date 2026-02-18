import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterTag as IFilterTag } from "@/types/word";

interface FilterTagProps {
    tag: IFilterTag;
    onRemove: (id: string) => void;
    formatLabel?: (value: string) => string;
}

export function FilterTag({ tag, onRemove, formatLabel }: FilterTagProps) {
    const label = formatLabel ? formatLabel(tag.value) : tag.value;
    const positionLabel = tag.position === 'start' ? 'début' :
        tag.position === 'end' ? 'fin' :
            tag.position === 'middle' ? 'milieu' :
                'partout';

    const isExclude = tag.mode === 'exclude';

    return (
        <div className={cn(
            "flex items-center gap-1.5 pl-2 pr-1.5 py-[3px] border rounded-[6px]",
            isExclude
                ? "bg-red-50 border-red-200"
                : "bg-[rgba(79,70,229,0.06)] border-[rgba(79,70,229,0.15)]"
        )}>
            <span className={cn(
                "font-mono text-[12px] font-medium",
                isExclude
                    ? "text-red-600"
                    : "text-[rgb(var(--filter-text-primary))]"
            )}>
                {label}
            </span>
            <span className={cn(
                "font-['DM_Sans'] text-[10px] font-medium",
                isExclude
                    ? "text-red-400"
                    : "text-[rgb(var(--filter-text-muted))]"
            )}>
                {positionLabel}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(tag.id);
                }}
                className={cn(
                    "w-3.5 h-3.5 flex items-center justify-center rounded-full transition-colors ml-0.5",
                    isExclude
                        ? "text-red-400 hover:bg-red-200 hover:text-red-600"
                        : "text-red-500 hover:bg-red-100 hover:text-red-600"
                )}
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </div>
    );
}
