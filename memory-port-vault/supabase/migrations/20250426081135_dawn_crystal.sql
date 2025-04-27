/*
  # Add storage policies for documents

  1. Security
    - Enable RLS for documents storage bucket
    - Add policies for authenticated users to manage their documents
    - Ensure users can only access documents in their own projects
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('documents', 'documents')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for document storage
CREATE POLICY "Users can upload documents to their projects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = split_part(storage.objects.name, '/', 1)::uuid
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in their projects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = split_part(storage.objects.name, '/', 1)::uuid
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents in their projects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = split_part(storage.objects.name, '/', 1)::uuid
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents in their projects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = split_part(storage.objects.name, '/', 1)::uuid
    AND owner_id = auth.uid()
  )
);