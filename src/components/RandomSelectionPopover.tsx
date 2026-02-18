import React, { useState, useEffect, useRef } from 'react';
import { WordFilters } from '@/types/word';
import { calculateDistribution, DistributionPreview } from '@/utils/random-selection';
import { cn } from '@/lib/utils';
import { X, AlertTriangle } from 'lucide-react';

interface RandomSelectionPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    maxWords: number;
    activeFilters: WordFilters;
    currentCount: number;
    isActive: boolean;
    isStale: boolean;
    staleCount: number;
    onSelect: (count: number) => void;
    onDeselect: () => void;
}

export function RandomSelectionPopover({
    isOpen,
    onClose,
    maxWords,
    activeFilters,
    currentCount,
    isActive,
    isStale,
    staleCount,
    onSelect,
    onDeselect
}: RandomSelectionPopoverProps) {
    const [inputValue, setInputValue] = useState(isActive && currentCount > 0 ? currentCount.toString() : '30');
    const [distribution, setDistribution] = useState<DistributionPreview[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Focus input on open


    // Update distribution preview when input changes or filters change
    useEffect(() => {
        const count = parseInt(inputValue, 10);
        if (!isNaN(count) && count > 0) {
            const dist = calculateDistribution(Math.min(count, maxWords), activeFilters);
            setDistribution(dist);
        } else {
            setDistribution([]);
        }
    }, [inputValue, activeFilters, maxWords]);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                // On laisse le composant parent gérer la fermeture si le clic est sur le bouton trigger
                // Mais ici on peut fermer si c'est vraiment "dehors"
                // Pour simplifier, on peut utiliser un backdrop invisible ou juste le ref check
                // onClose(); // Attention aux conflits avec le toggle du bouton
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!isOpen) return null;

    const handleBlur = () => {
        let val = parseInt(inputValue, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > maxWords) val = maxWords;
        setInputValue(val.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSelect();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = () => {
        const count = parseInt(inputValue, 10);
        if (!isNaN(count) && count > 0) {
            onSelect(Math.min(count, maxWords));
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop transparent pour fermer au clic dehors */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div
                ref={popoverRef}
                className="absolute top-[calc(100%+8px)] right-0 z-50 w-[290px] bg-white border border-[#e0e3eb] rounded-[14px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)] animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden"
            >
                {/* Header / Close (Mobile mostly, but good for UX) */}
                <div className="absolute top-2 right-2 md:hidden z-10">
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Stale notice */}
                {isStale && (
                    <div className="flex items-start gap-2.5 p-3 px-4 bg-gradient-to-br from-[#fef9ee] to-[#fff7ed] border-b border-[#fde68a]">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#fde68a] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                        </div>
                        <p className="text-[12.5px] text-[#b45309] leading-[1.45] pt-[1px]">
                            {staleCount > 0
                                ? <><strong className="font-bold">{staleCount} mot{staleCount > 1 ? 's' : ''}</strong> de votre tirage ne correspond{staleCount > 1 ? 'ent' : ''} plus aux filtres actuels.</>
                                : <>Les filtres ont changé depuis le tirage. La répartition n'est plus optimale.</>
                            }
                        </p>
                    </div>
                )}

                <div className="p-4">
                    <div className="mb-4">
                        <div className="text-[11px] font-bold text-[#8b8fa8] uppercase tracking-[0.5px] mb-2.5">
                            Nombre de mots
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '');
                                    const num = parseInt(digits, 10);
                                    if (!isNaN(num) && num > maxWords) {
                                        setInputValue(maxWords.toString());
                                    } else {
                                        setInputValue(digits);
                                    }
                                }}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                className="w-[72px] p-[10px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[10px] font-sora text-[16px] font-bold text-[#1a1a2e] text-center focus:outline-none focus:border-[#6366f1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all"
                            />
                            <div className="text-[12px] text-[#94a3b8] whitespace-nowrap">
                                max <strong className="text-[#6366f1] font-bold">{maxWords}</strong>
                            </div>
                        </div>
                    </div>

                    {distribution.length > 0 && (
                        <div className="mb-4">
                            <div className="text-[11px] font-bold text-[#8b8fa8] uppercase tracking-[0.5px] mb-2">
                                {isStale ? 'Nouvelle répartition' : 'Répartition estimée'}
                            </div>
                            <div className="bg-[#f8f9fc] rounded-[10px] p-3 text-[12px]">
                                {distribution.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-1.5 border-b border-[#eef0f5] last:border-0 last:pb-0 first:pt-0">
                                        <span className="text-[#6b6f8a] truncate max-w-[150px]" title={item.label}>
                                            {item.label}
                                        </span>
                                        <span className={cn(
                                            "whitespace-nowrap ml-2",
                                            item.isSingleValue
                                                ? "text-[#94a3b8] font-medium"
                                                : "font-semibold text-[#6366f1]"
                                        )}>
                                            {item.isSingleValue ? 'tous' : `~${item.perValue} chacun`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSelect}
                        className="w-full py-3 bg-gradient-to-br from-[#6366f1] to-[#818cf8] text-white rounded-[10px] text-[14px] font-bold shadow-[0_4px_14px_-2px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_-2px_rgba(99,102,241,0.45)] hover:-translate-y-px active:translate-y-0 transition-all"
                    >
                        {isStale
                            ? 'Relancer le tirage'
                            : isActive
                                ? `Modifier (${inputValue} mots)`
                                : `Sélectionner ${inputValue} mots`
                        }
                    </button>

                    {isActive && (
                        <button
                            onClick={onDeselect}
                            className="w-full mt-2 py-2 text-[13px] font-semibold text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                        >
                            Désélectionner
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
