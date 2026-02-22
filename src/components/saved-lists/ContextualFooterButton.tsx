import React, { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveState = 'idle' | 'saving' | 'saved';

interface ContextualFooterButtonProps {
    mode: 'create' | 'update' | 'hidden';
    onSave: () => Promise<void>;
}

export function ContextualFooterButton({ mode, onSave }: ContextualFooterButtonProps) {
    const [saveState, setSaveState] = useState<SaveState>('idle');

    useEffect(() => {
        if (saveState === 'saved') {
            const timer = setTimeout(() => {
                setSaveState('idle');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [saveState]);

    if (mode === 'hidden' && saveState === 'idle') {
        return null;
    }

    const handleClick = async () => {
        if (mode === 'update') {
            // Save direct (pas de modale)
            setSaveState('saving');
            try {
                await onSave();
                setSaveState('saved');
            } catch (error) {
                setSaveState('idle');
            }
        } else {
            // Mode create : ouvre la modale (géré par le parent)
            onSave();
        }
    };

    const getButtonLabel = () => {
        if (saveState === 'saving') return 'Sauvegarde…';
        if (saveState === 'saved') return 'Sauvegardé';
        return mode === 'create' ? 'Sauvegarder cette liste' : 'Sauvegarder les modifications';
    };

    const getIcon = () => {
        if (saveState === 'saving') {
            return <Loader2 className="w-4 h-4 animate-spin" />;
        }
        if (saveState === 'saved') {
            return <Check className="w-4 h-4" />;
        }
        return <Save className="w-4 h-4" />;
    };

    return (
        <button
            onClick={handleClick}
            disabled={saveState !== 'idle'}
            className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-dm-sans text-[14px] font-semibold transition-all duration-200",
                // Idle State (Default) - Matches "Créer liste des mots ratés"
                saveState === 'idle' && "border-dashed border-[#C4B8FF] bg-[#F8F6FF] text-[#6C5CE7] hover:bg-[#EDEAFF] hover:border-[#6C5CE7]",
                // Saving State
                saveState === 'saving' && "border-solid border-gray-200 bg-[#F8F9FC] text-gray-400 cursor-default",
                // Saved State
                saveState === 'saved' && "border-solid border-[#A7F3D0] bg-[#E8FBF5] text-[#059669] cursor-default"
            )}
        >
            {getIcon()}
            {getButtonLabel()}
        </button>
    );
}
