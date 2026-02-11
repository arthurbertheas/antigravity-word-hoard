import React from 'react';
import { SavedList } from '@/lib/supabase';
import { formatDateCompact } from '@/utils/dateFormatter';
import { cn } from '@/lib/utils';
import { ActionMenu } from './ActionMenu';

interface CompactSavedListRowProps {
    list: SavedList;
    isSelected: boolean;
    onSelect: (list: SavedList) => void;
    onEdit: (list: SavedList) => void;
    onDelete: (list: SavedList) => void;
}

export function CompactSavedListRow({
    list,
    isSelected,
    onSelect,
    onEdit,
    onDelete
}: CompactSavedListRowProps) {
    return (
        <div
            onClick={() => onSelect(list)}
            style={{
                padding: '9px 12px',
                borderRadius: '12px',
                border: isSelected ? '1.5px solid #6C5CE7' : '1px solid transparent',
                background: isSelected ? 'rgba(108, 92, 231, 0.03)' : 'transparent',
                transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            className="w-full cursor-pointer flex items-center justify-between gap-3 group"
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.background = '#F8F9FC';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                }
            }}
        >
            {/* List Info (Main Content) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4
                    className="truncate leading-tight"
                    style={{
                        fontFamily: 'Sora',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isSelected ? '#6C5CE7' : '#1A1A2E',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {list.name}
                </h4>

                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="shrink-0"
                        style={{
                            fontFamily: 'DM Sans',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: '#B0B5C0'
                        }}
                    >
                        {formatDateCompact(list.last_used || list.updated_at || list.created_at)}
                    </span>

                    {/* Séparateur - cercle 3×3px */}
                    <div
                        style={{
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            background: '#D1D5DB'
                        }}
                    />

                    {list.tags && list.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 truncate">
                            {list.tags.slice(0, 2).map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '1px 7px',
                                        borderRadius: '8px',
                                        background: isSelected ? 'rgba(108,92,231,0.08)' : '#F0EDFF',
                                        color: '#7C6FD4',
                                        fontFamily: 'DM Sans',
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        lineHeight: 1
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                            {list.tags.length > 2 && (
                                <span
                                    style={{
                                        fontSize: '10px',
                                        color: '#9CA3AF'
                                    }}
                                >
                                    +{list.tags.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Counter + Actions */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Word Count Badge */}
                <div
                    style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(108,92,231,0.08)' : '#F3F4F6',
                        color: isSelected ? '#6C5CE7' : '#6B7280',
                        fontFamily: 'IBM Plex Mono',
                        fontSize: '11px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease'
                    }}
                >
                    {list.word_count || (list.words?.length || 0)}
                </div>

                {/* Actions Menu */}
                <ActionMenu
                    onEdit={() => onEdit(list)}
                    onDelete={() => onDelete(list)}
                />
            </div>
        </div>
    );
}
