/*
  # Set up document storage and policies

  1. Storage
    - Create documents bucket
    - Set up storage policies for authenticated users
  
  2. Security
    - Enable RLS on documents table
    - Add policies for CRUD operations
    - Ensure proper cascading delete
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'documents', 'documents'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'documents'
);

-- Set up storage policies
DO $$
BEGIN
  -- Clean up any existing policies
  DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (EXISTS (
      SELECT 1 FROM documents
      WHERE content_path = name
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = documents.project_id
        AND projects.owner_id = auth.uid()
      )
    ))
  );

  CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents' AND
    (EXISTS (
      SELECT 1 FROM documents
      WHERE content_path = name
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = documents.project_id
        AND projects.owner_id = auth.uid()
      )
    ))
  );

  CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents' AND
    (EXISTS (
      SELECT 1 FROM documents
      WHERE content_path = name
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = documents.project_id
        AND projects.owner_id = auth.uid()
      )
    ))
  );

  CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents' AND
    (EXISTS (
      SELECT 1 FROM documents
      WHERE content_path = name
      AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = documents.project_id
        AND projects.owner_id = auth.uid()
      )
    ))
  );
END $$;

-- Enable RLS on documents table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'documents' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing document policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create documents in their projects" ON documents;
  DROP POLICY IF EXISTS "Users can view documents in their projects" ON documents;
  DROP POLICY IF EXISTS "Users can update documents in their projects" ON documents;
  DROP POLICY IF EXISTS "Users can delete documents in their projects" ON documents;
END $$;

-- Create document policies
CREATE POLICY "Users can create documents in their projects"
ON documents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents in their projects"
ON documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in their projects"
ON documents FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents in their projects"
ON documents FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.owner_id = auth.uid()
  )
);