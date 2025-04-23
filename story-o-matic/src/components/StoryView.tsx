import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StoryContainer } from './StoryContainer';
import { ChoiceButtons } from './ChoiceButtons';
import { ErrorDisplay } from './ErrorDisplay';
import { StorySetup } from './StorySetup';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { generateRandomSettings } from '../utils/storyUtils';
import { getStory } from '../services/storyLibrary';

export function StoryView({ storyManager }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { storyState, setStoryState, startStory, handleChoice, handleRetry, regenerateChoices } = storyManager;

  React.useEffect(() => {
    if (id) {
      const story = getStory(id);
      if (story) {
        setStoryState({ ...story.state, id: story.id });
      } else {
        navigate('/library');
      }
    }
  }, [id, setStoryState, navigate]);

  if (!id) {
    navigate('/story/new');
    return null;
  }

  return (
    <>
      <StoryContainer
        segments={storyState.segments}
        currentSegment={storyState.currentSegment}
        isLoading={storyState.isLoading}
      />
      {storyState.currentSegment && !storyState.isLoading && (
        <ChoiceButtons
          choices={storyState.currentSegment.choices}
          onChoiceSelected={handleChoice}
          onRegenerateChoices={regenerateChoices}
          disabled={storyState.isLoading}
        />
      )}
      {storyState.error && (
        <ErrorDisplay
          error={storyState.error}
          onRetry={handleRetry}
          isLoading={storyState.isLoading}
        />
      )}
    </>
  );
}