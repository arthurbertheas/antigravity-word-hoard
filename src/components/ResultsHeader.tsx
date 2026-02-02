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
        <div className="flex items-end justify-between py-3 px-6 border-b border-slate-100">
            {/* GAUCHE : Compteur */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                    Résultats
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800 leading-none">{words.length}</span>
                    <span className="text-sm font-medium text-slate-500">mots trouvés</span>
                </div>
            </div>

            {/* DROITE : Bouton Toggle Smart */}
            <button
                onClick={onToggleSelectAll}
                disabled={words.length === 0}
                className={cn(
                    "group flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                    isAllSelected
                        ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                )}
            >
                {isAllSelected ? (
                    <XCircle className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                )}
                <span className={cn(
                    "text-sm font-bold",
                    isAllSelected
                        ? "text-slate-500 group-hover:text-slate-800"
                        : "text-slate-600 group-hover:text-blue-700"
                )}>
                    {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                </span>
            </button>
        </div>
    );
}
