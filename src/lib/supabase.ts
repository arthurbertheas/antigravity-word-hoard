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

// Type pour les paramètres du tachistoscope
export interface TachistoscopeSettings {
    id?: string;
    user_id?: string;
    speed_ms: number;
    gap_ms: number;
    font_size: number;
    font_family: 'arial' | 'verdana' | 'mdi-ecole' | 'sans' | 'serif' | 'mono' | 'opendyslexic';
    highlight_vowels: boolean;
    highlight_silent: boolean;
    spacing_value: number;
    spacing_mode: 'letters' | 'graphemes' | 'syllables';
    display_mode: 'wordOnly' | 'image' | 'imageAndWord' | 'alternateWordFirst' | 'alternateImageFirst';
    show_focus_point: boolean;
    enable_sound: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Load user's tachistoscope settings from Supabase
 * Returns null if user is not authenticated or settings don't exist
 */
export async function loadUserTachistoscopeSettings(): Promise<TachistoscopeSettings | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_tachistoscope_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No settings found - this is normal for new users
                return null;
            }
            console.error('Error loading tachistoscope settings:', error);
            return null;
        }

        // Convert snake_case to camelCase
        return {
            id: data.id,
            user_id: data.user_id,
            speed_ms: data.speed_ms,
            gap_ms: data.gap_ms,
            font_size: data.font_size,
            font_family: data.font_family,
            highlight_vowels: data.highlight_vowels,
            highlight_silent: data.highlight_silent,
            spacing_value: data.spacing_value,
            spacing_mode: data.spacing_mode,
            display_mode: data.display_mode || 'wordOnly',
            show_focus_point: data.show_focus_point,
            enable_sound: data.enable_sound,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    } catch (error) {
        console.error('Error loading tachistoscope settings:', error);
        return null;
    }
}

/**
 * Save user's tachistoscope settings to Supabase
 * Uses upsert to create or update settings
 */
export async function saveUserTachistoscopeSettings(settings: Omit<TachistoscopeSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('Cannot save settings: user not authenticated');
            return false;
        }

        // Convert camelCase to snake_case for database
        const dbSettings = {
            user_id: user.id,
            speed_ms: settings.speed_ms,
            gap_ms: settings.gap_ms,
            font_size: settings.font_size,
            font_family: settings.font_family,
            highlight_vowels: settings.highlight_vowels,
            highlight_silent: settings.highlight_silent,
            spacing_value: settings.spacing_value,
            spacing_mode: settings.spacing_mode,
            display_mode: settings.display_mode,
            show_focus_point: settings.show_focus_point,
            enable_sound: settings.enable_sound,
        };

        const { error } = await supabase
            .from('user_tachistoscope_settings')
            .upsert(dbSettings, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error saving tachistoscope settings:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving tachistoscope settings:', error);
        return false;
    }
}
