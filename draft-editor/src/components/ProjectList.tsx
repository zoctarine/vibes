import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Plus, Trash2, FileText, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';

const ProjectThumbnail: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div 
      className="w-full h-full bg-muted flex items-center justify-center p-8"
    >
      <div className="flex items-center gap-2 text-4xl text-primary/50">
        <Hash />
        <FileText />
      </div>
    </div>
  );
};

export const ProjectList: React.FC = () => {
  const { projects, loading, error, fetchProjects, createProject, deleteProject, setSelectedProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const project = await createProject(newProjectTitle.trim(), newProjectDescription.trim());
    if (project) {
      setIsCreating(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      setSelectedProject(project);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(projectId);
    }
  };

  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Project Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Enter project title"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectTitle.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all hover:shadow-lg cursor-pointer"
          >
            <div className="aspect-video bg-muted flex items-center justify-center">
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProjectThumbnail title={project.title} />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold truncate">{project.title}</h2>
                <button
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all"
                  title="Delete project"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {project.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>
                  Last modified {format(new Date(project.updated_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};