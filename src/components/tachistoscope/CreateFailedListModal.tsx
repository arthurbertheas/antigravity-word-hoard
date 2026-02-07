import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Word } from '@/types/word';
import { AlertTriangle, Check, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CreateFailedListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    failedWords: Word[];
}

export function CreateFailedListModal({ isOpen, onClose, onConfirm, failedWords }: CreateFailedListModalProps) {
    const [dontAskAgain, setDontAskAgain] = useState(() => {
        return localStorage.getItem('skipFailedListConfirmation') === 'true';
    });
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            // Check urgency: if dontAskAgain is true, we might want to auto-trigger?
            // The spec says "Si true : le clic sur le bouton crée directement la liste".
            // So this modal shouldn't even open if that's true. 
            // The parent component should handle that check. 
            // But if we are here, we show the modal.
            // However, the user might check the box and THEN confirm.
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (dontAskAgain) {
            localStorage.setItem('skipFailedListConfirmation', 'true');
        } else {
            localStorage.removeItem('skipFailedListConfirmation');
        }

        setIsSuccess(true);
        onConfirm(); // Parent triggers the actual save logic

        // Auto close after animation
        setTimeout(() => {
            onClose();
        }, 1800);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !isSuccess && !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[400px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[101] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 focus:outline-none overflow-hidden font-dm-sans">
                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="px-6 pt-6 flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7] shrink-0">
                                    <ListChecks className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <Dialog.Title className="text-base font-bold font-sora text-[#1A1A2E] mb-1">
                                        Créer une liste — Mots ratés
                                    </Dialog.Title>
                                    <Dialog.Description className="text-[13.5px] text-[#6B7280] leading-relaxed">
                                        Une nouvelle liste sera créée avec les mots non réussis de cette session.
                                    </Dialog.Description>
                                </div>
                            </div>

                            {/* Word chips preview */}
                            <div className="px-6 py-4">
                                <div className="bg-[#F8F9FC] rounded-xl p-4 border border-[#F3F4F6]">
                                    <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
                                        {failedWords.length} MOTS À RETRAVAILLER
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                                        {failedWords.map((word, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-[20px] bg-[#FDEDEC] text-[#E74C3C] text-[13px] font-medium border border-[#E74C3C]/10"
                                            >
                                                {word.ORTHO}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="px-6 pb-2">
                                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FFF8E1] border border-[#FFE082] text-[#F57F17] text-[13px]">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>La session en cours sera terminée.</span>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="px-6 pt-2">
                                <label
                                    className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#6B7280] select-none"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDontAskAgain(!dontAskAgain);
                                    }}
                                >
                                    <div className={cn(
                                        "w-[18px] h-[18px] rounded-[5px] border-[2px] flex items-center justify-center transition-all duration-200 shrink-0",
                                        dontAskAgain ? "border-[#6C5CE7] bg-[#6C5CE7]" : "border-gray-300 bg-transparent"
                                    )}>
                                        {dontAskAgain && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                    </div>
                                    Ne plus demander de confirmation
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="p-6 flex gap-2.5 justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-5.5 py-2.5 rounded-[10px] border border-gray-200 bg-white text-[#6B7280] font-medium text-[14px] hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-5.5 py-2.5 rounded-[10px] bg-[#6C5CE7] text-white font-semibold text-[14px] shadow-[0_2px_8px_rgba(108,92,231,0.3)] hover:bg-[#5b4bc4] transition-all"
                                >
                                    Créer la liste
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="py-10 px-7 flex flex-col items-center text-center gap-3">
                            <div className="w-[52px] h-[52px] rounded-full bg-[#E8FBF5] flex items-center justify-center text-[#00B894] animate-in zoom-in duration-300">
                                <Check className="w-[26px] h-[26px]" strokeWidth={3} />
                            </div>
                            <h3 className="font-sora text-[17px] font-bold text-[#1A1A2E]">
                                Liste créée !
                            </h3>
                            <p className="text-[14px] text-[#6B7280]">
                                {failedWords.length} mots ajoutés à « Mots à retravailler »
                            </p>
                            <div className="mt-1 h-[3px] w-[120px] rounded-full bg-gradient-to-r from-[#00B894] via-[#A29BFE] to-[#00B894] bg-[length:200%_100%] animate-shimmer" />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
