import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, ArrowRight, X } from "lucide-react";
import { cn } from '@/lib/utils';

interface NewListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadAndContinue: () => void;
    onContinueWithoutSaving: () => void;
}

export function NewListModal({ isOpen, onClose, onDownloadAndContinue, onContinueWithoutSaving }: NewListModalProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[420px] bg-card rounded-[20px] shadow-2xl border border-border z-50 animate-in zoom-in-95 duration-200 p-6 focus:outline-none">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>

                        <Dialog.Title className="text-xl font-bold font-sora text-foreground mb-2">
                            Nouvelle liste
                        </Dialog.Title>

                        <Dialog.Description className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Attention, vous êtes sur le point d'abandonner la session en cours. Voulez-vous télécharger le rapport avant de continuer ?
                        </Dialog.Description>

                        <div className="w-full space-y-3">
                            <Button
                                onClick={onDownloadAndContinue}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-[12px] shadow-md shadow-primary/20"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger & Continuer
                            </Button>

                            <Button
                                onClick={onContinueWithoutSaving}
                                variant="outline"
                                className="w-full border-border bg-transparent hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 font-semibold h-12 rounded-[12px] transition-colors"
                            >
                                Continuer sans sauvegarder
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>

                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-foreground h-10 rounded-[10px]"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
