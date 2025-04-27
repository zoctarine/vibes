/*
  # Fix API Keys RLS Policies

  1. Changes
    - Add RLS policies for API keys table to allow users to:
      - Create their own API keys
      - View their own API keys
      - Update their own API keys
      - Delete their own API keys

  2. Security
    - Enable RLS on api_keys table
    - Add policies for all CRUD operations
    - Ensure users can only access their own API keys
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'api_keys' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
  DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
END $$;

-- Create policies
CREATE POLICY "Users can create their own API keys"
ON api_keys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own API keys"
ON api_keys
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own API keys"
ON api_keys
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own API keys"
ON api_keys
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);