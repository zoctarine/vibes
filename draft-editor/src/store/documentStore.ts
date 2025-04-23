import { create } from 'zustand';
import { Document, Permission } from '../types/auth';
import { supabase } from '../lib/supabase';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  createDocument: (title: string, parentId: string | null, type: 'folder' | 'document') => Promise<void>;
  updateDocument: (id: string, content: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setSelectedDocument: (document: Document | null) => void;
  updatePermissions: (documentId: string, userId: string, role: Permission['role']) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  selectedDocument: null,
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          permissions (
            id,
            user_id,
            role
          )
        `)
        .order('created_at');

      if (error) throw error;

      set({ documents: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createDocument: async (title, parentId, type) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          parent_id: parentId,
          type,
          owner_id: user.user.id,
          content: type === 'document' ? '' : null,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        documents: [...state.documents, { ...data, permissions: [] }],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateDocument: async (id, content) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        documents: state.documents.map(doc =>
          doc.id === id ? { ...doc, content } : doc
        ),
        selectedDocument: state.selectedDocument?.id === id
          ? { ...state.selectedDocument, content }
          : state.selectedDocument,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteDocument: async (id) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setSelectedDocument: (document) => {
    set({ selectedDocument: document });
  },

  updatePermissions: async (documentId, userId, role) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .upsert({
          document_id: documentId,
          user_id: userId,
          role,
        });

      if (error) throw error;

      await get().fetchDocuments();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));