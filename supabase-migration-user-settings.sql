-- Migration: Create user_tachistoscope_settings table
-- Description: Store user-specific default settings for the tachistoscope

-- Create the table
CREATE TABLE IF NOT EXISTS public.user_tachistoscope_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Settings
    speed_ms INTEGER NOT NULL DEFAULT 1000,
    gap_ms INTEGER NOT NULL DEFAULT 500,
    font_size INTEGER NOT NULL DEFAULT 15,
    font_family TEXT NOT NULL DEFAULT 'arial',
    highlight_vowels BOOLEAN NOT NULL DEFAULT false,
    highlight_silent BOOLEAN NOT NULL DEFAULT false,
    spacing_value INTEGER NOT NULL DEFAULT 0,
    spacing_mode TEXT NOT NULL DEFAULT 'letters',
    show_focus_point BOOLEAN NOT NULL DEFAULT true,
    enable_sound BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure one settings row per user
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_tachistoscope_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own settings
CREATE POLICY "Users can read own tachistoscope settings"
    ON public.user_tachistoscope_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own tachistoscope settings"
    ON public.user_tachistoscope_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own tachistoscope settings"
    ON public.user_tachistoscope_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own tachistoscope settings"
    ON public.user_tachistoscope_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER update_user_tachistoscope_settings_updated_at
    BEFORE UPDATE ON public.user_tachistoscope_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_tachistoscope_settings_user_id
    ON public.user_tachistoscope_settings(user_id);
