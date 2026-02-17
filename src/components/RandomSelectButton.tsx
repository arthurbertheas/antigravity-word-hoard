import React, { useState } from 'react';
import { Word, WordFilters } from '@/types/word';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { RandomSelectionPopover } from './RandomSelectionPopover';

interface RandomSelectButtonProps {
    availableWords: Word[];
    activeFilters: WordFilters;
    randomSelectedCount: number;
    isRandomStale: boolean;
    randomStaleCount: number;
    onRandomSelect: (count: number) => void;
    onRandomDeselect: () => void;
    disabled?: boolean;
}

export function RandomSelectButton({
    availableWords,
    activeFilters,
    randomSelectedCount,
    isRandomStale,
    randomStaleCount,
    onRandomSelect,
    onRandomDeselect,
    disabled
}: RandomSelectButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = randomSelectedCount > 0;
    const isStale = isActive && (isRandomStale || randomStaleCount > 0);

    const handleSelect = (count: number) => {
        onRandomSelect(count);
        // On laisse ouvert ou on ferme ? Le design dit "Sélectionner" lance la sélection.
        // On peut fermer après sélection.
        setIsOpen(false);
    };

    const handleDeselect = () => {
        onRandomDeselect();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-white border rounded-[10px] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group relative",
                    isStale
                        ? "border-[#f59e0b] bg-[#fef9ee]"
                        : (isActive || isOpen)
                            ? "border-[#6366f1]"
                            : "border-[#d1d5db] hover:border-[#6366f1]",
                    !isStale && !isActive && "hover:bg-[#fafaff]"
                )}
            >
                {/* Stale badge (only show count when words actually left the pool) */}
                {isStale && randomStaleCount > 0 && (
                    <span className="absolute -top-[7px] -right-[7px] min-w-[18px] h-[18px] px-[5px] bg-[#f59e0b] text-white rounded-full font-sora text-[10px] font-bold flex items-center justify-center border-[2.5px] border-white shadow-[0_2px_6px_rgba(245,158,11,0.3)]">
                        {randomStaleCount}
                    </span>
                )}

                {/* Circle Indicator */}
                <div className={cn(
                    "w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all border-2",
                    isStale
                        ? "bg-[#f59e0b] border-[#f59e0b]"
                        : isActive
                            ? "bg-[#6366f1] border-[#6366f1]"
                            : "border-[#d0d3e0] group-hover:border-[#6366f1]"
                )}>
                    {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                </div>

                {/* Label */}
                <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isStale
                        ? "text-[#b45309]"
                        : isActive
                            ? "text-[#6366f1]"
                            : "text-[#4b5563] group-hover:text-[#6366f1]"
                )}>
                    {isActive ? `${randomSelectedCount} aléatoires` : "Aléatoire"}
                </span>

                {/* Chevron */}
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 ml-1 transition-transform duration-200",
                    isOpen && "rotate-180",
                    isStale
                        ? "text-[#f59e0b]"
                        : isActive || isOpen
                            ? "text-[#6366f1]"
                            : "text-[#9ca3af]"
                )} strokeWidth={2.5} />
            </button>

            <RandomSelectionPopover
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                maxWords={availableWords.length}
                activeFilters={activeFilters}
                currentCount={randomSelectedCount}
                isActive={isActive}
                isStale={isStale}
                staleCount={randomStaleCount}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
            />
        </div>
    );
}
