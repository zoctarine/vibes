const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
import { PromptManager } from '../prompts/PromptManager';
import { StorySettings } from '../types/story';

const promptManager = new PromptManager();

export async function generateTitle(settingsDesc: string, settings: StorySettings): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const strategy = promptManager.createStrategy(settings.promptStrategy);
    const prompt = strategy.generateTitle(settingsDesc, settings);

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          candidateCount: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    const title = data.candidates[0].content.parts[0].text.trim();
    return title;
  } catch (error) {
    throw error;
  }
}

export async function generateStorySummary(context: string, settings: StorySettings): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const strategy = promptManager.createStrategy(settings.promptStrategy);
    const prompt = strategy.summarizeStory(context, settings);
    console.log('Generating summary with context:', context.substring(0, 100) + '...');

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          candidateCount: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

interface ErrorResponse {
  error: {
    message: string;
    status: string;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function generateStorySegment(
  context: string,
  settings: StorySettings
): Promise<{ content: string; choices: string[] }> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please check your environment variables.');
  }

  // Update prompt manager with current settings
  const strategy = promptManager.createStrategy(settings.promptStrategy);
  const prompt = strategy.generateSegment(context, settings);

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          candidateCount: 1,
          response_mime_type:  "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.error?.message || 
        `API request failed with status ${response.status}`
      );
    }

    const data: GeminiResponse = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(
        'Invalid response format from Gemini API. Please try again.'
      );
    }

    const responseText = data.candidates[0].content.parts[0].text;
    let result;
    try {
      // Clean the response text
      const cleanedResponse = responseText
        .replace(/^```json\s*|```$/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
      
      result = JSON.parse(cleanedResponse);

    } catch (parseError) {
      throw new Error(
        `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}\n` +
        `Raw response:\n${responseText}`
      );
    }
    
    // Validate response structure
    if (!result || typeof result !== 'object') {
      throw new Error(`Invalid response format: expected an object, got ${typeof result}\nResponse: ${JSON.stringify(result)}`);
    }
    if (!result.content || typeof result.content !== 'string') {
      throw new Error(
        `Invalid response format: missing or invalid content\n` +
        `Content: ${result.content}\n` +
        `Type: ${typeof result.content}`
      );
    }

    let finalChoices: string[];

    if (!result.choices || !Array.isArray(result.choices)) {
      finalChoices = ['Retry the adventure', 'Take a different path'];
    } else {
      finalChoices = result.choices;
    }

    // Ensure we have exactly 2 choices, if more take first 2, if less throw error
    if (finalChoices.length < 2) {
      finalChoices = ['Retry the adventure', 'Take a different path'];
    }

    let choices = finalChoices.slice(0, 2);

    if (!choices.every(choice => typeof choice === 'string' && choice.trim())) {
      finalChoices = ['Retry the adventure', 'Take a different path'];
      choices = finalChoices.slice(0, 2);
    }
    
    return {
      content: result.content,
      choices: choices
    };
  } catch (error) {
    // Log the full error for debugging
    throw error;
  }
}