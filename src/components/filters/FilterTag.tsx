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

    return (
        <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-[3px] bg-[rgba(79,70,229,0.06)] border border-[rgba(79,70,229,0.15)] rounded-[6px]">
            <span className="font-mono text-[12px] font-medium text-[rgb(var(--filter-text-primary))]">
                {label}
            </span>
            <span className="font-['DM_Sans'] text-[10px] font-medium text-[rgb(var(--filter-text-muted))]">
                {positionLabel}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(tag.id);
                }}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors ml-0.5"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </div>
    );
}
