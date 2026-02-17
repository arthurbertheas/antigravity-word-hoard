import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Word, WordFilters } from "@/types/word";
import { RandomSelectButton } from "./RandomSelectButton";

interface ResultsHeaderProps {
  words: Word[];
  filters: WordFilters;
  isAllSelected: boolean;
  randomSelectedCount: number;
  randomStaleCount: number;
  onToggleSelectAll: () => void;
  onRandomSelect: (count: number) => void;
  onRandomDeselect: () => void;
}

export function ResultsHeader({
  words,
  filters,
  isAllSelected,
  randomSelectedCount,
  randomStaleCount,
  onToggleSelectAll,
  onRandomSelect,
  onRandomDeselect
}: ResultsHeaderProps) {
  return (
    <div className="flex items-end justify-between px-6 border-b border-[#e4e6eb] py-[16px]">
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

      {/* DROITE : Boutons d'action */}
      <div className="flex items-center gap-3">
        {/* Tout Sélectionner */}
        <button
          onClick={onToggleSelectAll}
          disabled={words.length === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-white border rounded-[10px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group",
            isAllSelected ?
              "border-[#6366f1]" :
              "border-[#d1d5db] hover:border-[#6366f1]",
            isAllSelected ? "bg-white" : "hover:bg-[#fafaff]"
          )}>
          {/* Circle Indicator */}
          <div className={cn(
            "w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all border-2",
            isAllSelected ?
              "bg-[#6366f1] border-[#6366f1]" :
              "border-[#d0d3e0] group-hover:border-[#6366f1]"
          )}>
            {isAllSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
          </div>

          <span className={cn(
            "text-sm font-semibold transition-colors",
            isAllSelected ?
              "text-[#6366f1]" :
              "text-[#4b5563] group-hover:text-[#6366f1]"
          )}>
            {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </span>
        </button>

        {/* Sélection Aléatoire */}
        <RandomSelectButton
          availableWords={words}
          activeFilters={filters}
          randomSelectedCount={randomSelectedCount}
          randomStaleCount={randomStaleCount}
          onRandomSelect={onRandomSelect}
          onRandomDeselect={onRandomDeselect}
          disabled={words.length === 0}
        />
      </div>
    </div>
  );
}