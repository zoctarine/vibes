import React, { useEffect } from 'react';
import { TreeProvider } from './context/TreeContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/templates/MainLayout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import { SplashScreen } from './components/SplashScreen';
import { ProjectList } from './components/ProjectList';
import { ProjectView } from './components/ProjectView';

function App() {
  const { user, loading, checkAuth } = useAuthStore();
  const { selectedProject } = useProjectStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SplashScreen />
      {selectedProject ? (
        <TreeProvider>
          <ProjectView />
        </TreeProvider>
      ) : (
        <MainLayout>
          <ProjectList />
        </MainLayout>
      )}
    </ThemeProvider>
  );
}

export default App;