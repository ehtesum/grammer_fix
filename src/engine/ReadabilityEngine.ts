import { ReadabilityMetrics } from './types';

// Helper to count syllables in an English word
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export function analyzeReadability(text: string): ReadabilityMetrics {
  const charCount = text.length;
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      fleschScore: 100,
      readingLevel: 'Easy',
      avgSentenceLength: 0,
      avgWordLength: 0,
      sentenceCount: 0,
      wordCount: 0,
      charCount: 0,
    };
  }

  // Sentences split by . ! ?
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Words split by whitespace
  const words = cleanText.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const wordCount = Math.max(1, words.length);

  // Syllables
  let totalSyllables = 0;
  let totalWordChars = 0;

  for (const word of words) {
    totalSyllables += countSyllables(word);
    totalWordChars += word.length;
  }

  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;
  const avgWordLength = Math.round((totalWordChars / wordCount) * 10) / 10;

  // Flesch Reading Ease Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const ASL = wordCount / sentenceCount;
  const ASW = totalSyllables / wordCount;
  let fleschScore = Math.round(206.835 - (1.015 * ASL) - (84.6 * ASW));

  // Clamp Flesch Score between 0 and 100
  fleschScore = Math.max(0, Math.min(100, fleschScore));

  let readingLevel = 'College';
  if (fleschScore >= 90) readingLevel = '5th Grade (Very Easy)';
  else if (fleschScore >= 80) readingLevel = '6th Grade (Easy)';
  else if (fleschScore >= 70) readingLevel = '7th Grade (Fairly Easy)';
  else if (fleschScore >= 60) readingLevel = '8th & 9th Grade (Standard)';
  else if (fleschScore >= 50) readingLevel = 'High School (Fairly Difficult)';
  else if (fleschScore >= 30) readingLevel = 'College';
  else readingLevel = 'College Graduate (Very Difficult)';

  return {
    fleschScore,
    readingLevel,
    avgSentenceLength,
    avgWordLength,
    sentenceCount,
    wordCount,
    charCount,
  };
}
