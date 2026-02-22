import { useState, useEffect } from "react";
import { useSelection, getWordId } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { ListChecks, ChevronsRight, X, Trash2, ChevronsLeft, Save, Folder, Play, FileDown, ImageIcon } from "lucide-react";
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
import { ExportPanel } from '@/components/export/ExportPanel';

export function SelectionTray({ onOpenImagier }: { onOpenImagier: () => void }) {
  const { selectedWords, clearSelection, removeItem, setIsFocusModeOpen, addItems } = useSelection();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('maListe_collapsed');
    if (saved !== null) return saved === 'true';
    return window.innerWidth <= 1440;
  });
  const [activeView, setActiveView] = useState<'main' | 'saved-lists'>('main');
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Saved Lists Context
  const {
    savedLists,
    currentListId,
    isModified,
    setIsModified,
    setCurrentListId,
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
  const hasChanges = currentListId && (
  originalWords.length !== selectedWords.length ||
  !originalWords.every((w, i) => w.MOTS === selectedWords[i]?.MOTS));


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

  // Handler pour désélectionner directement (sans modal)
  const handleDirectDeselect = () => {
    clearSelection();
    setOriginalWords([]);
    setCurrentListId(null); // Clear the selected list from context
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
      const currentList = savedLists.find((l) => l.id === currentListId);
      if (currentList) {
        await updateList(currentListId, currentList.name, currentList.description, selectedWords, currentList.tags);
        setOriginalWords([...selectedWords]); // Update tracking
      }
    }
  };

  return (
    <>
      <aside className={cn(
      "shrink-0 bg-card/10 flex flex-col h-full border-l border-[rgb(var(--filter-border))] transition-width-smooth overflow-hidden relative",
      isCollapsed ? "w-[64px]" : "w-80"
    )}>
      {/* Collapsed State View ... same as before ... */}
      {isCollapsed &&
      <div className="flex flex-col items-center py-4 gap-4 h-full animate-in fade-in duration-300">
          <button
          onClick={togglePanel}
          className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] flex-shrink-0"
          title="Ouvrir Ma Liste">

            <ChevronsLeft className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-[12px] bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7]">
              <ListChecks className="w-5 h-5" />
            </div>

            {selectedWords.length > 0 &&
          <div className="min-w-[24px] h-6 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-bold font-['IBM_Plex_Mono'] flex items-center justify-center px-1.5 shadow-sm">
                {selectedWords.length}
              </div>
          }
          </div>

          <div className="flex-1" />

          <button
          onClick={() => setIsFocusModeOpen(true)}
          disabled={selectedWords.length === 0}
          className="w-11 h-11 rounded-[14px] bg-[#6C5CE7] text-white flex items-center justify-center shadow-[0_3px_12px_rgba(108,92,231,0.35)] transition-all hover:bg-[#5A4BD1] hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(108,92,231,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#6C5CE7] disabled:hover:translate-y-0 mb-2"
          title="Lancer la sélection">

            <Play className="w-[18px] h-[18px]" fill="currentColor" />
          </button>
        </div>
      }

      {/* Expanded State View */}
      {!isCollapsed &&
      <>
          <div className="border-b border-[#E5E7EB] relative z-40">
            <PanelHeader
            title="Ma sélection"
            subtitle="Liste et actions"
            icon={<ListChecks className="w-4 h-4 text-[rgb(var(--filter-accent))]" />}
            onForward={undefined}
            hideBorder={true}
            action={
            <div className="flex items-center gap-3">
                  <button
                onClick={togglePanel}
                className="flex-none w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] group"
                title="Réduire (C)">

                    <ChevronsRight className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
                  </button>
                </div>
            } />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col py-0">
            <div className="flex-none px-4 pt-3 pb-1.5">
              <UnifiedListSelector
              selectedList={currentListId ? savedLists.find((l) => l.id === currentListId) || null : null}
              onOpenListView={() => setActiveView('saved-lists')}
              onDeselect={handleDirectDeselect} />
            </div>

            <div className="flex-none px-4 pt-2 pb-3 border-b border-slate-50 bg-gradient-to-b from-white to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-black text-foreground">
                  {selectedWords.length} <span className="text-sm font-medium text-muted-foreground">mots</span>
                </div>
                {selectedWords.length > 0 && (
                  showClearConfirm ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 rounded-full border border-[#E5E7EB] text-[11px] font-semibold text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-[#F9FAFB] transition-all">
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          clearSelection();
                          setShowClearConfirm(false);
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#EF4444] text-[11px] font-semibold text-white hover:bg-[#DC2626] transition-all">
                        Confirmer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleClearRequest}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E7EB] text-[11px] font-semibold text-[#9CA3AF] hover:border-[#FCA5A5] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all group">
                      <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      Vider
                    </button>
                  )
                )}
              </div>

              <div className="space-y-2">
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
                ).map(([cat, count]) =>
                <span key={cat} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-bold text-muted-foreground">
                      {count} {cat}
                    </span>
                )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-card/5">
              {selectedWords.length === 0 ?
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ListChecks className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground italic max-w-[150px]">
                    Cliquez sur un mot pour l'ajouter à votre liste.
                  </p>
                </div> :

            <div className="space-y-2">
                  {selectedWords.map((word) => {
                // Check if word is new (Ticket 2)
                const isNewWord = currentListId && originalWords.length > 0 &&
                !originalWords.some((w) => w.MOTS === word.MOTS);

                return (
                  <div
                    key={getWordId(word)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-[10px] border transition-all hover:shadow-md",
                      isNewWord
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border bg-card"
                    )}>

                        {/* Word info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-foreground truncate">
                              {word.MOTS}
                            </span>
                            {isNewWord && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wide">
                                Ajouté
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">{word.SYNT}</span>
                            {word.NBSYLL && (
                              <>
                                <span className="text-[10px] text-muted-foreground/40">·</span>
                                <span className="text-[10px] text-muted-foreground">{word.NBSYLL} syll.</span>
                              </>
                            )}
                            {word["image associée"]?.trim() && (
                              <>
                                <span className="text-[10px] text-muted-foreground/40">·</span>
                                <ImageIcon className="w-2.5 h-2.5 text-muted-foreground" />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(getWordId(word))}
                          className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          title="Supprimer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>);

              })}
                </div>
            }
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
              }} />

              <Button
                className="w-full flex items-center justify-center gap-2 h-[48px] rounded-xl border-2 border-[#6C5CE7] text-[#6C5CE7] bg-white font-semibold text-sm hover:bg-[#F7F6FE] transition-all"
                onClick={() => setShowExportPanel(true)}
                disabled={selectedWords.length === 0}
              >
                <FileDown className="w-4 h-4" />
                Exporter la liste
              </Button>

              <Button
                className="w-full flex items-center justify-center gap-2 h-[48px] rounded-xl border-2 border-[#6C5CE7] text-[#6C5CE7] bg-white font-semibold text-sm hover:bg-[#F7F6FE] transition-all"
                onClick={onOpenImagier}
                disabled={selectedWords.length === 0 || !selectedWords.some(w => w["image associée"]?.trim())}
              >
                <ImageIcon className="w-4 h-4" />
                Créer un imagier
              </Button>

              <Button
              className="w-full flex items-center justify-center gap-3 h-[52px] rounded-xl bg-[rgb(var(--filter-accent))] text-white font-sora font-bold text-base shadow-[0_4px_12px_rgba(var(--filter-accent),0.25)] hover:shadow-[0_6px_20px_rgba(var(--filter-accent),0.35)] hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => setIsFocusModeOpen(true)}
              disabled={selectedWords.length === 0}>

                <Play fill="white" className="w-5 h-5" />
                Lancer le diaporama
              </Button>
            </div>
          </div>
        </>
      }

      {/* Saved Lists Panel Overlay */}
      {!isCollapsed && activeView === 'saved-lists' &&
      <div className="absolute inset-x-0 bottom-0 top-[69px] z-30">
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
          }} />

        </div>
      }

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
          name: savedLists.find((l) => l.id === editingListId)?.name || '',
          description: savedLists.find((l) => l.id === editingListId)?.description || '',
          tags: savedLists.find((l) => l.id === editingListId)?.tags || [],
          words: savedLists.find((l) => l.id === editingListId)?.words || []
        } : undefined}
        mode={editingListId ? 'edit' : 'create'}
        existingLists={savedLists.map((l) => ({ id: l.id, name: l.name }))}
        currentListId={editingListId} />


      {/* Delete Confirmation Modal */}
      <DeleteListModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        listName={listToDelete?.name || ''} />


      {/* Detach List Modal (Ticket 2) */}
      <DetachListModal
        isOpen={showDetachModal}
        onClose={() => setShowDetachModal(false)}
        onConfirm={handleConfirmDetach}
        listName={currentListId ? savedLists.find((l) => l.id === currentListId)?.name || '' : ''} />

    </aside>

      {/* Export Modal */}
      {showExportPanel && (
        <ExportPanel
          selectedWords={selectedWords}
          onClose={() => setShowExportPanel(false)}
        />
      )}
    </>
  );

}