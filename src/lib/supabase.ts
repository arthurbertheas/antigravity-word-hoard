import { createClient } from '@supabase/supabase-js';
import { Word } from '@/types/word';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wxttgpfipcksseykzeyy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type pour les listes sauvegardées
export interface SavedList {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    words: Word[];
    word_count: number;
    tags?: string[];
    created_at: string;
    updated_at: string;
    last_used: string;
}
