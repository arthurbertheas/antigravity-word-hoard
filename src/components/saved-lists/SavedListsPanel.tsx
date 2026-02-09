import React, { useState } from 'react';
import { ChevronLeft, Search, Folder, Plus } from 'lucide-react';
import { SavedList } from '@/lib/supabase';
import { SavedListCard } from './SavedListCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SavedListsPanelProps {
    lists: SavedList[];
    currentListId: string | null;
    onBack: () => void;
    onSelectList: (list: SavedList) => void;
    onCreateNew: () => void;
}

export function SavedListsPanel({
    lists,
    currentListId,
    onBack,
    onSelectList,
    onCreateNew
}: SavedListsPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLists = lists.filter(list => {
        const query = searchQuery.toLowerCase();
        const matchesName = list.name.toLowerCase().includes(query);
        const matchesTags = list.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        return matchesName || matchesTags;
    });

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex-none p-[18px_20px_14px]">
                <div className="flex items-center gap-[10px] mb-1">
                    <button
                        onClick={onBack}
                        className="w-[34px] h-[34px] rounded-[10px] border border-[#E5E7EB] bg-white cursor-pointer flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:text-[#6C5CE7]"
                        aria-label="Retour"
                    >
                        <ChevronLeft className="w-[18px] h-[18px]" />
                    </button>
                    <div>
                        <h2 className="font-sora text-[17px] font-[700] text-[#1A1A2E] leading-tight">
                            Mes listes
                        </h2>
                        <p className="font-['DM_Sans'] text-[12px] text-[#9CA3AF] mt-0.5">
                            {lists.length} listes sauvegardées
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex-none px-4 pb-3">
                <div className="flex items-center gap-2 p-[9px_14px] rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] transition-all group-within:border-[#6C5CE7]">
                    <Search className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                        type="text"
                        placeholder="Rechercher une liste..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none outline-none bg-transparent text-[13px] text-[#1A1A2E] font-['DM_Sans'] flex-1 placeholder:text-[#B0B5C0]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
                {filteredLists.length > 0 ? (
                    filteredLists.map((list) => (
                        <SavedListCard
                            key={list.id}
                            list={list}
                            isSelected={list.id === currentListId}
                            onSelect={onSelectList}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        {searchQuery ? (
                            <p className="font-['DM_Sans'] text-[13px] text-[#9CA3AF]">
                                Aucune liste trouvée
                            </p>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-[14px] bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-4">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <h3 className="font-['DM_Sans'] text-[14px] font-[600] text-[#1A1A2E] mb-1">
                                    Aucune liste sauvegardée
                                </h3>
                                <p className="font-['DM_Sans'] text-[12px] text-[#9CA3AF] leading-relaxed">
                                    Créez votre première liste<br />depuis la sélection de mots
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="flex-none p-[12px_16px_18px] bg-white border-t border-[#F3F4F6]">
                <button
                    onClick={onCreateNew}
                    className="w-full p-[11px_16px] rounded-[12px] border-[2px] border-dashed border-[#C4B8FF] bg-[#F8F6FF] text-[#6C5CE7] font-['DM_Sans'] text-[13px] font-[600] cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#EDEAFF] hover:border-[#6C5CE7]"
                >
                    <Plus className="w-4 h-4" />
                    Créer une nouvelle liste
                </button>
            </div>
        </div>
    );
}
