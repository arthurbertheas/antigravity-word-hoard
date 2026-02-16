import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
    icon?: React.ReactNode | string;
    label: string;
    desc?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    children?: React.ReactNode;
    className?: string;
}

export function ToggleRow({ icon, label, desc, checked, onCheckedChange, children, className }: ToggleRowProps) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between py-2.5 px-3.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all",
                checked
                    ? "bg-[#F5F3FF] border-[rgba(108,92,231,0.15)]"
                    : "border-transparent hover:bg-[#FAFBFC]",
                className,
            )}
            onClick={() => onCheckedChange(!checked)}
        >
            <div className="flex items-center gap-2.5">
                {icon != null && (
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-sora flex-shrink-0 transition-all",
                        checked
                            ? "bg-white text-[#6C5CE7] shadow-[0_1px_4px_rgba(108,92,231,0.12)]"
                            : "bg-[#FAFBFC] text-[#9CA3AF]",
                    )}>
                        {typeof icon === 'string' ? icon : icon}
                    </div>
                )}
                <div>
                    <div className={cn(
                        "text-[13px] font-semibold",
                        checked ? "text-[#374151]" : "text-[#374151]",
                    )}>{label}</div>
                    {desc && <div className="text-[11px] text-[#9CA3AF] mt-px">{desc}</div>}
                </div>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                onClick={(e) => e.stopPropagation()}
            />
            {children && checked && (
                <div className="w-full mt-2 pt-2 border-t border-[rgba(108,92,231,0.1)]">
                    {children}
                </div>
            )}
        </div>
    );
}
