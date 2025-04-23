import { StorySettings } from '../types/story';
import { GENRES } from './genres';

export const storyPrompts = {
  generateTitle: (settings: string, language: 'en' | 'ro') => `
    Generate a creative and engaging title for a ${settings} story.
    IMPORTANT:
    - Respond in ${language === 'en' ? 'English' : 'Romanian'}
    - Respond with ONLY the title text
    - NO quotes, NO punctuation at the end
    - Keep it concise (2-6 words) 
    - Make it intriguing but not cliche
    - Basic markdown is allowed for emphasis (*, _, **, __)
    - The title MUST be in ${
      language === 'en' ? 'English' : 'Romanian'
    } language
  `,
  generateSegment: (
    context: string,
    language: 'en' | 'ro',
    settings: StorySettings
  ) => `
    You are a creative storyteller crafting an interactive story.
    You have specific critical isntructions you need to follow.
    during the storhy, some of this instractions can change. and new ones need to be used from there on. and then, they can change.
    below is the current set of instructions.
    
    CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
    1. Genre: Write in the ${settings.genre} genre
    2. Genre Guidelines:
       - Description: ${GENRES[settings.genre].description}
       - Content Restrictions: ${GENRES[settings.genre].restrictions}
       - Common Authors: ${GENRES[settings.genre].authors.join(', ')}
    3. Narrative Guidelines:
       - Perspective: Use ${
      settings.perspective === 'first'
        ? 'first person ("I/We")'
        : settings.perspective === 'second'
        ? 'second person ("You")'
        : 'third person limited'
    } perspective consistently
       - Protagonist: The main character is ${settings.protagonistGender}
       - Writing Style: ${
      settings.styleInspiration
        ? `Write in the style of ${settings.styleInspiration}`
        : 'Use your own style'
    }
    4. Language: Write in ${language === 'en' ? 'English' : 'Romanian'}
    
    IMPORTANT: These settings are MANDATORY and must be maintained throughout the story. Do not deviate from them.
    When you read the context/story, it can be they did not follow them exactly, that is because at that moment other requirements were active. Pay close attention to blocks that look like this
    \`\`\`
    Settings Changed: ...
    \`\`\`

  They will let you know what has changed at that point.
  Always use current settings to generate new text, but keep in mind these settings so you can understand the context.
   Example: if at some point the genre changed, you will see
   \`\`\`
   Settings Changed: Genre(Fantasy->Dystopia)
   \`\`\`
   and so on

    Based on the context and these settings, continue the story while strictly maintaining the specified narrative voice, perspective, and style.
    
    Story Requirements:
    1. Maintain consistent narrative voice and perspective throughout
    2. Keep character gender and personality consistent
    3. Follow genre conventions while avoiding clichés
    4. Include:
       - Dynamic dialogue that reveals character
       - Sensory details (sight, sound, smell, touch, taste)
       - Clear action and movement
       - Character development
       - World-building elements
    5. Show character growth and change over time
    6. Create meaningful choices that affect the story

    IMPORTANT REQUIREMENTS:
    ONLY respond with a JSON object in this exact format, with no additional text or formatting:
    {
      "content": "2-3 paragraphs of engaging story text here",
      "choices": ["The next paragraph continuing the story in one direction", "The next paragraph continuing the story in another direction"]
    }

     Use this JSON schema:

    Segment = {'content': str, 'choices': list[str]}
    Return: Segment
    
    Choice Requirements:
    1. EXACTLY 2 choices
    2. Each choice must:
       - Use the same perspective and voice as the main story
       - Continue directly from the current scene
       - Lead to different story paths
       - Feel natural and meaningful
       - Be written as the next part of the story
       - Include dialogue, description, or action
       - Maintain all story settings
    
    Context:
    ${context}
  `,
  summarizeStory: (context: string, language: 'en' | 'ro') => `
    You are a skilled story analyst. Create a comprehensive summary of this story, written in ${
      language === 'en' ? 'English' : 'Romanian'
    }.
    
    IMPORTANT REQUIREMENTS:
    1. The summary should:
       - Capture the main plot points and character development
       - Highlight key decisions and their consequences
       - Emphasize where the story currently stands
       - Be engaging and well-structured
       - Use proper formatting (markdown allowed)
    2. Keep the summary concise but informative
    3. End with a brief note about where the story left off
    4. Use the same narrative tone as the original story
    
    Story to summarize:
    ${context}
  `,
};

