export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}