import { BasePromptStrategy } from './BasePromptStrategy';
import { StoryState, Choice, StorySettings } from '../types/story';
import { GENRES } from './genres';

export class PromptStrategyV2 extends BasePromptStrategy {
  constructor() {
    super();
    // Use full paths in templateNames for flexibility
    this.templateNames = {
      title: 'v2/title.md',
      segment: 'v2/segment.md',
      summary: 'v2/summary.md'
    };
  }
  
  // V2 strategy passes the choice as an extra parameter rather than including it directly in the context
  handleChoice(choice: Choice, storyState: StoryState): { context: string; extraParams?: Record<string, any> } {
    // Build context without including the choice text directly
    const context = [
      ...storyState.segments.map((s) => s.content),
      storyState.currentSegment?.content,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Instead, add the choice as an extra parameter
    return {
      context,
      extraParams: {
        choiceText: choice.text,
        includeChoiceInPrompt: true
      }
    };
  }

  // You can also override specific methods to add additional parameters or customize behavior
  generateSegment(context: string, settings: StorySettings): string {
    // Add additional parameters specific to V2
    const language = settings.language === 'en' ? 'English' : 'Romanian';
    const perspectiveText = settings.perspective === 'first'
      ? 'first person ("I/We")'
      : settings.perspective === 'second'
        ? 'second person ("You")'
        : 'third person limited';
    
    const styleText = settings.styleInspiration
      ? `Write in the style of ${settings.styleInspiration}`
      : 'Use your own style';
    
    // Add additional V2-specific parameters
    const additionalParams = {
      'complexityLevel': settings.complexityLevel || 'medium',
      'emotionalTone': settings.emotionalTone || 'balanced',
      'includeSensoryDetails': 'true'
    };
    
    const params = {
      'genre': settings.genre,
      'genreDescription': GENRES[settings.genre].description,
      'genreRestrictions': GENRES[settings.genre].restrictions,
      'genreAuthors': GENRES[settings.genre].authors.join(', '),
      'perspective': perspectiveText,
      'protagonistGender': settings.protagonistGender,
      'styleInspiration': styleText,
      'language': language,
      'context': context,
      ...additionalParams
    };
    
    return this.templateLoader.fillTemplate(this.templateNames.segment, params);
  }
}