import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    label: string;
    badge?: string;
    className?: string;
}

export function SectionHeader({ label, badge, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex items-center gap-2 mb-3.5", className)}>
            <span className="font-sora text-[9px] font-bold uppercase tracking-[0.1em] whitespace-nowrap text-[#6C5CE7]">
                {label}
            </span>
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#6C5CE7]/40 to-transparent" />
            {badge && (
                <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </div>
    );
}
