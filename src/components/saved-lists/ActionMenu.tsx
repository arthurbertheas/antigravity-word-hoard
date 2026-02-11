import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export function ActionMenu({ onEdit, onDelete }: ActionMenuProps) {
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
                    top: rect.bottom + 8,
                    left: rect.right - 140 // Width of menu is 140
                });
            }
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#1A1A2E] transition-all"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999
                    }}
                    className="w-[140px] bg-white rounded-[12px] shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#F3F4F6] p-1.5 animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                            setIsOpen(false);
                        }}
                        className="w-full h-9 px-3 flex items-center gap-2.5 rounded-[8px] text-[13px] font-[600] text-[#4B5563] hover:bg-[#F8F9FC] hover:text-[#1A1A2E] transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                            setIsOpen(false);
                        }}
                        className="w-full h-9 px-3 flex items-center gap-2.5 rounded-[8px] text-[13px] font-[600] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}
