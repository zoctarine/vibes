import { StorySettings, StoryState, Choice } from '../types/story';

export interface PromptStrategy {
  generateTitle(settingsDesc: string, settings: StorySettings): string;
  generateSegment(context: string, settings: StorySettings): string;
  summarizeStory(context: string, settings: StorySettings): string;
  
  // New method for handling choices differently based on strategy
  handleChoice(
    choice: Choice, 
    storyState: StoryState
  ): { 
    context: string; 
    extraParams?: Record<string, any> 
  };
}