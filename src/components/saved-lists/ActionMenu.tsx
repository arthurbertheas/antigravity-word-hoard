import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Edit2, Trash2, FileText, File, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SavedList } from '@/lib/supabase';
import { exportToPdf, exportToWord, printList } from '@/utils/exportUtils';

interface ActionMenuProps {
    list: SavedList;
    onEdit: () => void;
    onDelete: () => void;
}

export function ActionMenu({ list, onEdit, onDelete }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
                setCoords({
                    top: rect.bottom + 4,
                    left: rect.right - 170 // Width exact: 170px
                });
            }
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const MenuItem = ({ icon: Icon, label, onClick, color = '#374151', bgHover = '#F8F9FC', iconBg = '#F0EDFF', iconColor = '#6C5CE7' }: any) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleAction(onClick);
            }}
            style={{
                width: '100%',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'background 0.1s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = bgHover;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
                flexShrink: 0
            }}>
                <Icon style={{ width: '14px', height: '14px' }} />
            </div>
            <span style={{
                fontFamily: 'DM Sans',
                fontSize: '13px',
                fontWeight: 500,
                color: color
            }}>
                {label}
            </span>
        </button>
    );

    return (
        <>
            <button
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    isOpen && "opacity-100"
                )}
                style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '7px',
                    border: 'none',
                    background: isOpen ? '#F0EDFF' : 'transparent',
                    color: isOpen ? '#6C5CE7' : '#C4C4C4',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = '#F3F4F6';
                        e.currentTarget.style.color = '#9CA3AF';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#C4C4C4';
                    }
                }}
            >
                <MoreHorizontal style={{ width: '14px', height: '14px' }} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999,
                        width: '170px',
                        background: 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '14px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 10px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset',
                        animation: 'menuPop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '4px 0'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem
                        icon={Edit2}
                        label="Modifier"
                        onClick={onEdit}
                    />

                    <MenuItem
                        icon={FileText}
                        label="Exporter PDF"
                        onClick={() => exportToPdf(list)}
                        iconBg="#FFF7ED"
                        iconColor="#EA580C"
                    />

                    <MenuItem
                        icon={File}
                        label="Exporter Word"
                        onClick={() => exportToWord(list)}
                        iconBg="#EBF5FF"
                        iconColor="#2563EB"
                    />

                    <MenuItem
                        icon={Printer}
                        label="Imprimer"
                        onClick={() => printList(list)}
                        iconBg="#F0FDF4"
                        iconColor="#16A34A"
                    />

                    <MenuItem
                        icon={Trash2}
                        label="Supprimer"
                        onClick={onDelete}
                        color="#EF4444"
                        bgHover="#FEF2F2"
                        iconBg="#FEE2E2"
                        iconColor="#EF4444"
                    />

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes menuPop {
                            from {
                                opacity: 0;
                                transform: scale(0.92) translateY(-4px);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                        }
                    `}} />
                </div>,
                document.body
            )}
        </>
    );
}
