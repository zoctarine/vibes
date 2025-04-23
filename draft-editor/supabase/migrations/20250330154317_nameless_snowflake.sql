/*
  # Final fix for document policies and performance optimization

  1. Changes
    - Simplify document policies further
    - Add indexes for better query performance
    - Remove any potential for recursion
*/

-- Drop existing document policies
DROP POLICY IF EXISTS "Users can read project documents" ON documents;
DROP POLICY IF EXISTS "Project owners can insert documents" ON documents;
DROP POLICY IF EXISTS "Project owners can update documents" ON documents;
DROP POLICY IF EXISTS "Project owners can delete documents" ON documents;

-- Add index for project_id to improve performance
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Create simplified document policies
CREATE POLICY "project_owner_select"
  ON documents FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  ));

CREATE POLICY "project_owner_insert"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  ));

CREATE POLICY "project_owner_update"
  ON documents FOR UPDATE
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  ));

CREATE POLICY "project_owner_delete"
  ON documents FOR DELETE
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  ));

-- Add index for parent_id to improve hierarchical queries
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_documents_project_parent ON documents(project_id, parent_id);