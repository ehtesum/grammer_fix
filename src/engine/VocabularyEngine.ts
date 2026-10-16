import { Issue } from './types';

interface VocabularyPattern {
  phrase: string;
  replacement: string;
  explanation: string;
}

const VOCABULARY_PATTERNS: VocabularyPattern[] = [
  {
    phrase: 'very good',
    replacement: 'excellent',
    explanation: "Consider replacing 'very good' with a stronger adjective like 'excellent', 'effective', or 'strong'.",
  },
  {
    phrase: 'very bad',
    replacement: 'terrible',
    explanation: "Use a stronger descriptor like 'terrible', 'poor', or 'substandard'.",
  },
  {
    phrase: 'very big',
    replacement: 'massive',
    explanation: "Consider replacing 'very big' with 'massive', 'substantial', or 'extensive'.",
  },
  {
    phrase: 'very fast',
    replacement: 'efficiently',
    explanation: "Enhance engagement by replacing 'very fast' with 'efficiently' or 'rapidly'.",
  },
  {
    phrase: 'works very fast',
    replacement: 'performs efficiently',
    explanation: "Rephrase 'works very fast' to 'performs efficiently' for a more professional tone.",
  },
  {
    phrase: 'very small',
    replacement: 'minimal',
    explanation: "Consider replacing 'very small' with 'minimal', 'compact', or 'tiny'.",
  },
  {
    phrase: 'make better',
    replacement: 'improve',
    explanation: "Use 'improve' or 'enhance' instead of 'make better'.",
  },
];

export function analyzeVocabulary(text: string): Issue[] {
  const issues: Issue[] = [];

  for (const pattern of VOCABULARY_PATTERNS) {
    const regex = new RegExp(`\\b${pattern.phrase}\\b`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      const start = match.index;
      const end = start + original.length;

      issues.push({
        id: `vocab-${start}`,
        type: 'vocabulary',
        severity: 'suggestion',
        from: start,
        to: end,
        original,
        replacement: pattern.replacement,
        explanation: pattern.explanation,
        categoryName: 'Vocabulary',
      });
    }
  }

  return issues;
}
