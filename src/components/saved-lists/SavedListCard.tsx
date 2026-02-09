import React from 'react';
import { SavedList } from '@/lib/supabase';
import { formatDateTimeSmart } from '@/utils/dateFormatter';
import { cn } from '@/lib/utils';

interface SavedListCardProps {
    list: SavedList;
    isSelected: boolean;
    onSelect: (list: SavedList) => void;
}

export function SavedListCard({ list, isSelected, onSelect }: SavedListCardProps) {
    // Extract words for preview
    const wordPreview = list.words
        ? list.words.slice(0, 3).map(w => w.MOTS).join(', ')
        : '';
    const hasMoreWords = list.words && list.words.length > 3;

    return (
        <button
            onClick={() => onSelect(list)}
            className={cn(
                "w-full text-left p-3.5 rounded-[14px] border transition-all duration-200 flex flex-col gap-2 group",
                isSelected
                    ? "border-[#6C5CE7] bg-[rgba(108,92,231,0.04)] ring-[0.5px] ring-[#6C5CE7]/50"
                    : "border-[#E5E7EB] bg-white hover:border-[#C4B8FF] hover:bg-[#FAFAFE]"
            )}
        >
            {/* Top row: name + count */}
            <div className="flex justify-between items-start gap-3 w-full">
                <span
                    className={cn(
                        "font-sora text-[14px] font-[600] leading-[1.3] flex-1 break-words",
                        isSelected ? "text-[#6C5CE7]" : "text-[#1A1A2E]"
                    )}
                >
                    {list.name}
                </span>
                <span
                    className={cn(
                        "font-['IBM_Plex_Mono'] text-[11px] font-[600] px-2 py-0.5 rounded-[6px] whitespace-nowrap transition-colors",
                        isSelected
                            ? "bg-[rgba(108,92,231,0.1)] text-[#6C5CE7]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                    )}
                >
                    {list.word_count} mots
                </span>
            </div>

            {/* Date */}
            <span className="text-[12px] text-[#9CA3AF] font-['DM_Sans']">
                {formatDateTimeSmart(list.last_used || list.created_at)}
            </span>

            {/* Tags */}
            {list.tags && list.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {list.tags.map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                "px-[9px] py-[2px] rounded-[10px] text-[11px] font-[500] font-['DM_Sans'] transition-colors",
                                isSelected
                                    ? "bg-[rgba(108,92,231,0.08)] text-[#6C5CE7]"
                                    : "bg-[#F0EDFF] text-[#7C6FD4]"
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Word preview */}
            {wordPreview && (
                <div
                    className="text-[12px] text-[#9CA3AF] font-['DM_Sans'] italic leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap w-full"
                >
                    {wordPreview}{hasMoreWords ? '...' : ''}
                </div>
            )}
        </button>
    );
}
