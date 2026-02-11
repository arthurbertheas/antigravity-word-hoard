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
                "w-full h-[52px] px-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group border-b border-[#F9FAFB] relative",
                isSelected
                    ? "bg-[rgba(108,92,231,0.04)] border-l-[3px] border-l-[#6C5CE7] border-b-transparent"
                    : "hover:bg-[#F8F9FC] border-l-[3px] border-l-transparent"
            )}
        >
            {/* List Info (Main Content) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <h4 className={cn(
                    "text-[14px] font-[700] font-['Sora'] truncate",
                    isSelected ? "text-[#1A1A2E]" : "text-[#374151] group-hover:text-[#1A1A2E]"
                )}>
                    {list.name}
                </h4>

                <div className="flex items-center gap-2 text-[11px] font-[500] font-['DM_Sans'] text-[#9CA3AF]">
                    <span className="shrink-0">
                        {formatDateCompact(list.last_used || list.updated_at || list.created_at)}
                    </span>

                    <div className="w-0.5 h-0.5 rounded-full bg-[#D1D5DB]" />

                    {list.tags && list.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 truncate">
                            {list.tags.slice(0, 2).map(tag => (
                                <span key={tag} className={cn(
                                    "px-[6px] py-[1px] rounded-[6px] text-[10px] font-medium leading-none",
                                    isSelected
                                        ? "bg-[rgba(108,92,231,0.1)] text-[#6C5CE7]"
                                        : "bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[#F0EDFF] group-hover:text-[#7C6FD4]"
                                )}>
                                    {tag}
                                </span>
                            ))}
                            {list.tags.length > 2 && (
                                <span className="text-[10px] text-[#9CA3AF]">+{list.tags.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Counter + Actions */}
            <div className="flex items-center gap-3">
                {/* Word Count Badge */}
                <div className={cn(
                    "w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[12px] font-[700] font-['IBM_Plex_Mono'] transition-colors",
                    isSelected
                        ? "bg-[#6C5CE7] text-white shadow-sm"
                        : "bg-[#F3F4F6] text-[#9CA3AF] group-hover:bg-[#E5E7EB] group-hover:text-[#6B7280]"
                )}>
                    {list.word_count || (list.words?.length || 0)}
                </div>

                {/* Actions Menu */}
                <div className="flex-none text-[#9CA3AF]">
                    <ActionMenu
                        onEdit={() => onEdit(list)}
                        onDelete={() => onDelete(list)}
                    />
                </div>
            </div>
        </div>
    );
}
