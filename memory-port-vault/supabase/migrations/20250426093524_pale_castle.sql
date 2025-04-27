/*
  # Fix profiles table RLS policies

  1. Security Changes
    - Add RLS policy for users to create their own profile
    - Add RLS policy for users to update their own profile
    - Add RLS policy for users to read their own profile

  Note: This migration adds the missing RLS policies that were causing 403 and 406 errors
  when users tried to create or update their profiles.
*/

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;

-- Create policy for inserting new profiles
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create policy for updating existing profiles
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy for reading profiles
CREATE POLICY "Users can read their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);