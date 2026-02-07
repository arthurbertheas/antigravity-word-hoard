import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Word } from '@/types/word';
import { AlertTriangle, Check, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CreateFailedListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: () => void;
    onSave: () => void;
    failedWords: Word[];
}

export function CreateFailedListModal({ isOpen, onClose, onLaunch, onSave, failedWords }: CreateFailedListModalProps) {
    const [dontAskAgain, setDontAskAgain] = useState(() => {
        return localStorage.getItem('skipFailedListConfirmation') === 'true';
    });

    // Update localStorage when checkbox changes
    const handleCheckboxChange = () => {
        const newValue = !dontAskAgain;
        setDontAskAgain(newValue);
        if (newValue) {
            localStorage.setItem('skipFailedListConfirmation', 'true');
        } else {
            localStorage.removeItem('skipFailedListConfirmation');
        }
    };

    const handleLaunch = () => {
        // Preference is already saved on change
        onLaunch();
    };

    const handleSave = () => {
        // Preference is already saved on change
        onSave();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[500px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-50 animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-300 focus:outline-none overflow-hidden font-dm-sans">
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
                                    handleCheckboxChange();
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
                        <div className="p-6 flex gap-3 justify-end items-center">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-[10px] border border-gray-200 bg-white text-[#9CA3AF] font-medium text-[15px] hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-3 rounded-[10px] border-[1.5px] border-[#6C5CE7] bg-white text-[#6C5CE7] font-semibold text-[15px] hover:bg-[#F0EDFF] transition-all flex items-center justify-center gap-2"
                            >
                                💾 Sauvegarder
                            </button>
                            <button
                                onClick={handleLaunch}
                                className="flex-[1.2] px-4 py-3 rounded-[10px] bg-[#6C5CE7] text-white font-semibold text-[15px] shadow-[0_3px_10px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] transition-all flex items-center justify-center gap-2"
                            >
                                ▶ Lancer la liste
                            </button>
                        </div>
                    </>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
