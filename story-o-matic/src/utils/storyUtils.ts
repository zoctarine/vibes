import { StorySettings } from '../types/story';
import { GENRES } from '../prompts/genres';

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomSettings(): StorySettings {
  const genreNames = Object.keys(GENRES);
  const randomGenre = getRandomElement(genreNames);
  const randomPerspective = getRandomElement(['first', 'third']) as 'first' | 'third';
  const randomGender = getRandomElement(['male', 'female', 'other']) as 'male' | 'female' | 'other';
  const randomAuthor = getRandomElement(GENRES[randomGenre].authors);
  const randomLanguage = getRandomElement(['en', 'ro']);

  return {
    genre: randomGenre,
    perspective: randomPerspective,
    protagonistGender: randomGender,
    styleInspiration: randomAuthor,
    openingSentence: '',
    language: randomLanguage as 'en' | 'ro'
  };
}

export function buildInitialPrompt(settings: StorySettings): string {
  const perspective = {
    first: 'first person ("I/We")',
    second: 'second person ("You")',
    third: 'third person limited'
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
}