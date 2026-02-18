import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, SavedList } from '@/lib/supabase';
import { Word } from '@/types/word';
import { useToast } from '@/hooks/use-toast';
import { normalizeWords } from '@/utils/word-normalization';

interface SavedListsContextType {
    savedLists: SavedList[];
    isLoading: boolean;
    currentListId: string | null;
    isModified: boolean;
    userId: string | null;
    setIsModified: (val: boolean) => void;
    setCurrentListId: (id: string | null) => void;
    loadLists: () => Promise<void>;
    saveList: (name: string, description: string | undefined, words: Word[], tags: string[] | undefined) => Promise<string | null>;
    updateList: (listId: string, name: string, description: string | undefined, words: Word[], tags: string[] | undefined) => Promise<boolean>;
    deleteList: (listId: string) => Promise<boolean>;
    loadList: (listId: string) => Promise<Word[] | null>;
}

const SavedListsContext = createContext<SavedListsContextType | undefined>(undefined);

export function SavedListsProvider({ children }: { children: React.ReactNode }) {
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentListId, setCurrentListId] = useState<string | null>(() => {
        return localStorage.getItem('wordHoard_currentListId') || null;
    });
    const [isModified, setIsModified] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const { toast } = useToast();

    // Supabase Auth User Detection
    useEffect(() => {
        const getSupabaseUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                } else {
                    setUserId(null);
                }
            } catch (error) {
                console.error('Error getting Supabase user:', error);
                setUserId(null);
            }
        };
        getSupabaseUser();

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
        });

        return () => subscription.unsubscribe();
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

            // Normalize words for all lists (Ticket 3 - Fix legacy data)
            const normalizedLists = data?.map(list => ({
                ...list,
                words: normalizeWords(list.words || [])
            })) || [];

            setSavedLists(normalizedLists);
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

    // Persist currentListId to localStorage
    useEffect(() => {
        if (currentListId) {
            localStorage.setItem('wordHoard_currentListId', currentListId);
        } else {
            localStorage.removeItem('wordHoard_currentListId');
        }
    }, [currentListId]);

    const saveList = async (name: string, description: string | undefined, words: Word[], tags: string[] | undefined) => {
        if (!userId) return null;
        try {
            const listData = {
                user_id: userId,
                name,
                description: description || null,
                words,
                word_count: words.length,
                tags: tags && tags.length > 0 ? tags : null,
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

    const updateList = async (listId: string, name: string, description: string | undefined, words: Word[], tags: string[] | undefined) => {
        try {
            const { error } = await supabase
                .from('user_word_lists')
                .update({
                    name,
                    description: description || null,
                    words,
                    word_count: words.length,
                    tags: tags && tags.length > 0 ? tags : null,
                    last_used: new Date().toISOString()
                })
                .eq('id', listId);

            if (error) throw error;
            await loadLists();
            setIsModified(false);
            toast({ title: 'Liste mise à jour', description: `"${name}" a été modifiée` });
            return true;
        } catch (error: any) {
            console.error('Error updating list:', error);
            const msg = error?.message || error?.details || 'Impossible de mettre à jour la liste';
            toast({ title: 'Erreur', description: msg, variant: 'destructive' });
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
            return normalizeWords(data.words);
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
