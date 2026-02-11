import React from 'react';
import { Folder, X, ChevronRight } from 'lucide-react';
import { SavedList } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface UnifiedListSelectorProps {
    selectedList: SavedList | null;
    onOpenListView: () => void;
    onDeselect: () => void;
}

export function UnifiedListSelector({
    selectedList,
    onOpenListView,
    onDeselect
}: UnifiedListSelectorProps) {
    const hasSelection = !!selectedList;

    return (
        <div
            className={cn(
                "border rounded-xl overflow-hidden transition-all",
                hasSelection
                    ? "border-[#6366f1] bg-gradient-to-br from-[#fafaff] to-[#f8f8ff]"
                    : "border-[#E5E7EB] bg-white hover:border-[#d0d4e0]"
            )}
        >
            <div
                className="flex items-center px-3.5 py-3 cursor-pointer transition-colors hover:bg-[rgba(99,102,241,0.04)]"
                onClick={onOpenListView}
            >
                {/* Icon Box */}
                <div
                    className={cn(
                        "w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mr-3 transition-colors",
                        hasSelection
                            ? "bg-gradient-to-br from-[#6366f1] to-[#818cf8]"
                            : "bg-[#F0F1F8]"
                    )}
                >
                    <Folder
                        className={cn(
                            "w-[18px] h-[18px]",
                            hasSelection ? "text-white" : "text-[#8b8fa8]"
                        )}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {hasSelection ? (
                        <>
                            <div className="font-['Sora'] text-[14px] font-[600] text-[#1A1A2E] truncate">
                                {selectedList.name}
                            </div>
                            {selectedList.tags && selectedList.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {selectedList.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="text-[10px] font-[500] px-2 py-0.5 bg-[#eef0ff] text-[#6366f1] rounded-full font-['DM_Sans']"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="text-[11px] font-[500] text-[#8b8fa8] uppercase tracking-[0.3px] mb-0.5 font-['DM_Sans']">
                                Liste de travail
                            </div>
                            <div className="font-['Sora'] text-[14px] font-[600] text-[#1A1A2E]">
                                Aucune liste
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {hasSelection && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeselect();
                            }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[#8b8fa8] hover:bg-[#fff0f0] hover:text-[#ef4444] transition-colors"
                            title="Désélectionner"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[#8b8fa8] hover:bg-[#f0f1f8] hover:text-[#6366f1] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenListView();
                        }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
