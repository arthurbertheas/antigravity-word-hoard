import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Word } from "@/types/word";

interface ResultsHeaderProps {
    words: Word[];
    isAllSelected: boolean;
    onToggleSelectAll: () => void;
}

export function ResultsHeader({ words, isAllSelected, onToggleSelectAll }: ResultsHeaderProps) {
    return (
        <div className="flex items-end justify-between py-3 px-6 border-b border-[#e4e6eb]">
            {/* GAUCHE : Compteur */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                    Résultats
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="font-sora text-[22px] font-bold text-slate-800 leading-none">{words.length}</span>
                    <span className="text-sm font-medium text-slate-500">mots trouvés</span>
                </div>
            </div>

            {/* DROITE : Bouton Toggle Smart */}
            <button
                onClick={onToggleSelectAll}
                disabled={words.length === 0}
                className={cn(
                    "group flex items-center gap-2 px-4 py-2 bg-white border rounded-[10px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                    isAllSelected
                        ? "border-[#4f46e5] bg-[#f5f7ff]"
                        : "border-[#d1d5db] hover:border-[#9ca3af]"
                )}
            >
                {isAllSelected ? (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4f46e5] text-white">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#9ca3af] group-hover:border-[#6b7280] transition-colors" />
                )}
                <span className={cn(
                    "text-sm font-semibold",
                    isAllSelected
                        ? "text-[#4f46e5]"
                        : "text-[#4b5563] group-hover:text-[#1f2937]"
                )}>
                    {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                </span>
            </button>
        </div>
    );
}
