import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupVariant } from "./FilterGroup";

interface FilterSectionProps {
    title: string;
    icon?: React.ReactNode;
    badge?: number | string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: GroupVariant; // NEW variant prop
}

export function FilterSection({
    title,
    icon,
    badge,
    isOpen,
    onToggle,
    children,
    className,
    variant = 'text' // Default variant
}: FilterSectionProps) {

    // Helper to get dynamic classes based on variant
    const getVariantClasses = (v: GroupVariant) => {
        switch (v) {
            case 'text':
                return {
                    icon: "bg-[rgba(var(--cat-text),0.07)] border border-[rgba(var(--cat-text),0.14)]",
                    borderLeft: "border-l-2 border-[rgba(var(--cat-text),0.14)]",
                    count: "bg-[rgba(var(--cat-text),0.07)] text-[rgb(var(--cat-text))]"
                };
            case 'struct':
                return {
                    icon: "bg-[rgba(var(--cat-struct),0.07)] border border-[rgba(var(--cat-struct),0.14)]",
                    borderLeft: "border-l-2 border-[rgba(var(--cat-struct),0.14)]",
                    count: "bg-[rgba(var(--cat-struct),0.07)] text-[rgb(var(--cat-struct))]"
                };
            case 'metric':
                return {
                    icon: "bg-[rgba(var(--cat-metric),0.07)] border border-[rgba(var(--cat-metric),0.14)]",
                    borderLeft: "border-l-2 border-[rgba(var(--cat-metric),0.14)]",
                    count: "bg-[rgba(var(--cat-metric),0.07)] text-[rgb(var(--cat-metric))]"
                };
            default:
                return { icon: "", borderLeft: "", count: "" };
        }
    };

    const styles = getVariantClasses(variant);

    return (
        <div className={cn("bg-white", className)}>
            <div
                className={cn(
                    "flex items-center justify-between px-[22px] py-[9px] cursor-pointer transition-colors hover:bg-[hsl(210,40%,99%)]",
                    isOpen && "bg-[hsl(210,40%,99%)]"
                )}
                onClick={onToggle}
            >
                <div className="flex items-center gap-[10px]">
                    {icon && (
                        <div className={cn("w-8 h-8 rounded-[9px] flex items-center justify-center text-[14px]", styles.icon)}>
                            {icon}
                        </div>
                    )}
                    <span className="font-display text-[12px] font-semibold uppercase tracking-[0.02em] text-[rgb(var(--filter-text-primary))]">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-[6px]">
                    {badge !== undefined && badge !== 0 && (
                        <span className={cn(
                            "font-mono text-[10px] font-semibold min-w-[18px] h-[18px] flex items-center justify-center rounded-[5px] px-[5px]",
                            styles.count
                        )}>
                            {badge}
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            "w-3.5 h-3.5 text-muted-foreground transition-all duration-200",
                            isOpen ? "transform rotate-180 opacity-65" : "opacity-35"
                        )}
                    />
                </div>
            </div>

            <div
                className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className={cn(
                        "ml-[43px] px-[22px] pt-1 pb-[14px]",
                        isOpen && styles.borderLeft
                    )}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
