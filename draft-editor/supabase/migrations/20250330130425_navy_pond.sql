/*
  # Update schema for email/password authentication

  1. Changes
    - Remove Google OAuth specific fields
    - Add email verification flag
    - Update RLS policies
*/

-- Add email verification status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Update profile trigger to handle email verification
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id,
    name,
    email_verified
  )
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS policies are up to date
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);