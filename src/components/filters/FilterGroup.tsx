import { cn } from "@/lib/utils";

export type GroupVariant = 'text' | 'struct' | 'metric';

interface FilterGroupProps {
    label: string;
    variant: GroupVariant;
    className?: string;
}

export function FilterGroup({ label, variant, className }: FilterGroupProps) {
    return (
        <div className={cn("flex items-center gap-2 px-[22px] pt-[14px] pb-[5px]", className)}>
            <span className={cn(
                "font-display text-[9px] font-bold uppercase tracking-[0.1em] whitespace-nowrap",
                variant === 'text' && "text-[rgb(var(--cat-text))]",
                variant === 'struct' && "text-[rgb(var(--cat-struct))]",
                variant === 'metric' && "text-[rgb(var(--cat-metric))]"
            )}>
                {label}
            </span>
            <div className={cn(
                "flex-1 h-[1px]",
                variant === 'text' && "bg-[rgb(var(--cat-text)/0.14)]",
                variant === 'struct' && "bg-[rgb(var(--cat-struct)/0.14)]",
                variant === 'metric' && "bg-[rgb(var(--cat-metric)/0.14)]"
            )} />
        </div>
    );
}
