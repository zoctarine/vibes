import React, { useState } from 'react';
import { Book, AlertTriangle, FileText, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { StoryState } from '../../types/story';
import { ThemeToggle } from './ThemeToggle';
import { DisclaimerModal } from '../DisclaimerModal';
import { Button } from '../common/Button';

interface HeaderActionsProps {
  storyState: StoryState;
  isDark: boolean;
  onToggleDark: () => void;
  onShowLibrary: () => void;
  onNewCustomStory: () => void;
  onShowSummary: () => void;
  onEditSettings: () => void;
  onNewRandomStory: () => void;
}

export function HeaderActions({
  storyState,
  isDark,
  onToggleDark,
  onShowLibrary,
  onNewCustomStory,
  onShowSummary,
  onEditSettings,
  onNewRandomStory
}: HeaderActionsProps) {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const location = useLocation();
  const isLibrary = location.pathname === '/library';
  const isRoot = location.pathname === '/';
  const isStoryOpen = location.pathname.startsWith('/story/') && location.pathname !== '/story/new';

  const handleContinue = () => {
    if (typeof onNewRandomStory === 'function') {
      onNewRandomStory();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isStoryOpen && storyState.currentSegment && (
        <div className="flex items-center gap-2">
          <Button
            onClick={onEditSettings}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#404040] transition-colors duration-200"
            aria-label="Edit story settings"
          >
            <Settings className="h-5 w-5 text-story-600 dark:text-story-400" />
          </Button>
          <Button
            onClick={onShowSummary}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#404040] transition-colors duration-200"
            aria-label="Show story summary"
          >
            <FileText className="h-5 w-5 text-story-600 dark:text-story-400" />
          </Button>
          <Button
            onClick={onShowLibrary}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#404040] transition-colors duration-200"
            aria-label="View library"
          >
            <Book className="h-5 w-5 text-story-600 dark:text-story-400" />
          </Button>
        </div>
      )}
      {!isRoot && !isLibrary && (
        <div className="flex items-center gap-2">
          <Button
            title="Disclaimer"
            onClick={() => setIsDisclaimerOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#404040] transition-colors duration-200"
            aria-label="Show disclaimer"
          >
            <AlertTriangle className="h-5 w-5 text-story-600 dark:text-story-400" />
          </Button>
        </div>
      )}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        onContinue={handleContinue}
      />
      <ThemeToggle isDark={isDark} onToggle={onToggleDark} />
    </div>
  );
}