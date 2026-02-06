import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
    title: string;
    icon?: React.ReactNode;
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string; // To support extra styling if needed
}

export function FilterSection({ title, icon, badge, isOpen, onToggle, children, className }: FilterSectionProps) {
    return (
        <div className={cn("px-[22px] mb-1", className)}>
            <div
                className="flex items-center gap-2 py-2.5 px-3 -mx-3 cursor-pointer group hover:bg-[rgb(var(--filter-surface-hover))] rounded-lg transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2.5 flex-1">
                    {icon && (
                        <div className="w-7 h-7 rounded-[8px] bg-[rgb(var(--filter-accent-light))] border border-[rgb(var(--filter-border))] flex items-center justify-center transition-colors group-hover:bg-[rgb(var(--filter-accent-light))]">
                            {icon}
                        </div>
                    )}
                    <span className="font-sora text-[11px] font-medium uppercase tracking-[0] text-[rgb(var(--filter-text-secondary))] group-hover:text-[rgb(var(--filter-accent))] transition-colors">
                        {title}
                    </span>
                    {badge !== undefined && badge > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] bg-[rgb(var(--filter-accent))] text-white text-[10px] font-bold rounded-full ml-1">
                            {badge}
                        </span>
                    )}
                </div>
                <ChevronDown className={cn(
                    "ml-auto text-[rgb(var(--filter-text-muted))] transition-transform duration-250 w-[14px] h-[14px]",
                    !isOpen && "-rotate-90"
                )} />
            </div>
            {isOpen && <div className="pb-[6px]">{children}</div>}
        </div>
    );
}
