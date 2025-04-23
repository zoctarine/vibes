export interface PromptStrategy {
  generateSegment(context: string, language: 'en' | 'ro'): string;
}