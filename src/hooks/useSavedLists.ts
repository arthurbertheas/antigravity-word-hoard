import { useState, useEffect } from 'react';
import { supabase, SavedList } from '@/lib/supabase';
import { Word } from '@/types/word';
import { useToast } from '@/hooks/use-toast';

export function useSavedLists(userId: string | null) {
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentListId, setCurrentListId] = useState<string | null>(null);
    const [isModified, setIsModified] = useState(false);
    const { toast } = useToast();

    // Charger les listes au montage
    useEffect(() => {
        if (userId) {
            loadLists();
        }
    }, [userId]);

    // Charger toutes les listes de l'utilisateur
    const loadLists = async () => {
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
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les listes',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Sauvegarder une nouvelle liste
    const saveList = async (
        name: string,
        description: string,
        words: Word[],
        tags: string[]
    ): Promise<string | null> => {
        if (!userId) return null;

        try {
            const listData = {
                user_id: userId,
                name,
                description: description || null,
                words: words,
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
            toast({
                title: 'Erreur',
                description: 'Impossible de sauvegarder la liste',
                variant: 'destructive'
            });
            return null;
        }
    };

    // Mettre à jour une liste existante
    const updateList = async (
        listId: string,
        name: string,
        description: string,
        words: Word[],
        tags: string[]
    ): Promise<boolean> => {
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

            toast({
                title: 'Liste mise à jour',
                description: `"${name}" a été modifiée`
            });

            return true;
        } catch (error) {
            console.error('Error updating list:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de mettre à jour la liste',
                variant: 'destructive'
            });
            return false;
        }
    };

    // Supprimer une liste
    const deleteList = async (listId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('user_word_lists')
                .delete()
                .eq('id', listId);

            if (error) throw error;

            if (currentListId === listId) {
                setCurrentListId(null);
            }

            await loadLists();

            toast({
                title: 'Liste supprimée',
                description: 'La liste a été supprimée'
            });

            return true;
        } catch (error) {
            console.error('Error deleting list:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer la liste',
                variant: 'destructive'
            });
            return false;
        }
    };

    // Charger une liste spécifique
    const loadList = async (listId: string): Promise<Word[] | null> => {
        try {
            const { data, error } = await supabase
                .from('user_word_lists')
                .select('*')
                .eq('id', listId)
                .single();

            if (error) throw error;

            // Mettre à jour last_used
            await supabase
                .from('user_word_lists')
                .update({ last_used: new Date().toISOString() })
                .eq('id', listId);

            setCurrentListId(listId);
            setIsModified(false);

            toast({
                title: 'Liste chargée',
                description: `"${data.name}" (${data.word_count} mots)`
            });

            return data.words;
        } catch (error) {
            console.error('Error loading list:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger la liste',
                variant: 'destructive'
            });
            return null;
        }
    };

    return {
        savedLists,
        isLoading,
        currentListId,
        isModified,
        setIsModified,
        setCurrentListId,
        loadLists,
        saveList,
        updateList,
        deleteList,
        loadList
    };
}
