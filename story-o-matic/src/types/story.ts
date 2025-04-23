import { useState, useCallback } from 'react';
import { generateStorySegment } from '../services/gemini';
import { PromptManager } from '../prompts/PromptManager';

export interface StoryState {
  id: string | null;
  title: string | null;
  lastModified: string;
  summary?: {
    text: string;
    generatedAt: string;
  };
  segments: Array<{ id: string; content: string; choices: Array<{ id: string; text: string }> }>;
  currentSegment: { id: string; content: string; choices: Array<{ id: string; text: string }> } | null;
  isLoading: boolean;
  error: string | null;
  lastAction: { type: string; data: any } | null;
  debugLog: Array<{ timestamp: string; type: string; data: any }>;
  settings?: StorySettings;
}

export interface StorySettings {
  genre: string;
  perspective: 'first' | 'second' | 'third';
  protagonistGender: 'male' | 'female' | 'other';
  styleInspiration?: string;
  language: 'en' | 'ro';
  promptStrategy: 'v1' | 'v2';
  openingSentence?: string;
  openingTitle?: string;
  complexityLevel?: 'low' | 'medium' | 'high';
  emotionalTone?: 'light' | 'balanced' | 'dark';
}

export interface Choice {
  id: string;
  text: string;
  settings?: string;
  instructions?: string[];
}

// Create a singleton instance of PromptManager
const promptManager = new PromptManager();

export function useStoryManager() {
  const [storyState, setStoryState] = useState<StoryState>({
    id: null,
    title: null,
    lastModified: new Date().toISOString(),
    summary: undefined,
    segments: [],
    currentSegment: null,
    isLoading: false,
    error: null,
    lastAction: null,
    debugLog: [],
  });

  // Helper function to get context based on the prompt strategy
  const getContextForStrategy = useCallback(
    (choice: Choice) => {
      if (!storyState.settings) {
        return {
          context: "",
          extraParams: {}
        };
      }
      
      // Use the PromptManager to handle the choice based on the current strategy
      const strategy = promptManager.createStrategy(storyState.settings.promptStrategy);
      return strategy.handleChoice(choice, storyState);
    },
    [storyState]
  );

  // Add handleChoice method
  const handleChoice = useCallback(
    async (choice: Choice) => {
      if (!storyState.currentSegment) return;

      setStoryState((prev) => ({
        ...prev,
        segments: [...prev.segments, prev.currentSegment!],
        currentSegment: {
          id: crypto.randomUUID(),
          content: choice.text,
          choices: [],
        },
        isLoading: true,
        error: null,
        lastModified: new Date().toISOString(),
        lastAction: { type: 'select_choice', data: choice },
      }));

      try {
        const currentSettings = storyState.settings || {
          genre: 'Fantasy',
          perspective: 'third',
          protagonistGender: 'other',
          styleInspiration: '',
          language: 'en',
          promptStrategy: 'v1',
        } as StorySettings;

        // Get context and extra params based on strategy
        const strategy = promptManager.createStrategy(currentSettings.promptStrategy);
        const { context, extraParams } = strategy.handleChoice(choice, storyState);

        // Generate the next segment with merged settings and extra params
        const { content, choices } = await generateStorySegment(
          context,
          { ...currentSettings, ...extraParams }
        );

        setStoryState((prev) => ({
          ...prev,
          currentSegment: {
            id: crypto.randomUUID(),
            content,
            choices: choices.map((text) => ({
              id: crypto.randomUUID(),
              text,
            })),
          },
          isLoading: false,
          error: null,
          debugLog: [
            ...prev.debugLog,
            {
              timestamp: new Date().toISOString(),
              type: 'request',
              data: {
                context,
                extraParams,
                action: 'handle_choice',
                settings: { ...currentSettings, ...extraParams },
              },
            },
            {
              timestamp: new Date().toISOString(),
              type: 'response',
              data: { content, choices },
            },
          ],
        }));
      } catch (error) {
        const errorData =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorData,
          debugLog: [
            ...prev.debugLog,
            {
              timestamp: new Date().toISOString(),
              type: 'error',
              data: { error: errorData, choice },
            },
          ],
        }));
      }
    },
    [storyState, getContextForStrategy]
  );

  const regenerateChoices = useCallback(async () => {
    if (!storyState.currentSegment) return;

    const currentSettings = storyState.settings || {
      genre: 'Fantasy',
      perspective: 'third',
      protagonistGender: 'other',
      styleInspiration: '',
      language: 'en',
      promptStrategy: 'v1', // Default to v1
    } as StorySettings;

    const currentContent = storyState.currentSegment.content;

    setStoryState((prev: StoryState) => ({
      ...prev,
      isLoading: true,
      error: null,
      currentSegment: {
        ...prev.currentSegment!,
        choices: [],
      },
    }));

    try {
      // Use the appropriate strategy to build the context
      const strategy = promptManager.createStrategy(currentSettings.promptStrategy);
      
      // Create a dummy choice to reuse our context building logic
      const dummyChoice: Choice = {
        id: 'regenerate',
        text: currentContent
      };
      
      // Get context and extra params based on strategy
      const { context, extraParams } = strategy.handleChoice(dummyChoice, storyState);

      const { content, choices } = await generateStorySegment(
        context,
        { ...currentSettings, ...extraParams }
      );

      setStoryState((prev: StoryState) => ({
        ...prev,
        currentSegment: {
          ...prev.currentSegment!,
          content: currentContent,
          choices: choices.map((text) => ({
            id: crypto.randomUUID(),
            text,
          })),
        },
        isLoading: false,
        error: null,
        debugLog: [
          ...prev.debugLog,
          {
            timestamp: new Date().toISOString(),
            type: 'request',
            data: {
              context,
              extraParams,
              action: 'regenerate_choices',
              settings: { ...currentSettings, ...extraParams },
            },
          },
          {
            timestamp: new Date().toISOString(),
            type: 'response',
            data: { choices },
          },
        ],
      }));
    } catch (error) {
      const errorData =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setStoryState((prev: StoryState) => ({
        ...prev,
        isLoading: false,
        error: errorData,
        debugLog: [
          ...prev.debugLog,
          {
            timestamp: new Date().toISOString(),
            type: 'error',
            data: { error: errorData, settings: currentSettings },
          },
        ],
      }));
    }
  }, [storyState]);

  return {
    storyState,
    setStoryState,
    handleChoice,
    regenerateChoices,
  };
}