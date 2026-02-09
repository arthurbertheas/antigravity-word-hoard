import { useSavedListsContext } from '@/contexts/SavedListsContext';

/**
 * @deprecated Use useSavedListsContext() directly instead.
 * This hook is kept for backward compatibility and now proxies to SavedListsContext.
 */
export function useSavedLists(_userId?: string | null) {
    const context = useSavedListsContext();

    return {
        savedLists: context.savedLists,
        isLoading: context.isLoading,
        currentListId: context.currentListId,
        isModified: context.isModified,
        setIsModified: context.setIsModified,
        setCurrentListId: context.setCurrentListId,
        loadLists: context.loadLists,
        saveList: context.saveList,
        updateList: context.updateList,
        deleteList: context.deleteList,
        loadList: context.loadList
    };
}
