import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';
import { Header } from './components/Header/Header';
import { DebugPanel } from './components/DebugPanel';
import { SplashScreen } from './components/SplashScreen';
import { StoryLibrary } from './components/StoryLibrary';
import { StoryView } from './components/StoryView';
import { StorySetup } from './components/StorySetup';
import { useStoryManager } from './hooks/useStoryManager';
import { generateRandomSettings } from './utils/storyUtils';

function App() {
  const navigate = useNavigate();
  const [isDark, toggleDark] = useToggle(window.matchMedia('(prefers-color-scheme: light)').matches);
  const hasAcceptedDisclaimer = localStorage.getItem('hasAcceptedDisclaimer') === 'true';

  const storyManager = useStoryManager();

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDark]);

  if (!hasAcceptedDisclaimer) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
        <SplashScreen 
          onComplete={() => {
            localStorage.setItem('hasAcceptedDisclaimer', 'true');
            navigate('/library');
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
      <Header
        storyState={storyManager.storyState}
        isDark={isDark}
        onToggleDark={toggleDark}
        onRegenerateChoices={storyManager.regenerateChoices}
        setStoryState={storyManager.setStoryState}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route 
            path="/library" 
            element={<StoryLibrary storyManager={storyManager} />} 
          />
          <Route
            path="/story/new"
            element={<StorySetup
              className="max-w-4xl mx-auto p-4 sm:p-6"
              initialSettings={generateRandomSettings()}
              onCancel={() => navigate('/library')}
              onComplete={async (settings) => {
                const state = await storyManager.startStory(settings);
                navigate(`/story/${state.id}`);
              }}
            />}
          />
          <Route 
            path="/story/:id?" 
            element={<StoryView storyManager={storyManager} />} 
          />
        </Routes>
      </main>

      <DebugPanel storyState={storyManager.storyState} />
    </div>
  );
}

export default App;