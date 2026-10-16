import { Issue, ReadabilityMetrics, WritingScore } from './types';

export function calculateWritingScore(issues: Issue[], readability: ReadabilityMetrics): WritingScore {
  if (readability.wordCount === 0) {
    return {
      overall: 100,
      correctness: 100,
      clarity: 100,
      engagement: 100,
      delivery: 100,
      label: 'Great writing',
    };
  }

  // Count issues by category
  const grammarErrors = issues.filter(i => i.type === 'grammar' || i.type === 'spelling' || i.type === 'punctuation').length;
  const clarityErrors = issues.filter(i => i.type === 'clarity' || i.type === 'conciseness').length;
  const vocabSuggestions = issues.filter(i => i.type === 'vocabulary').length;

  // Correctness deduction (Base 100)
  const correctnessDeduction = grammarErrors * 7;
  const correctness = Math.max(20, Math.min(100, 100 - correctnessDeduction));

  // Clarity deduction (Base 100)
  const sentenceLenPenalty = readability.avgSentenceLength > 25 ? 12 : (readability.avgSentenceLength > 20 ? 6 : 0);
  const clarityDeduction = (clarityErrors * 5) + sentenceLenPenalty;
  const clarity = Math.max(30, Math.min(100, 100 - clarityDeduction));

  // Engagement deduction (Base 100)
  const engagementDeduction = vocabSuggestions * 6;
  const engagement = Math.max(40, Math.min(100, 100 - engagementDeduction));

  // Delivery deduction (Base 100)
  const readabilityBonus = readability.fleschScore >= 60 ? 5 : -5;
  const delivery = Math.max(40, Math.min(100, Math.round((correctness * 0.4 + clarity * 0.4 + 20) + readabilityBonus)));

  // Overall Weighted Score
  const overall = Math.round(correctness * 0.4 + clarity * 0.3 + engagement * 0.15 + delivery * 0.15);

  let label = 'Needs work';
  if (overall >= 90) label = 'Excellent writing';
  else if (overall >= 80) label = 'Good writing';
  else if (overall >= 70) label = 'Satisfactory';
  else if (overall >= 60) label = 'Fair';

  return {
    overall,
    correctness,
    clarity,
    engagement,
    delivery,
    label,
  };
}
