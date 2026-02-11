import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeleteListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    listName: string;
}

export function DeleteListModal({ isOpen, onClose, onConfirm, listName }: DeleteListModalProps) {
    const [shake, setShake] = useState(false);

    // Effet shake supprimé à l'ouverture pour éviter le "pop"
    // L'animation pourra être réactivée sur une action spécifique si nécessaire

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[380px] p-0 border-none rounded-[22px] overflow-hidden z-[105]">
                <div className="bg-white p-7 flex flex-col items-center text-center">
                    {/* Animated Trash Icon */}
                    <div className={cn(
                        "w-[52px] h-[52px] rounded-[16px] bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] flex items-center justify-center text-[#EF4444] mb-5 shadow-sm",
                        shake && "animate-[shake_0.5s_ease-in-out]" // Shake uniquement si activé explicitement
                    )}>
                        <Trash2 className="w-6 h-6" />
                    </div>

                    <h3 className="font-['Sora'] text-[16px] font-[700] text-[#1A1A2E] mb-2">
                        Êtes-vous sûr(e) ?
                    </h3>

                    <p className="font-['DM_Sans'] text-[14px] text-[#6B7280] leading-relaxed mb-8">
                        Vous êtes sur le point de supprimer <span className="font-bold text-[#1A1A2E]">"{listName}"</span>.<br />
                        Cette action ne peut pas être annulée.
                    </p>

                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-[12px] border-[1.5px] border-[#E5E7EB] text-[#6B7280] font-[600] font-['DM_Sans'] hover:bg-[#F8F9FC] hover:text-[#1A1A2E]"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 h-11 rounded-[12px] bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-[600] font-['DM_Sans'] shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.35)] transition-all hover:-translate-y-px"
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shake {
                        0%, 100% { transform: rotate(0deg); }
                        20% { transform: rotate(-8deg); }
                        40% { transform: rotate(8deg); }
                        60% { transform: rotate(-4deg); }
                        80% { transform: rotate(4deg); }
                    }
                `}} />
            </DialogContent>
        </Dialog>
    );
}
