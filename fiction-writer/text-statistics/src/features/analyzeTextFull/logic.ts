import { countTextStats } from '../countTextStats/logic.js';
import { estimateReadingTime } from '../estimateReadingTime/logic.js';

export function analyzeTextFull(text: string) {
  const stats = countTextStats(text);
  const readingTime = estimateReadingTime(text, 200);

  return {
    ...stats,
    readingTime,
  };
}