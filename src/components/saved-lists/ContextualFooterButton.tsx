import React, { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';

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

    if (mode === 'hidden') {
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

    const getButtonStyle = () => {
        if (saveState === 'saving') {
            return {
                background: '#F8F9FC',
                border: '1.5px solid #E5E7EB',
                color: '#9CA3AF'
            };
        }
        if (saveState === 'saved') {
            return {
                background: '#E8FBF5',
                border: '1.5px solid #A7F3D0',
                color: '#059669'
            };
        }
        return {
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            color: '#374151'
        };
    };

    const getButtonLabel = () => {
        if (saveState === 'saving') return 'Sauvegarde…';
        if (saveState === 'saved') return 'Sauvegardé';
        return mode === 'create' ? 'Sauvegarder cette liste' : 'Sauvegarder les modifications';
    };

    const getIcon = () => {
        if (saveState === 'saving') {
            return <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 0.6s linear infinite' }} />;
        }
        if (saveState === 'saved') {
            return <Check style={{ width: '14px', height: '14px' }} />;
        }
        return <Save style={{ width: '14px', height: '14px' }} />;
    };

    const buttonStyle = getButtonStyle();

    return (
        <>
            <button
                onClick={handleClick}
                disabled={saveState !== 'idle'}
                style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '11px',
                    ...buttonStyle,
                    fontFamily: 'DM Sans',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: saveState === 'idle' ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                    if (saveState === 'idle') {
                        e.currentTarget.style.background = '#F8F6FF';
                        e.currentTarget.style.borderColor = '#6C5CE7';
                        e.currentTarget.style.color = '#6C5CE7';
                    }
                }}
                onMouseLeave={(e) => {
                    if (saveState === 'idle') {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#374151';
                    }
                }}
            >
                {getIcon()}
                {getButtonLabel()}
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </>
    );
}
