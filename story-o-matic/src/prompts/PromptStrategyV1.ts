import { BasePromptStrategy } from './BasePromptStrategy';
import { StoryState, Choice } from '../types/story';

export class PromptStrategyV1 extends BasePromptStrategy {
  constructor() {
    super();
    // Use full paths in templateNames for flexibility
    this.templateNames = {
      title: 'v1/title.md',
      segment: 'v1/segment.md',
      summary: 'v1/summary.md'
    };
  }

  // V1 uses the default implementation from BasePromptStrategy
  handleChoice(choice: Choice, storyState: StoryState): { context: string; extraParams?: Record<string, any> } {
    return super.handleChoice(choice, storyState);
  }
}