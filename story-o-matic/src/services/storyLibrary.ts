export const STORAGE_KEY = 'story_library';

import { SavedStory, StoryState } from '../types/story';

export function saveStory(title: string, state: StoryState): SavedStory {
  const stories = getAllStories();
  
  // Create summary from the last segment
  const lastSegment = state.currentSegment?.content || state.segments[state.segments.length - 1]?.content;
  const summary = lastSegment
    ? lastSegment.split('\n')[0].slice(0, 150) + '...'
    : 'New story';

  const story: SavedStory = {
    id: crypto.randomUUID(),
    title: state.title || title,
    state: {
      ...state,
      lastModified: new Date().toISOString()
    },
    lastModified: new Date().toISOString(),
    summary
  };

  // Check if story already exists
  const existingIndex = stories.findIndex(s => s.id === story.id);
  if (existingIndex >= 0) {
    stories[existingIndex] = story;
  } else {
    stories.push(story);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  return story;
}

export function getAllStories(): SavedStory[] {
  const storiesJson = localStorage.getItem(STORAGE_KEY);
  if (!storiesJson) return [];
  
  try {
    const stories: SavedStory[] = JSON.parse(storiesJson);
    return stories.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  } catch (error) {
    console.error('Failed to parse stories from localStorage:', error);
    return [];
  }
}

export function getStory(id: string): SavedStory | null {
  const stories = getAllStories();
  return stories.find(story => story.id === id) || null;
}

export function deleteStory(id: string): void {
  const stories = getAllStories().filter(story => story.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export function updateStory(id: string, state: StoryState): SavedStory | null {
  const story = getStory(id);
  if (!story) return null;

  // Ensure we're keeping the existing state structure and only updating what's changed
  const updatedStory: SavedStory = {
    ...story,
    state: {
      ...story.state,
      ...state,
      lastModified: new Date().toISOString(),
      summary: state.summary || story.state.summary,
      currentSegment: state.currentSegment,
      settings: {
        ...story.state.settings,
        ...state.settings
      }
    },
    lastModified: new Date().toISOString(),
    summary: state.currentSegment?.content.split('\n')[0].slice(0, 150) + '...' || story.summary
  };

  // Update stories in localStorage
  const stories = getAllStories();
  const storyIndex = stories.findIndex(s => s.id === id);
  
  if (storyIndex !== -1) {
    stories[storyIndex] = updatedStory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    return updatedStory;
  }

  return null;
}