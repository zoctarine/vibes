/*
  # Fix recursive document policies

  1. Changes
    - Remove recursive document policies
    - Simplify document access control
    - Fix permissions hierarchy
*/

-- Drop existing document policies
DROP POLICY IF EXISTS "Users can read documents they have permission for" ON documents;
DROP POLICY IF EXISTS "Document owners can insert" ON documents;
DROP POLICY IF EXISTS "Document owners and editors can update" ON documents;
DROP POLICY IF EXISTS "Document owners can delete" ON documents;

-- Create new, non-recursive document policies
CREATE POLICY "Users can read project documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = documents.project_id
      AND owner_id = auth.uid()
    )
  );