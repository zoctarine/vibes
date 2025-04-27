export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl?: string;
  technologies: string[];
  category: string;
  featured?: boolean;
}

export type Category = 'All' | 'Frontend' | 'Backend' | 'Full Stack' | 'Mobile' | 'Other';