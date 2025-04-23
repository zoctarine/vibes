import React from 'react';
import { ArrowLeft, Cog, Book } from 'lucide-react';
import { HeaderActions } from './HeaderActions';
import { SavedStory, StoryState, StorySettings } from '../../types/story';
import { handleShowSummary } from '../../utils/summaryUtils';
import { SummaryModal } from '../SummaryModal';
import { StorySettingsModal } from '../StorySettingsModal';
import { updateStory, getStory } from '../../services/storyLibrary';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  storyState: StoryState;
  isDark: boolean;
  onToggleDark: () => void;
  onRegenerateChoices: () => void;
  setStoryState: (state: StoryState) => void;
}

export function Header({
  storyState,
  isDark,
  onToggleDark,
  onRegenerateChoices,
  setStoryState,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStoryOpen = location.pathname.startsWith('/story/') && location.pathname !== '/story/new';
  const isNewStory = location.pathname === '/story/new';
  const isLibrary = location.pathname === '/library';
  const isRoot = location.pathname === '/';
  const [summaryModalOpen, setSummaryModalOpen] = React.useState(false);
  const [currentSummary, setCurrentSummary] = React.useState<string | null>(
    null
  );
  const [isLoadingSummary, setIsLoadingSummary] = React.useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

  const handleShowSummaryClick = async () => {
    setSummaryModalOpen(true);
    await handleShowSummary(
      storyState,
      setIsLoadingSummary,
      setCurrentSummary,
      setStoryState
    );
  };

  const handleSaveSettings = (settings: StorySettings) => {
    if (storyState.id) {
      const oldSettings = storyState.settings;
      const updatedSettings = {
        ...settings,
        language: oldSettings?.language || 'en'
      };

      // Generate settings change text by comparing old and new settings
      const changes: string[] = [];

      if (oldSettings?.genre !== updatedSettings.genre) {
        changes.push(`Genre(${oldSettings?.genre}->${updatedSettings.genre})`);
      }
      if (oldSettings?.perspective !== updatedSettings.perspective) {
        changes.push(
          `Perspective(${oldSettings?.perspective}->${updatedSettings.perspective})`
        );
      }
      if (oldSettings?.protagonistGender !== updatedSettings.protagonistGender) {
        changes.push(
          `Protagonist(${oldSettings?.protagonistGender}->${updatedSettings.protagonistGender})`
        );
      }
      if (oldSettings?.styleInspiration !== updatedSettings.styleInspiration) {
        changes.push(
          `Style(${oldSettings?.styleInspiration || 'none'}->${updatedSettings.styleInspiration || 'none'})`
        );
      }

      // Only add settings change text if there were actual changes
      const settingsChangeText =
        changes.length > 0
          ? `\n\n\`\`\`\nSettings Changed: ${changes.join(', ')}\n\`\`\`\n\n`
          : '';

      // Update the current segment's content with the settings change text
      const currentSegment = storyState.currentSegment;
      if (currentSegment && settingsChangeText) {
        currentSegment.content += settingsChangeText;
      }

      const updatedState = {
        ...storyState,
        currentSegment,
        settings: updatedSettings
      };

      // Update local state first
      setStoryState(updatedState);

      const success = updateStory(storyState.id, updatedState);

      if (success) {
        window.dispatchEvent(
          new CustomEvent('storiesUpdated', {
            detail: { storyId: storyState.id },
          })
        );

        // Regenerate choices with new settings
        if (onRegenerateChoices) {
          onRegenerateChoices();
        }
      }
    }
    setSettingsModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#252526] shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isRoot && (
              <button
                onClick={() => {
                  if (isLibrary){
                       localStorage.setItem('hasAcceptedDisclaimer', 'false');
                       navigate('/');
                  } else {
                    navigate('/library')
                  }
                }}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="h-8 w-8 text-story-600 dark:text-story-400" />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#cccccc]">
              {isStoryOpen ? (
                storyState.title?.replace(/_/g, ' ').trim()
              ) : isNewStory ? (
                'Create an Infinite Adventure'
              ) : isLibrary ? (
                'Story O\'Matic Infinite Adventures'
              ) : isRoot ? (
                'Story O\'Matic Infinite Adventures'
              ) : (
                'Story O\'Matic Infinite Adventures'
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
          
            <HeaderActions
              storyState={storyState}
              isDark={isDark}
              onToggleDark={onToggleDark}
              onShowSummary={handleShowSummaryClick}
              onEditSettings={() => setSettingsModalOpen(true)}
              onRegenerateChoices={onRegenerateChoices}
              setStoryState={setStoryState}
            />
          </div>
        </div>
      </div>
      <SummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={currentSummary}
        isLoading={isLoadingSummary}
      />
      {storyState.settings && (
        <StorySettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onSave={handleSaveSettings}
          initialSettings={storyState.settings}
        />
      )}
    </header>
  );
}