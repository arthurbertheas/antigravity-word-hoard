import { X, ChevronLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PanelTopbarProps {
    title: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    onClose: () => void;
    onBack?: () => void;
    className?: string;
}

export function PanelTopbar({ title, icon, badge, onClose, onBack, className }: PanelTopbarProps) {
    return (
        <div className={cn("flex items-center justify-between px-4 bg-white border-b border-[#E5E7EB] h-11 flex-shrink-0 print:hidden relative", className)}>
            {/* Left — close or back */}
            <button
                onClick={onBack || onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#6C5CE7] hover:bg-[#F5F3FF] transition-all"
                title={onBack ? "Retour" : "Fermer (Échap)"}
            >
                {onBack ? <ChevronLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>

            {/* Center — title (absolutely positioned for true centering) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                {icon}
                <span className="font-sora text-[13px] font-bold text-[#1A1A2E]">{title}</span>
                {badge}
            </div>

            {/* Right — spacer for visual balance */}
            <div className="w-8" />
        </div>
    );
}
