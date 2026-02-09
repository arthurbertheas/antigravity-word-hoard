import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, SavedList } from '@/lib/supabase';
import { Word } from '@/types/word';
import { useToast } from '@/hooks/use-toast';

interface SavedListsContextType {
    savedLists: SavedList[];
    isLoading: boolean;
    currentListId: string | null;
    isModified: boolean;
    userId: string | null;
    setIsModified: (val: boolean) => void;
    setCurrentListId: (id: string | null) => void;
    loadLists: () => Promise<void>;
    saveList: (name: string, description: string, words: Word[], tags: string[]) => Promise<string | null>;
    updateList: (listId: string, name: string, description: string, words: Word[], tags: string[]) => Promise<boolean>;
    deleteList: (listId: string) => Promise<boolean>;
    loadList: (listId: string) => Promise<Word[] | null>;
}

const SavedListsContext = createContext<SavedListsContextType | undefined>(undefined);

export function SavedListsProvider({ children }: { children: React.ReactNode }) {
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentListId, setCurrentListId] = useState<string | null>(null);
    const [isModified, setIsModified] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const { toast } = useToast();

    // Memberstack User Detection
    useEffect(() => {
        const getMemberstackUser = async () => {
            try {
                // @ts-ignore
                const member = await window.$memberstackDOM?.getCurrentMember();
                if (member?.data?.auth?.email) {
                    setUserId(member.data.auth.email);
                } else {
                    setUserId('test-user@example.com');
                }
            } catch (error) {
                setUserId('test-user@example.com');
            }
        };
        getMemberstackUser();
    }, []);

    const loadLists = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_word_lists')
                .select('*')
                .eq('user_id', userId)
                .order('last_used', { ascending: false });

            if (error) throw error;
            setSavedLists(data || []);
        } catch (error) {
            console.error('Error loading lists:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadLists();
        }
    }, [userId, loadLists]);

    const saveList = async (name: string, description: string, words: Word[], tags: string[]) => {
        if (!userId) return null;
        try {
            const listData = {
                user_id: userId,
                name,
                description: description || null,
                words,
                word_count: words.length,
                tags: tags.length > 0 ? tags : null,
                last_used: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('user_word_lists')
                .insert([listData])
                .select()
                .single();

            if (error) throw error;

            await loadLists();
            setCurrentListId(data.id);
            setIsModified(false);

            toast({
                title: 'Liste sauvegardée',
                description: `"${name}" a été ajoutée à vos listes`
            });

            return data.id;
        } catch (error) {
            console.error('Error saving list:', error);
            toast({ title: 'Erreur', description: 'Impossible de sauvegarder la liste', variant: 'destructive' });
            return null;
        }
    };

    const updateList = async (listId: string, name: string, description: string, words: Word[], tags: string[]) => {
        try {
            const { error } = await supabase
                .from('user_word_lists')
                .update({
                    name,
                    description: description || null,
                    words,
                    word_count: words.length,
                    tags: tags.length > 0 ? tags : null,
                    last_used: new Date().toISOString()
                })
                .eq('id', listId);

            if (error) throw error;
            await loadLists();
            setIsModified(false);
            toast({ title: 'Liste mise à jour', description: `"${name}" a été modifiée` });
            return true;
        } catch (error) {
            console.error('Error updating list:', error);
            toast({ title: 'Erreur', description: 'Impossible de mettre à jour la liste', variant: 'destructive' });
            return false;
        }
    };

    const deleteList = async (listId: string) => {
        try {
            const { error } = await supabase.from('user_word_lists').delete().eq('id', listId);
            if (error) throw error;
            if (currentListId === listId) setCurrentListId(null);
            await loadLists();
            toast({ title: 'Liste supprimée', description: 'La liste a été supprimée' });
            return true;
        } catch (error) {
            console.error('Error deleting list:', error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer la liste', variant: 'destructive' });
            return false;
        }
    };

    const loadList = async (listId: string) => {
        try {
            const { data, error } = await supabase.from('user_word_lists').select('*').eq('id', listId).single();
            if (error) throw error;
            await supabase.from('user_word_lists').update({ last_used: new Date().toISOString() }).eq('id', listId);
            setCurrentListId(listId);
            setIsModified(false);
            toast({ title: 'Liste chargée', description: `"${data.name}" (${data.word_count} mots)` });
            return data.words as Word[];
        } catch (error) {
            console.error('Error loading list:', error);
            toast({ title: 'Erreur', description: 'Impossible de charger la liste', variant: 'destructive' });
            return null;
        }
    };

    return (
        <SavedListsContext.Provider value={{
            savedLists, isLoading, currentListId, isModified, userId,
            setIsModified, setCurrentListId, loadLists, saveList, updateList, deleteList, loadList
        }}>
            {children}
        </SavedListsContext.Provider>
    );
}

export function useSavedListsContext() {
    const context = useContext(SavedListsContext);
    if (context === undefined) {
        throw new Error('useSavedListsContext must be used within a SavedListsProvider');
    }
    return context;
}
