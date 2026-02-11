import { useState, useEffect } from "react";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { ListChecks, ChevronRight, X, Trash2, ChevronLeft, Save, Folder, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedListsContext } from "@/contexts/SavedListsContext";
import { SaveListModal } from "@/components/saved-lists/SaveListModal";
import { SavedListsPanel } from "@/components/saved-lists/SavedListsPanel";
import { DeleteListModal } from "@/components/saved-lists/DeleteListModal";
import { LoadedListBlock } from "@/components/saved-lists/LoadedListBlock";
import { UnifiedListSelector } from "@/components/saved-lists/UnifiedListSelector";
import { DetachListModal } from "@/components/saved-lists/DetachListModal";
import { ContextualFooterButton } from "@/components/saved-lists/ContextualFooterButton";
import { SavedList } from "@/lib/supabase";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Word } from "@/types/word";

export function SelectionTray() {
    const { selectedWords, clearSelection, removeItem, setIsFocusModeOpen, addItems } = useSelection();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('maListe_collapsed');
        if (saved !== null) return saved === 'true';
        return window.innerWidth <= 1440;
    });
    const [activeView, setActiveView] = useState<'main' | 'saved-lists'>('main');

    // Saved Lists Context
    const {
        savedLists,
        currentListId,
        isModified,
        setIsModified,
        saveList,
        updateList,
        deleteList,
        loadList
    } = useSavedListsContext();

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetachModal, setShowDetachModal] = useState(false);
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [listToDelete, setListToDelete] = useState<SavedList | null>(null);

    // Track original words for modification detection (Ticket 2)
    const [originalWords, setOriginalWords] = useState<Word[]>([]);

    useEffect(() => {
        localStorage.setItem('maListe_collapsed', String(isCollapsed));
    }, [isCollapsed]);

    // Detect modifications (Ticket 2)
    const hasChanges = currentListId && originalWords.length > 0 && (
        originalWords.length !== selectedWords.length ||
        !originalWords.every((w, i) => w.MOTS === selectedWords[i]?.MOTS)
    );

    const togglePanel = () => setIsCollapsed(!isCollapsed);

    // Stats calculation
    const totalSyllables = selectedWords.reduce((acc, word) => acc + Number(word.NBSYLL || 0), 0);
    const avgSyllables = selectedWords.length > 0 ? (totalSyllables / selectedWords.length).toFixed(1) : 0;

    const handleClearRequest = () => {
        if (selectedWords.length > 5) {
            setShowClearConfirm(true);
        } else {
            clearSelection();
        }
    };

    // Handler pour charger une liste
    const handleLoadList = async (listId: string) => {
        const words = await loadList(listId);
        if (words) {
            clearSelection();
            addItems(words);
            setOriginalWords(words); // Track original words
            setActiveView('main'); // Always go back to main view after loading
        }
    };

    // Handler for selecting from panel
    const handleSelectFromPanel = (list: SavedList) => {
        handleLoadList(list.id);
    };

    // Handler pour ouvrir l'édition
    const handleEditList = (list: SavedList) => {
        setEditingListId(list.id);
        setShowSaveModal(true);
    };

    // Handler pour ouvrir la suppression
    const handleDeleteList = (list: SavedList) => {
        setListToDelete(list);
        setShowDeleteModal(true);
    };

    // Handler pour confirmer la suppression
    const handleConfirmDelete = async () => {
        if (listToDelete) {
            const success = await deleteList(listToDelete.id);
            if (success) {
                if (currentListId === listToDelete.id) {
                    clearSelection();
                }
                setShowDeleteModal(false);
                setListToDelete(null);
            }
        }
    };

    // Handler pour sauvegarder
    const handleSaveList = async (name: string, description: string, tags: string[], words: Word[], saveAsNew?: boolean) => {
        if (editingListId && !saveAsNew) {
            const success = await updateList(editingListId, name, description, words, tags);
            if (success && currentListId === editingListId) {
                // If we are editing the currently loaded list, update selection
                clearSelection();
                addItems(words);
                setOriginalWords(words); // Update tracking (Fix Ticket 3)
            }
        } else {
            await saveList(name, description, words, tags);
        }
        setEditingListId(null);
    };

    // Handler pour détacher la liste (Ticket 2)
    const handleDetachList = () => {
        setShowDetachModal(true);
    };

    // Handler pour confirmer le détachement
    const handleConfirmDetach = () => {
        setOriginalWords([]);
        // Le currentListId sera géré par le context
        setShowDetachModal(false);
    };

    // Handler pour save direct (Ticket 2 - État 4)
    const handleDirectSave = async () => {
        if (currentListId) {
            const currentList = savedLists.find(l => l.id === currentListId);
            if (currentList) {
                await updateList(currentListId, currentList.name, currentList.description, selectedWords, currentList.tags);
                setOriginalWords([...selectedWords]); // Update tracking
            }
        }
    };

    return (
        <aside className={cn(
            "shrink-0 bg-card/10 flex flex-col h-full border-l border-[rgb(var(--filter-border))] transition-width-smooth overflow-hidden relative",
            isCollapsed ? "w-[64px]" : "w-80"
        )}>
            {/* Collapsed State View ... same as before ... */}
            {isCollapsed && (
                <div className="flex flex-col items-center py-4 gap-4 h-full animate-in fade-in duration-300">
                    <button
                        onClick={togglePanel}
                        className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] flex-shrink-0"
                        title="Ouvrir Ma Liste"
                    >
                        <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
                    </button>

                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-[12px] bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7]">
                            <ListChecks className="w-5 h-5" />
                        </div>

                        {selectedWords.length > 0 && (
                            <div className="min-w-[24px] h-6 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-bold font-['IBM_Plex_Mono'] flex items-center justify-center px-1.5 shadow-sm">
                                {selectedWords.length}
                            </div>
                        )}
                    </div>

                    <div className="flex-1" />

                    <button
                        onClick={() => setIsFocusModeOpen(true)}
                        disabled={selectedWords.length === 0}
                        className="w-11 h-11 rounded-[14px] bg-[#6C5CE7] text-white flex items-center justify-center shadow-[0_3px_12px_rgba(108,92,231,0.35)] transition-all hover:bg-[#5A4BD1] hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(108,92,231,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#6C5CE7] disabled:hover:translate-y-0 mb-2"
                        title="Lancer la sélection"
                    >
                        <Play className="w-[18px] h-[18px]" fill="currentColor" />
                    </button>
                </div>
            )}

            {/* Expanded State View */}
            {!isCollapsed && (
                <>
                    <PanelHeader
                        title="Ma Liste"
                        subtitle="Liste et actions"
                        icon={<ListChecks className="w-4 h-4 text-[rgb(var(--filter-accent))]" />}
                        onForward={undefined}
                        action={
                            <div className="flex items-center gap-3">
                                {selectedWords.length > 0 && (
                                    <div className="flex items-center gap-2 mr-2">
                                        {showClearConfirm ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <button
                                                    onClick={() => setShowClearConfirm(false)}
                                                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        clearSelection();
                                                        setShowClearConfirm(false);
                                                    }}
                                                    className="text-[10px] font-bold text-destructive hover:underline"
                                                >
                                                    Confirmer
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleClearRequest}
                                                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 group"
                                            >
                                                <Trash2 className="w-3 group-hover:scale-110 transition-transform" />
                                                Vider
                                            </button>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={togglePanel}
                                    className="flex-none w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] group"
                                    title="Réduire (C)"
                                >
                                    <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
                                </button>
                            </div>
                        }
                    />

                    <div className="flex-1 overflow-hidden flex flex-col pt-3">
                        <div className="flex-none px-4 py-2">
                            <UnifiedListSelector
                                selectedList={currentListId ? savedLists.find(l => l.id === currentListId) || null : null}
                                onOpenListView={() => setActiveView('saved-lists')}
                                onDeselect={handleDetachList}
                            />
                        </div>


                        <div className="flex-none p-4 border-b border-slate-50 bg-gradient-to-b from-white to-transparent">
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-2xl font-black text-foreground">
                                    {selectedWords.length} <span className="text-sm font-medium text-muted-foreground">mots</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                                    <div className="flex items-center gap-1">
                                        <span className="text-primary">{totalSyllables}</span> Syllabes
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <div className="flex items-center gap-1">
                                        Moy. <span className="text-primary">{selectedWords.length > 0 ? avgSyllables : 'ØØ'}</span>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex flex-wrap gap-1 transition-all duration-300",
                                    selectedWords.length === 0 && "opacity-0"
                                )}>
                                    {Object.entries(
                                        selectedWords.reduce((acc, word) => {
                                            const cat = word.SYNT || 'AUTRE';
                                            acc[cat] = (acc[cat] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([cat, count]) => (
                                        <span key={cat} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-bold text-muted-foreground">
                                            {count} {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-card/5">
                            {selectedWords.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <ListChecks className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground italic max-w-[150px]">
                                        Cliquez sur un mot pour l'ajouter à votre liste.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedWords.map((word) => {
                                        // Check if word is new (Ticket 2)
                                        const isNewWord = currentListId && originalWords.length > 0 &&
                                            !originalWords.some(w => w.MOTS === word.MOTS);

                                        return (
                                            <div
                                                key={getWordId(word)}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: isNewWord ? '1px solid #E0DAFB' : '1px solid #F3F4F6',
                                                    background: isNewWord ? 'rgba(108,92,231,0.04)' : '#fff',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                className="group hover:shadow-md"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                    <span style={{
                                                        fontFamily: 'DM Sans',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        color: '#1A1A2E'
                                                    }}>
                                                        {word.MOTS}
                                                    </span>

                                                    {/* Badge AJOUTÉ (Ticket 2) */}
                                                    {isNewWord && (
                                                        <span style={{
                                                            padding: '1px 5px',
                                                            borderRadius: '5px',
                                                            background: '#F0EDFF',
                                                            color: '#6C5CE7',
                                                            fontSize: '8px',
                                                            fontWeight: 700,
                                                            letterSpacing: '0.02em',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            AJOUTÉ
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => removeItem(getWordId(word))}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Supprimer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex-none p-4 mt-auto border-t border-slate-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)] space-y-2">
                            {/* Contextual Footer Button (Ticket 2 - 4 états) */}
                            <ContextualFooterButton
                                mode={
                                    selectedWords.length === 0 ? 'hidden' :
                                        hasChanges ? 'update' :
                                            !currentListId ? 'create' :
                                                'hidden'
                                }
                                onSave={async () => {
                                    if (hasChanges) {
                                        await handleDirectSave();
                                    } else {
                                        setEditingListId(null);
                                        setShowSaveModal(true);
                                    }
                                }}
                            />

                            <Button
                                className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl bg-[rgb(var(--filter-accent))] text-white font-sora font-bold text-base shadow-[0_4px_12px_rgba(var(--filter-accent),0.25)] hover:shadow-[0_6px_20px_rgba(var(--filter-accent),0.35)] hover:-translate-y-0.5 transition-all duration-300"
                                onClick={() => setIsFocusModeOpen(true)}
                                disabled={selectedWords.length === 0}
                            >
                                <Play fill="white" className="w-5 h-5" />
                                Lancer la sélection
                                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Saved Lists Panel Overlay */}
            {!isCollapsed && activeView === 'saved-lists' && (
                <div className="absolute inset-x-0 bottom-0 top-[80px] z-30">
                    <SavedListsPanel
                        lists={savedLists}
                        currentListId={currentListId}
                        onBack={() => setActiveView('main')}
                        onSelectList={handleSelectFromPanel}
                        onEditList={handleEditList}
                        onDeleteList={handleDeleteList}
                        onCreateNew={() => {
                            setEditingListId(null);
                            setShowSaveModal(true);
                        }}
                        onDeselect={() => {
                            setActiveView('main');
                            handleDetachList();
                        }}
                    />
                </div>
            )}

            {/* Save List Modal */}
            <SaveListModal
                isOpen={showSaveModal}
                onClose={() => {
                    setShowSaveModal(false);
                    setEditingListId(null);
                }}
                onSave={handleSaveList}
                words={selectedWords}
                initialData={editingListId ? {
                    name: savedLists.find(l => l.id === editingListId)?.name || '',
                    description: savedLists.find(l => l.id === editingListId)?.description || '',
                    tags: savedLists.find(l => l.id === editingListId)?.tags || [],
                    words: savedLists.find(l => l.id === editingListId)?.words || []
                } : undefined}
                mode={editingListId ? 'edit' : 'create'}
                existingLists={savedLists.map(l => ({ id: l.id, name: l.name }))}
                currentListId={editingListId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteListModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                listName={listToDelete?.name || ''}
            />

            {/* Detach List Modal (Ticket 2) */}
            <DetachListModal
                isOpen={showDetachModal}
                onClose={() => setShowDetachModal(false)}
                onConfirm={handleConfirmDetach}
                listName={currentListId ? savedLists.find(l => l.id === currentListId)?.name || '' : ''}
            />

        </aside>
    );
}
