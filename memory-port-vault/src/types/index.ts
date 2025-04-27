export interface User {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  documentCount?: number;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content_path?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  content?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  owner_id: string;
  expires_at?: string;
  created_at: string;
  last_used_at?: string;
  revoked: boolean;
}