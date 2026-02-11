import React from 'react';
import { Clock, Tag } from 'lucide-react';
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
            className={cn(
                "w-full h-[52px] px-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 group border-b border-[#F9FAFB]",
                isSelected
                    ? "bg-[rgba(108,92,231,0.04)] border-l-[3px] border-l-[#6C5CE7] border-b-transparent"
                    : "hover:bg-[#F8F9FC] border-l-[3px] border-l-transparent"
            )}
        >
            {/* Word Count Badge */}
            <div className={cn(
                "flex-none w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[13px] font-[700] font-['IBM_Plex_Mono'] shadow-sm",
                isSelected
                    ? "bg-[#6C5CE7] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[#E0E7FF] group-hover:text-[#6C5CE7]"
            )}>
                {list.word_count || (list.words?.length || 0)}
            </div>

            {/* List Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className={cn(
                    "text-[14px] font-[700] font-['Sora'] truncate mb-0.5",
                    isSelected ? "text-[#1A1A2E]" : "text-[#374151] group-hover:text-[#1A1A2E]"
                )}>
                    {list.name}
                </h4>

                <div className="flex items-center gap-2 text-[11px] font-[500] font-['DM_Sans'] text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateCompact(list.last_used || list.updated_at || list.created_at)}
                    </div>
                    {list.tags && list.tags.length > 0 && (
                        <>
                            <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                            <div className="flex items-center gap-1 truncate">
                                <Tag className="w-3 h-3" />
                                {list.tags.slice(0, 2).join(', ')}
                                {list.tags.length > 2 && ` +${list.tags.length - 2}`}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionMenu
                    onEdit={() => onEdit(list)}
                    onDelete={() => onDelete(list)}
                />
            </div>
        </div>
    );
}
