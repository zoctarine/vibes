import { PromptStrategy } from './PromptStrategy';
import { BasePromptStrategy } from './BasePromptStrategy';
import { PromptStrategyV2 } from './PromptStrategyV2';
import { StorySettings, StoryState, Choice } from '../types/story';

// Add more strategies as needed
type StrategyVersion = 'base' | 'v1' | 'v2';

export class PromptManager {
  private strategies: Record<StrategyVersion, PromptStrategy>;

  constructor() {
    // Initialize all available strategies
    this.strategies = {
      'base': new BasePromptStrategy(),
      'v1': new BasePromptStrategy(), // Alias for base version
      'v2': new PromptStrategyV2()
    };
  }

  // Factory method to create a strategy based on version
  createStrategy(version: StrategyVersion): PromptStrategy {
    const strategy = this.strategies[version];
    if (!strategy) {
      throw new Error(`Strategy version '${version}' not found`);
    }
    return strategy;
  }
}
