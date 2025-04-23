export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

export interface Permission {
  id: string;
  user_id: string;
  document_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  type: 'folder' | 'document';
  permissions: Permission[];
}