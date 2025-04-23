export interface Genre {
  name: string;
  authors: string[];
  description: string;
  restrictions: string;
}

export const GENRES: Record<string, Genre> = {
  'Dystopian': {
    name: 'Dystopian',
    authors: ['George Orwell', 'Margaret Atwood', 'Suzanne Collins'],
    description: 'Stories set in a dark, oppressive future where society has broken down or been replaced by an authoritarian regime.',
    restrictions: 'Avoid excessive violence or gore. Focus on societal issues and moral dilemmas rather than physical conflict. Keep themes accessible but thought-provoking.'
  },
  'Epic Fantasy': {
    name: 'Epic Fantasy',
    authors: ['J.R.R. Tolkien', 'Brandon Sanderson', 'Patrick Rothfuss'],
    description: 'High fantasy stories featuring complex world-building, magic systems, and epic quests.',
    restrictions: 'Keep violence stylized rather than graphic. Focus on heroic themes and moral choices. Avoid explicit content or excessive darkness.'
  },
  'Science Fiction': {
    name: 'Science Fiction',
    authors: ['Isaac Asimov', 'Arthur C. Clarke', 'Ursula K. Le Guin'],
    description: 'Stories exploring the impact of science, technology, and space exploration on society and humanity.',
    restrictions: 'Focus on wonder and discovery rather than dystopian themes. Keep technical concepts accessible. Avoid graphic violence or adult themes.'
  },
  'Thriller': {
    name: 'Thriller',
    authors: ['Stephen King', 'Dan Brown', 'Gillian Flynn'],
    description: 'Fast-paced, suspenseful stories filled with tension, danger, and unexpected twists.',
    restrictions: 'Maintain suspense through mystery rather than violence. Avoid graphic descriptions, gore, or disturbing psychological elements.'
  },
  'Police Procedural': {
    name: 'Police Procedural',
    authors: ['Michael Connelly', 'Tana French', 'James Patterson'],
    description: 'Crime stories focusing on the methodical investigation process and police work.',
    restrictions: 'Focus on the investigative process rather than violent crimes. Avoid graphic crime scenes or disturbing details. Keep language clean.'
  },
  'Noir': {
    name: 'Noir',
    authors: ['Raymond Chandler', 'Dashiell Hammett', 'James Ellroy'],
    description: 'Dark, cynical stories featuring morally ambiguous characters and crime themes.',
    restrictions: 'Maintain atmosphere through dialogue and description rather than explicit content. Avoid graphic violence or adult themes.'
  },
  'Horror': {
    name: 'Horror',
    authors: ['Stephen King', 'H.P. Lovecraft', 'Anne Rice'],
    description: 'Stories designed to frighten, scare, or disturb, often featuring supernatural elements.',
    restrictions: 'Create tension through atmosphere rather than gore. Avoid graphic violence, disturbing imagery, or excessive psychological horror.'
  },
  'Romance': {
    name: 'Romance',
    authors: ['Jane Austen', 'Nicholas Sparks', 'Nora Roberts'],
    description: 'Stories centered around romantic relationships and emotional development.',
    restrictions: 'Keep relationships age-appropriate and innocent. Focus on emotional connections rather than physical attraction. Avoid adult themes.'
  },
  'Contemporary Fiction': {
    name: 'Contemporary Fiction',
    authors: ['Haruki Murakami', 'Donna Tartt', 'Sally Rooney'],
    description: 'Modern stories dealing with current themes and realistic situations.',
    restrictions: 'Address real-world issues in an age-appropriate way. Avoid controversial topics, explicit content, or mature themes.'
  },
  'Young Adult': {
    name: 'Young Adult',
    authors: ['J.K. Rowling', 'John Green', 'Rick Riordan'],
    description: 'Stories targeting teenage readers, often dealing with coming-of-age themes.',
    restrictions: 'Keep content appropriate for ages 12-18. Address complex themes sensitively. Avoid explicit content, graphic violence, or mature situations.'
  },
  'Middle Grade': {
    name: 'Middle Grade',
    authors: ['Rick Riordan', 'Roald Dahl', 'Kate DiCamillo'],
    description: 'Stories for readers aged 8-12, featuring age-appropriate adventures and themes.',
    restrictions: 'Use age-appropriate vocabulary and concepts. Keep content suitable for ages 8-12. No violence, romance, or mature themes. Focus on friendship, family, and personal growth. Maintain a positive, hopeful tone. Use simple sentence structures and clear descriptions.'
  },
  'Drama': {
    name: 'Drama',
    authors: ['John Steinbeck', 'Virginia Woolf', 'Khaled Hosseini'],
    description: 'Character-driven stories focusing on emotional development and personal conflicts.',
    restrictions: 'Handle emotional themes with sensitivity. Avoid explicit content or graphic descriptions. Keep conflicts relatable and age-appropriate.'
  }
};