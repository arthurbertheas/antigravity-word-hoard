import React, { useState, useEffect, useRef } from 'react';
import { WordFilters } from '@/types/word';
import { calculateDistribution, DistributionPreview } from '@/utils/random-selection';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface RandomSelectionPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    maxWords: number;
    activeFilters: WordFilters;
    currentCount: number;
    isActive: boolean;
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
    onSelect,
    onDeselect
}: RandomSelectionPopoverProps) {
    const [inputValue, setInputValue] = useState(isActive && currentCount > 0 ? currentCount.toString() : '30');
    const [distribution, setDistribution] = useState<DistributionPreview[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            // S'assurer que le focus se fait après le rendu
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 50);
        }
    }, [isOpen]);

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
                className="absolute top-[calc(100%+8px)] right-0 z-50 w-[280px] bg-white border border-[#e0e3eb] rounded-[14px] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-150 origin-top-right"
            >
                {/* Header / Close (Mobile mostly, but good for UX) */}
                <div className="absolute top-2 right-2 md:hidden">
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-4">
                    <div className="text-[11px] font-semibold text-[#8b8fa8] uppercase tracking-[0.5px] mb-2">
                        Nombre de mots
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="flex-1 p-[12px_14px] bg-[#f8f9fc] border border-[#e8ebf2] rounded-[10px] text-[16px] font-semibold text-[#1a1a2e] text-center focus:outline-none focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10 transition-all"
                        />
                        <div className="text-[12px] text-[#8b8fa8] whitespace-nowrap">
                            max <strong className="text-[#6366f1]">{maxWords}</strong>
                        </div>
                    </div>
                </div>

                {distribution.length > 0 && (
                    <div className="mb-4">
                        <div className="text-[11px] font-semibold text-[#8b8fa8] uppercase tracking-[0.5px] mb-2">
                            Répartition estimée
                        </div>
                        <div className="bg-[#f8f9fc] rounded-[10px] p-3 text-[12px]">
                            {distribution.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-1.5 border-b border-[#eef0f5] last:border-0 last:pb-0 first:pt-0">
                                    <span className="text-[#6b6f8a] truncate max-w-[150px]" title={item.label}>
                                        {item.label}
                                    </span>
                                    <span className="font-semibold text-[#6366f1] whitespace-nowrap ml-2">
                                        ~{item.perValue} chacun
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSelect}
                    className="w-full py-3 bg-gradient-to-br from-[#6366f1] to-[#818cf8] text-white rounded-[10px] text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all"
                >
                    {isActive ? `Modifier (${inputValue} mots)` : `Sélectionner ${inputValue} mots`}
                </button>

                {isActive && (
                    <button
                        onClick={onDeselect}
                        className="w-full mt-2 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                    >
                        Désélectionner
                    </button>
                )}
            </div>
        </>
    );
}
