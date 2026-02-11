import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
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
}

export function SavedListsPanel({
    lists,
    currentListId,
    onBack,
    onSelectList,
    onEditList,
    onDeleteList,
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
            <PanelHeader
                title="Mes listes"
                subtitle={`${lists.length} listes sauvegardées`}
                onBack={onBack}
            />

            <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une liste..."
                        className="pl-9 bg-muted/50 border-none"
                    />
                </div>

                <button
                    onClick={onCreateNew}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Créer une nouvelle liste</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-0 relative -mx-4 px-4">
                    {searchQuery && (
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-2 border-b border-border">
                            <span className="text-[10px] font-[600] uppercase tracking-wider text-[#9CA3AF] px-2 block">
                                {filteredLists.length} RÉSULTATS
                            </span>
                        </div>
                    )}

                    {filteredLists.length > 0 ? (
                        <div className="pb-4">
                            {filteredLists.map((list) => (
                                <CompactSavedListRow
                                    key={list.id}
                                    list={list}
                                    isSelected={currentListId === list.id}
                                    onSelect={onSelectList}
                                    onEdit={onEditList}
                                    onDelete={onDeleteList}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Aucune liste trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
