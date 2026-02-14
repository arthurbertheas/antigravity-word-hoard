-- Migration: Add display_mode column to user_tachistoscope_settings table
-- Date: 2026-02-14

-- Add display_mode column with default value 'wordOnly'
ALTER TABLE user_tachistoscope_settings
ADD COLUMN IF NOT EXISTS display_mode text DEFAULT 'wordOnly'
CHECK (display_mode IN ('wordOnly', 'image', 'imageAndWord'));

-- Update existing rows to have the default value
UPDATE user_tachistoscope_settings
SET display_mode = 'wordOnly'
WHERE display_mode IS NULL;
