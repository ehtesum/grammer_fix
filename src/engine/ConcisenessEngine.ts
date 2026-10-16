import { Issue } from './types';

interface ConcisenessPattern {
  phrase: string;
  replacement: string;
  explanation: string;
}

const CONCISENESS_PATTERNS: ConcisenessPattern[] = [
  {
    phrase: 'due to the fact that',
    replacement: 'because',
    explanation: "Simplify 'due to the fact that' to 'because' for conciseness.",
  },
  {
    phrase: 'at this point in time',
    replacement: 'now',
    explanation: "'At this point in time' can be stated more concisely as 'now'.",
  },
  {
    phrase: 'a large number of',
    replacement: 'many',
    explanation: "Use 'many' instead of 'a large number of' to make your text clearer.",
  },
  {
    phrase: 'in order to',
    replacement: 'to',
    explanation: "'In order to' is wordy. You can simply write 'to'.",
  },
  {
    phrase: 'for the purpose of',
    replacement: 'to',
    explanation: "'For the purpose of' can be shortened to 'to'.",
  },
  {
    phrase: 'in the near future',
    replacement: 'soon',
    explanation: "Consider using 'soon' instead of 'in the near future'.",
  },
  {
    phrase: 'with regard to',
    replacement: 'regarding',
    explanation: "'With regard to' can be expressed concisely as 'regarding'.",
  },
  {
    phrase: 'at the present time',
    replacement: 'currently',
    explanation: "Replace 'at the present time' with 'currently' or 'now'.",
  },
];

export function analyzeConciseness(text: string): Issue[] {
  const issues: Issue[] = [];

  for (const pattern of CONCISENESS_PATTERNS) {
    const regex = new RegExp(`\\b${pattern.phrase}\\b`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      const start = match.index;
      const end = start + original.length;

      issues.push({
        id: `concise-${start}`,
        type: 'conciseness',
        severity: 'suggestion',
        from: start,
        to: end,
        original,
        replacement: pattern.replacement,
        explanation: pattern.explanation,
        categoryName: 'Conciseness',
      });
    }
  }

  return issues;
}
