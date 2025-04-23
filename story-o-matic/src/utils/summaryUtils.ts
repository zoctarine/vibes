import { StoryState } from '../types/story';
import { generateStorySummary } from '../services/gemini';
import { updateStory } from '../services/storyLibrary';

export async function handleShowSummary(
  state: StoryState,
  setIsLoading: (loading: boolean) => void,
  setCurrentSummary: (summary: string | null) => void,
  setStoryState?: (state: StoryState) => void
) {
  setIsLoading(true);
  setCurrentSummary(null);

  // Check if we have a valid cached summary
  if (
    state.summary?.text &&
    state.lastModified &&
    new Date(state.summary.generatedAt).getTime() >= new Date(state.lastModified).getTime()
  ) {
    setCurrentSummary(state.summary.text);
    setIsLoading(false);
    return;
  }

  try {
    const storyContent = [
      ...state.segments.map((s) => s.content),
      state.currentSegment?.content,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Ensure we have settings, if not use defaults
    const settings = state.settings || {
      genre: 'Fantasy',
      perspective: 'third',
      protagonistGender: 'other',
      styleInspiration: '',
      language: 'en',
      promptStrategy: 'v1'
    };

    const summary = await generateStorySummary(storyContent, settings);

    // Update the story state with the new summary
    const updatedState = {
      ...state,
      summary: {
        text: summary,
        generatedAt: new Date().toISOString(),
      },
      lastModified: new Date().toISOString()
    };

    // Update local state if setStoryState is provided (for story view)
    if (setStoryState) {
      setStoryState(updatedState);
    }

    // Always update persisted state if we have an ID
    if (state.id) {
      updateStory(state.id, updatedState);
    }

    setCurrentSummary(summary);
  } catch (error) {
    setCurrentSummary(
      'Failed to generate summary: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
  } finally {
    setIsLoading(false);
  }
}