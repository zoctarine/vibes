import { PromptStrategy } from './PromptStrategy';
import { StorySettings, StoryState, Choice } from '../types/story';
import { GENRES } from './genres';
import { PromptTemplateLoader } from './PromptTemplateLoader';

export class BasePromptStrategy implements PromptStrategy {
  protected templateLoader: PromptTemplateLoader;
  protected templateNames: {
    title: string;
    segment: string;
    summary: string;
  };
  
  constructor() {
    this.templateLoader = new PromptTemplateLoader();
    this.templateNames = {
      title: 'title',
      segment: 'segment',
      summary: 'summary'
    };
  }

  generateTitle(settingsDesc: string, settings: StorySettings): string {
    const language = settings.language === 'en' ? 'English' : 'Romanian';
    
    return this.templateLoader.fillTemplate(this.templateNames.title, {
      'settingsDesc': settingsDesc,
      'language': language
    });
  }

  generateSegment(context: string, settings: StorySettings): string {
    const language = settings.language === 'en' ? 'English' : 'Romanian';
    const perspectiveText = settings.perspective === 'first'
      ? 'first person ("I/We")'
      : settings.perspective === 'second'
        ? 'second person ("You")'
        : 'third person limited';
    
    const styleText = settings.styleInspiration
      ? `Write in the style of ${settings.styleInspiration}`
      : 'Use your own style';
    
    return this.templateLoader.fillTemplate(this.templateNames.segment, {
      'genre': settings.genre,
      'genreDescription': GENRES[settings.genre].description,
      'genreRestrictions': GENRES[settings.genre].restrictions,
      'genreAuthors': GENRES[settings.genre].authors.join(', '),
      'perspective': perspectiveText,
      'protagonistGender': settings.protagonistGender,
      'styleInspiration': styleText,
      'language': language,
      'context': context
    });
  }

  summarizeStory(context: string, settings: StorySettings): string {
    const language = settings.language === 'en' ? 'English' : 'Romanian';
    
    return this.templateLoader.fillTemplate(this.templateNames.summary, {
      'language': language,
      'context': context
    });
  }

  handleChoice(choice: Choice, storyState: StoryState): { context: string; extraParams?: Record<string, any> } {
    // Default implementation - concatenate all segments and current segment content
    const context = [
      ...storyState.segments.map((s) => s.content),
      storyState.currentSegment?.content,
      choice.text, // Include the selected choice in the context
    ]
      .filter(Boolean)
      .join('\n\n');

    return { context }; // No extra params by default
  }
}