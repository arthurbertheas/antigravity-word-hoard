import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DetachListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    listName: string;
}

export function DetachListModal({ isOpen, onClose, onConfirm, listName }: DetachListModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[380px] p-0 border-none rounded-[22px] overflow-hidden z-[105]"
                style={{
                    animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                <div
                    className="bg-white flex flex-col items-center text-center"
                    style={{ padding: '28px' }}
                >
                    {/* Icône Warning Orange */}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F59E0B',
                        marginBottom: '20px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
                    }}>
                        <AlertTriangle style={{ width: '24px', height: '24px' }} />
                    </div>

                    <h3 style={{
                        fontFamily: 'Sora',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1A1A2E',
                        marginBottom: '8px'
                    }}>
                        Détacher cette liste ?
                    </h3>

                    <p style={{
                        fontFamily: 'DM Sans',
                        fontSize: '14px',
                        color: '#6B7280',
                        lineHeight: '1.5',
                        marginBottom: '32px'
                    }}>
                        "<span style={{ fontWeight: 700, color: '#1A1A2E' }}>{listName}</span>"
                        <br />
                        ne sera plus liée à Ma Liste.
                        <br />
                        Les mots resteront dans votre sélection actuelle.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '12px',
                                border: '1.5px solid #E5E7EB',
                                background: '#fff',
                                color: '#6B7280',
                                fontFamily: 'DM Sans',
                                fontSize: '13px',
                                fontWeight: 600
                            }}
                            className="hover:bg-[#F8F9FC] hover:text-[#1A1A2E]"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={onConfirm}
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '12px',
                                background: '#D97706',
                                color: '#fff',
                                fontFamily: 'DM Sans',
                                fontSize: '13px',
                                fontWeight: 600,
                                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
                                border: 'none'
                            }}
                            className="hover:brightness-110 transition-all hover:-translate-y-px"
                        >
                            Détacher
                        </Button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes modalIn {
                        from {
                            opacity: 0;
                            transform: scale(0.94) translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                `}} />
            </DialogContent>
        </Dialog>
    );
}
