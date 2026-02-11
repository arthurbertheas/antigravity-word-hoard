import React from 'react';
import { Folder, Edit2, X } from 'lucide-react';
import { SavedList } from '@/lib/supabase';

interface LoadedListBlockProps {
    list: SavedList;
    onEdit: () => void;
    onDetach: () => void;
}

export function LoadedListBlock({ list, onEdit, onDetach }: LoadedListBlockProps) {
    return (
        <div
            style={{
                padding: '9px 11px',
                borderRadius: '11px',
                border: '1px solid #E5E7EB',
                background: '#F8F9FC',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            {/* Icône dossier */}
            <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Folder style={{ width: '16px', height: '16px', color: '#6B7280' }} />
            </div>

            {/* Nom et tags */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: 'Sora',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {list.name}
                </div>

                {list.tags && list.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {list.tags.map(tag => (
                            <span
                                key={tag}
                                style={{
                                    padding: '1px 6px',
                                    borderRadius: '7px',
                                    background: '#EEEDF5',
                                    color: '#6B7280',
                                    fontFamily: 'DM Sans',
                                    fontSize: '10px',
                                    fontWeight: 500
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Boutons actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {/* Bouton Modifier */}
                <button
                    onClick={onEdit}
                    style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#B0B5C0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F0EDFF';
                        e.currentTarget.style.color = '#6C5CE7';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#B0B5C0';
                    }}
                >
                    <Edit2 style={{ width: '14px', height: '14px' }} />
                </button>

                {/* Bouton Détacher */}
                <button
                    onClick={onDetach}
                    style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#B0B5C0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#B0B5C0';
                    }}
                >
                    <X style={{ width: '14px', height: '14px' }} />
                </button>
            </div>
        </div>
    );
}
