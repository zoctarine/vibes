/*
  # Add projects support
  
  1. New Tables
    - projects: Main projects table
    
  2. Changes
    - Add project_id to documents table
    - Update RLS policies
    - Add cascading deletes
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add project_id to documents
ALTER TABLE documents ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project policies
CREATE POLICY "Users can read their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Drop existing document policies
DROP POLICY IF EXISTS "Users can read documents they have permission for" ON documents;
DROP POLICY IF EXISTS "Document owners can insert" ON documents;
DROP POLICY IF EXISTS "Document owners and editors can update" ON documents;
DROP POLICY IF EXISTS "Document owners can delete" ON documents;

-- Create new document policies
CREATE POLICY "Users can read documents they have permission for"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permissions
      WHERE document_id = documents.id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can insert"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners and editors can update"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM permissions
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can delete"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );

-- Function to update project updated_at
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS trigger AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    UPDATE projects
    SET updated_at = NOW()
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_project_timestamp ON documents;

-- Create trigger
CREATE TRIGGER update_project_timestamp
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();