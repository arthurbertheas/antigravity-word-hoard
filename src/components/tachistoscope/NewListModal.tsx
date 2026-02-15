import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Download } from "lucide-react";

interface NewListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadAndContinue: () => void;
    onContinueWithoutSaving: () => void;
}

export function NewListModal({ isOpen, onClose, onDownloadAndContinue, onContinueWithoutSaving }: NewListModalProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[420px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[101] animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-300 focus:outline-none overflow-hidden font-dm-sans">
                    {/* Header */}
                    <div className="px-6 pt-6 flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] flex items-center justify-center text-[#F59E0B] shrink-0">
                            <AlertTriangle className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <Dialog.Title className="text-base font-bold font-sora text-[#1A1A2E] mb-1">
                                Nouvelle liste
                            </Dialog.Title>
                            <Dialog.Description className="text-[13.5px] text-[#6B7280] leading-relaxed">
                                La session en cours sera perdue. Voulez-vous télécharger le rapport avant de continuer ?
                            </Dialog.Description>
                        </div>
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
                            onClick={onContinueWithoutSaving}
                            className="px-4 py-3 rounded-[10px] border-[1.5px] border-[#6C5CE7] bg-white text-[#6C5CE7] font-semibold text-[15px] hover:bg-[#F0EDFF] transition-all"
                        >
                            Continuer
                        </button>
                        <button
                            onClick={onDownloadAndContinue}
                            className="px-4 py-3 rounded-[10px] bg-[#6C5CE7] text-white font-semibold text-[15px] shadow-[0_3px_10px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Exporter & Continuer
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
