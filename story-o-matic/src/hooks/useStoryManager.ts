import { useState, useCallback } from 'react';
import { StoryState, StorySettings, Choice } from '../types/story';
import { generateStorySegment, generateTitle } from '../services/gemini';
import { saveStory, updateStory, getStory } from '../services/storyLibrary';
import { PromptManager } from '../prompts/PromptManager';

// Initialize with no settings, will use default v1 strategy
const promptManager = new PromptManager();

const buildInitialPrompt = (settings: StorySettings): string => {
  const perspective = {
    first: 'first person ("I/We")',
    second: 'second person ("You")',
    third: 'third person limited',
  }[settings.perspective];

  let prompt = `Write the first scene of a ${settings.genre.toLowerCase()} story `;
  prompt += `from a ${perspective} perspective, `;
  prompt += `with a ${settings.protagonistGender} protagonist. `;

  if (settings.styleInspiration) {
    prompt += `Write in the style of ${settings.styleInspiration}. `;
  }

  if (settings.openingSentence) {
    prompt += `Start with this opening: "${settings.openingSentence}" `;
  }

  return prompt;
};

export function useStoryManager() {
  const [storyState, setStoryState] = useState<StoryState>({
    id: null,
    title: null,
    segments: [],
    currentSegment: null,
    isLoading: false,
    error: null,
    lastAction: null,
    lastModified: new Date().toISOString(),
    debugLog: [],
  });

  const regenerateChoices = useCallback(async () => {
    if (!storyState.currentSegment) return;

    // Get the latest settings from localStorage if this is a saved story
    let currentSettings = storyState.settings;
    if (storyState.id) {
      const savedStory = getStory(storyState.id);
      currentSettings = savedStory?.state.settings || currentSettings;
    }

    // Update the prompt strategy based on current settings
    if (currentSettings) {
      const strategy = promptManager.createStrategy(currentSettings.promptStrategy);
      // Use the strategy as needed
    }

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      lastModified: new Date().toISOString(),
      currentSegment: {
        ...prev.currentSegment!,
        choices: [], // Clear choices while loading
      },
    }));

    try {
      const context = [
        ...storyState.segments.map((s) => s.content),
        storyState.currentSegment.content,
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!currentSettings) {
        throw new Error('Story settings are required but not found');
      }

      const { content: _, choices } = await generateStorySegment(
        context,
        currentSettings
      );

      const newState = (prev: StoryState): StoryState => ({
        ...prev,
        currentSegment: {
          ...prev.currentSegment!,
          content: prev.currentSegment!.content,
          choices: choices.map((text) => ({
            id: crypto.randomUUID(),
            text,
          })),
        },
        isLoading: false,
        error: null,
        settings: currentSettings,
        lastModified: new Date().toISOString(),
        debugLog: [
          ...prev.debugLog,
          {
            timestamp: new Date().toISOString(),
            type: 'request',
            data: {
              context,
              action: 'regenerate_choices',
              settings: currentSettings,
              promptStrategy: currentSettings?.promptStrategy
            },
          },
          {
            timestamp: new Date().toISOString(),
            type: 'response',
            data: { choices },
          },
        ],
      });

      const updatedState = newState(storyState);
      setStoryState(updatedState);

      if (storyState.id) {
        updateStory(storyState.id, updatedState);
      }
    } catch (error) {
      const errorData =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorData,
        lastModified: new Date().toISOString(),
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

  const startStory = useCallback(async (settings: StorySettings) => {
    const newState: StoryState = {
      id: null,
      title: settings.openingTitle || null,
      segments: [],
      currentSegment: null,
      isLoading: true,
      error: null,
      lastAction: { type: 'start', data: settings },
      settings,
      lastModified: new Date().toISOString(),
      debugLog: [],
    };
    
    setStoryState(newState);

    try {
      let title = settings.openingTitle;
      
      // Only generate title if not provided
      if (!title) {
        const settingsDesc = `${settings.genre.toLowerCase()} story with a ${
          settings.protagonistGender
        } protagonist` +
          (settings.styleInspiration
            ? ` in the style of ${settings.styleInspiration}`
            : '');
        title = await generateTitle(settingsDesc, settings);
      }

      const initialPrompt = buildInitialPrompt(settings);
      
      // If opening sentence is provided, use it directly without generating
      const startingContent = settings.openingSentence || initialPrompt;
      
      const { content, choices } = await generateStorySegment(
        startingContent,
        settings
      );

      const updatedState: StoryState = {
        ...newState,
        title,
        currentSegment: {
          id: crypto.randomUUID(),
          content: settings.openingSentence || content,
          choices: choices.map((text) => ({
            id: crypto.randomUUID(),
            text,
          })),
        },
        isLoading: false,
        error: null,
        lastModified: new Date().toISOString(),
        debugLog: [
          {
            timestamp: new Date().toISOString(),
            type: 'request',
            data: { 
              initialPrompt,
              useCustomTitle: Boolean(settings.openingTitle),
              useCustomOpening: Boolean(settings.openingSentence)
            },
          },
          {
            timestamp: new Date().toISOString(),
            type: 'response',
            data: { content, choices },
          },
        ],
      };

      setStoryState(updatedState);
      const savedStory = saveStory(title, updatedState);
      const finalState = { ...updatedState, id: savedStory.id };
      setStoryState(finalState);
      return finalState;
    } catch (error) {
      const errorState: StoryState = {
        ...newState,
        isLoading: false,
        settings,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while starting the story. Please try again.',
        lastModified: new Date().toISOString(),
        debugLog: [
          {
            timestamp: new Date().toISOString(),
            type: 'error',
            data: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      };
      setStoryState(errorState);
      throw error;
    }
  }, []);

  const handleChoice = useCallback(
    async (choice: Choice) => {
      setStoryState((prev) => ({
        ...prev,
        segments: [...prev.segments, prev.currentSegment!],
        currentSegment: {
          id: crypto.randomUUID(),
          content:
            choice.text +
            (choice.settings
              ? `\n\n\`\`\`\nSettings Changed: ${choice.settings}\n\`\`\`\n`
              : ''),
          choices: [],
        },
        isLoading: true,
        error: null,
        lastModified: new Date().toISOString(),
      }));

      try {
        const context = [
          ...storyState.segments.map((s) => s.content),
          storyState.currentSegment!.content,
        ]
          .filter(Boolean)
          .join('\n\n');

        // Add instructions to the context if present
        let promptWithInstructions =
          (choice.instructions?.length
            ? `Instructions for next scene:\n${choice.instructions.join(
                '\n'
              )}\n\n`
            : '') + 'Continue the story';

        const fullContext = `${context}\n\n${promptWithInstructions}`;

        if (!storyState.settings) {
          throw new Error('Story settings are required but not found');
        }

        const { content, choices } = await generateStorySegment(
          fullContext,
          storyState.settings
        );

        const newState = (prev: StoryState) => ({
          id: prev.id,
          title: prev.title,
          segments: [...prev.segments, prev.currentSegment!],
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
          settings: prev.settings,
          lastAction: { type: 'choice', data: choice },
          lastModified: new Date().toISOString(),
          debugLog: [
            ...prev.debugLog,
            {
              timestamp: new Date().toISOString(),
              type: 'request',
              data: { context },
            },
            {
              timestamp: new Date().toISOString(),
              type: 'response',
              data: { content, choices },
            },
          ],
        });

        setStoryState(newState);

        if (storyState.id) {
          updateStory(storyState.id, newState(storyState));
        }
      } catch (error) {
        const errorData =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        setStoryState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorData,
          lastAction: { type: 'choice', data: choice },
          lastModified: new Date().toISOString(),
          debugLog: [
            ...prev.debugLog,
            {
              timestamp: new Date().toISOString(),
              type: 'error',
              data: errorData,
            },
          ],
        }));
      }
    },
    [storyState]
  );

  const handleRetry = useCallback(async () => {
    if (!storyState.lastAction) return;

    setStoryState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      lastModified: new Date().toISOString(),
    }));

    try {
      if (storyState.lastAction.type === 'start') {
        await startStory(storyState.lastAction.data);
      } else if (storyState.lastAction.type === 'choice') {
        await handleChoice(storyState.lastAction.data);
      }
    } catch (error) {
      const errorData =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setStoryState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorData,
        lastModified: new Date().toISOString(),
      }));
    }
  }, [storyState.lastAction, startStory, handleChoice]);

  return {
    storyState,
    setStoryState,
    startStory,
    handleChoice,
    handleRetry,
    regenerateChoices,
  };
}
