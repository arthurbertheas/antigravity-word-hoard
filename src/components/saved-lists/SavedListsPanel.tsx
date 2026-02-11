import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useSavedListsContext } from '@/contexts/SavedListsContext';
import { CompactSavedListRow } from './CompactSavedListRow';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { SavedList } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SavedListsPanelProps {
  lists: SavedList[];
  currentListId: string | null;
  onBack: () => void;
  onSelectList: (list: SavedList) => void;
  onEditList: (list: SavedList) => void;
  onDeleteList: (list: SavedList) => void;
  onCreateNew: () => void;
  onDeselect?: () => void;
}

export function SavedListsPanel({
  lists,
  currentListId,
  onBack,
  onSelectList,
  onEditList,
  onDeleteList,
  onCreateNew,
  onDeselect
}: SavedListsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLists = lists.filter((list) => {
    const query = searchQuery.toLowerCase();
    const matchesName = list.name.toLowerCase().includes(query);
    const matchesTags = list.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
    return matchesName || matchesTags;
  });

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            <PanelHeader
        title="Mes listes"
        subtitle={`${lists.length} listes sauvegardées`}
        onBack={onBack} />


            <div className="pt-4 pb-0 px-[15px] py-[15px]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 bg-muted/50 border-none h-10 rounded-[12px] bg-[#F8F9FC] text-[14px]" />

                </div>
            </div>

            <div className="h-px bg-[#f0f2f5] mb-4" />

            <div className="px-4 space-y-4 flex-1 overflow-hidden flex flex-col">

                {/* Deselect Option - Only shown if a list is selected */}
                {currentListId && onDeselect &&
        <button
          onClick={onDeselect}
          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#fff8f8] transition-colors border-b border-[#f0f2f5] group">

                        <X className="w-[18px] h-[18px] text-[#8b8fa8] group-hover:text-[#ef4444] transition-colors" />
                        <span className="text-[13px] font-[500] text-[#8b8fa8] group-hover:text-[#ef4444] font-['DM_Sans'] transition-colors">
                            Désélectionner la liste
                        </span>
                    </button>
        }

                <div className="flex-1 overflow-y-auto space-y-0 relative -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 flex flex-col">
                    {searchQuery && filteredLists.length > 0 &&
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-2 border-b border-border">
                            <span className="text-[10px] font-[600] uppercase tracking-wider text-[#9CA3AF] px-2 block">
                                {filteredLists.length} RÉSULTATS
                            </span>
                        </div>
          }

                    {filteredLists.length > 0 ?
          <div className="pb-4 flex flex-col gap-0.5 flex-1">
                            {filteredLists.map((list) =>
            <CompactSavedListRow
              key={list.id}
              list={list}
              isSelected={currentListId === list.id}
              onSelect={onSelectList}
              onEdit={onEditList}
              onDelete={onDeleteList} />

            )}
                        </div> :

          <div className="text-center py-12 text-muted-foreground flex-1">
                            <p className="text-sm font-medium">Aucune liste trouvée</p>
                        </div>
          }

                </div>

            </div>

            {/* Footer Create Button */}
            <div className="flex-none p-4 mt-auto border-t border-slate-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)] z-10">
                <button
          onClick={onCreateNew}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C4B8FF] bg-[#F8F6FF] text-[#6C5CE7] hover:bg-[#F0EDFF] hover:border-[#6C5CE7] hover:shadow-sm transition-all group">

                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    <span className="font-['Sora'] font-[600] text-[15px]">Nouvelle liste</span>
                </button>
            </div>
        </div>);

}