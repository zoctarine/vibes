/*
  # Add writing language to profiles

  1. Changes
    - Add writing_language column to profiles table
    - Set default language to English
*/

-- Add writing_language column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS writing_language text DEFAULT 'en';

-- Update existing profiles to have default language
UPDATE profiles SET writing_language = 'en' WHERE writing_language IS NULL;