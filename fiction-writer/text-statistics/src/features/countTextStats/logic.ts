export function countTextStats(text: string) {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty text provided");
  }
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  return {
    characters: charCount,
    charactersNoSpaces: charCountNoSpaces,
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount
  };
}