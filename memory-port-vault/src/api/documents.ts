import { supabase } from '../supabase/supabase';
import { Document } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getDocuments = async (projectId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getDocument = async (id: string): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Fetch document content if content_path exists
  if (data.content_path) {
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('documents')
      .download(data.content_path);

    if (fileError) {
      console.error('Error downloading document content:', fileError);
    } else {
      data.content = await fileData.text();
    }
  }

  return data;
};

export const createDocument = async (
  document: Partial<Document>,
  content?: string
): Promise<Document> => {
  let contentPath = null;

  // Upload content to storage if provided
  if (content) {
    const fileName = `${uuidv4()}.md`;
    const filePath = `${document.project_id}/${fileName}`;
    
    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, new Blob([content], { type: 'text/markdown' }));

    if (uploadError) {
      throw new Error(`Error uploading document: ${uploadError.message}`);
    }

    contentPath = filePath;
  }

  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...document, content_path: contentPath }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { ...data, content };
};

export const updateDocument = async (
  id: string,
  document: Partial<Document>,
  content?: string
): Promise<Document> => {
  const { data: existingDoc, error: fetchError } = await supabase
    .from('documents')
    .select('content_path, project_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  let contentPath = existingDoc.content_path;

  // Update content in storage if provided
  if (content !== undefined) {
    if (contentPath) {
      // Update existing file
      const { error: uploadError } = await supabase
        .storage
        .from('documents')
        .update(contentPath, new Blob([content], { type: 'text/markdown' }));

      if (uploadError) {
        throw new Error(`Error updating document content: ${uploadError.message}`);
      }
    } else {
      // Create new file
      const fileName = `${uuidv4()}.md`;
      contentPath = `${existingDoc.project_id}/${fileName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(contentPath, new Blob([content], { type: 'text/markdown' }));

      if (uploadError) {
        throw new Error(`Error uploading document content: ${uploadError.message}`);
      }
    }
  }

  const { data, error } = await supabase
    .from('documents')
    .update({ ...document, content_path: contentPath })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { ...data, content };
};

export const deleteDocument = async (id: string): Promise<void> => {
  // Get the document to delete its content file
  const { data, error: fetchError } = await supabase
    .from('documents')
    .select('content_path')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Delete the document from the database
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  // Delete the content file if it exists
  if (data.content_path) {
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([data.content_path]);

    if (storageError) {
      console.error('Error deleting document file:', storageError);
    }
  }
};

export const searchDocuments = async (
  projectId: string,
  query: string,
  tags?: string[]
): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data.filter(doc => {
    const matchesQuery = !query || 
      doc.title.toLowerCase().includes(query.toLowerCase());
    
    const matchesTags = !tags?.length || 
      tags.every(tag => doc.tags?.includes(tag));
    
    return matchesQuery && matchesTags;
  });
};