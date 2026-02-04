import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SavedList } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { SaveListModal } from '@/components/saved-lists/SaveListModal';

interface SavedListsDropdownProps {
    lists: SavedList[];
    currentListId: string | null;
    onLoadList: (listId: string) => void;
    onEditList: (listId: string) => void;
    onDeleteList: (listId: string) => void;
    onCreateNew: () => void;
}

export function SavedListsDropdown({
    lists,
    currentListId,
    onLoadList,
    onEditList,
    onDeleteList,
    onCreateNew
}: SavedListsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const currentList = lists.find(l => l.id === currentListId);

    const filteredLists = lists.filter(list =>
        list.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg hover:border-primary/30 hover:bg-muted transition-all flex items-center justify-between group"
            >
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    📁 {currentList ? currentList.name : 'Mes listes sauvegardées'}
                </span>
                <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                value = { searchQuery }
                                    onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
        </div>
                        </div >

        {/* Lists */ }
        < div className = "flex-1 overflow-y-auto p-2" >
        {
            filteredLists.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                    {searchQuery ? 'Aucune liste trouvée' : 'Aucune liste sauvegardée'}
                </div>
            ) : (
                filteredLists.map(list => (
                    <div
                        key={list.id}
                        className={cn(
                            "group p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 flex items-start justify-between gap-2",
                            list.id === currentListId && "bg-primary/5 border border-primary/20"
                        )}
                        onClick={() => {
                            onLoadList(list.id);
                            setIsOpen(false);
                        }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                                {list.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    {list.word_count} mots
                                </span>
                                {list.created_at && (
                                    <>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(list.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </>
                                )}
                            </div>
                            {list.tags && list.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {list.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditList(list.id);
                                    setIsOpen(false);
                                }}
                                className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                title="Éditer"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Supprimer cette liste ?')) {
                                        onDeleteList(list.id);
                                    }
                                    setIsOpen(false);
                                }}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))
            )
        }
                        </div >

        {/* Footer */ }
        < div className = "p-3 border-t border-border" >
            <Button
                variant="outline"
                className="w-full justify-start text-primary hover:bg-primary/5 border-dashed"
                onClick={() => {
                    onCreateNew();
                    setIsOpen(false);
                }}
            >
                + Créer une nouvelle liste
            </Button>
                        </div >
                    </div >
                </>
            )
}
        </div >
    );
}
