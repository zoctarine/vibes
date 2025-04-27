/*
  # Fix Profile Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Add policy for upsert operations
    - Ensure authenticated users can manage their profiles

  2. Security
    - Maintain RLS
    - Restrict access to own profile only
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policies
CREATE POLICY "Users can manage their own profile"
ON profiles
USING (auth.uid() = id);

-- Create insert policy with proper check
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create update policy with proper check
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);