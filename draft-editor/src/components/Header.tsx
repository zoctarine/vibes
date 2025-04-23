import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ChevronLeft, FileText, Sun, Moon, LogOut, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useTreeContext } from '../context/TreeContext';
import { ProfileSettings } from './ProfileSettings';

export const Header: React.FC = () => {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuthStore();
  const treeContext = selectedProject ? useTreeContext() : null;
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handlePreview = () => {
    if (treeContext) {
      const previewContent = treeContext.compilePreview();
      treeContext.selectItem({
        id: 'preview',
        title: 'Preview',
        content: previewContent,
        type: 'preview',
        parentId: null,
        orderIndex: -1,
        children: [],
        isVisible: true,
      });
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedProject ? (
            <button
              onClick={() => setSelectedProject(null)}
              className="mr-4 hover:bg-muted p-2 rounded-md transition-colors flex items-center gap-2"
              title="Back to projects"
            >
              <ChevronLeft size={20} />
              <span>Projects</span>
            </button>
          ) : (
            <>
              <FileText size={24} className="text-primary" />
              <h1 className="text-xl font-semibold">Draft Editor</h1>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {selectedProject && (
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
              title="Preview story"
            >
              <Eye size={18} />
              <span className="text-sm">Preview</span>
            </button>
          )}
          {user && (
            <button
              onClick={() => setShowProfileSettings(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              {user.name || user.email}
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {user && (
            <button
              onClick={signOut}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} />
      )}
    </header>
  );
};