import { cn } from "@/lib/utils";

export type GroupVariant = 'primary' | 'secondary';

interface FilterGroupProps {
    label: string;
    variant: GroupVariant;
    className?: string;
}

export function FilterGroup({ label, variant, className }: FilterGroupProps) {
    return (
        <div className={cn("flex items-center gap-2 pl-[22px] pr-0 pt-[10px] pb-[5px]", className)}>
            <span className={cn(
                "font-display text-[9px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-200",
                variant === 'primary' ? "text-[#4f46e5]" : "text-[#6B7280]"
            )}>
                {label}
            </span>
            <div className={cn(
                "flex-1 h-[1.5px] transition-colors duration-200",
                variant === 'primary' ? "bg-gradient-to-r from-[#4f46e5]/40 to-transparent" : "bg-gradient-to-r from-[#6B7280]/40 to-transparent"
            )} />
        </div>
    );
}
