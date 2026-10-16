import { AtsIssue, AtsScore } from './types';

interface WeakVerbPattern {
  pattern: RegExp;
  original: string;
  replacement: string;
  explanation: string;
}

const WEAK_VERB_PATTERNS: WeakVerbPattern[] = [
  {
    pattern: /\b(worked on)\b/gi,
    original: 'worked on',
    replacement: 'engineered',
    explanation: "Replace passive phrase 'worked on' with a strong action verb like 'engineered', 'developed', or 'built'.",
  },
  {
    pattern: /\b(helped with)\b/gi,
    original: 'helped with',
    replacement: 'spearheaded',
    explanation: "Use impactful leadership verbs like 'spearheaded' or 'facilitated' instead of 'helped with'.",
  },
  {
    pattern: /\b(responsible for)\b/gi,
    original: 'responsible for',
    replacement: 'managed',
    explanation: "'Responsible for' sounds passive. Start bullet points with strong verbs like 'managed' or 'directed'.",
  },
  {
    pattern: /\b(was involved in)\b/gi,
    original: 'was involved in',
    replacement: 'collaborated on',
    explanation: "Replace 'was involved in' with 'collaborated on' or 'contributed to'.",
  },
  {
    pattern: /\b(handled)\b/gi,
    original: 'handled',
    replacement: 'orchestrated',
    explanation: "Upgrade 'handled' to 'orchestrated', 'administered', or 'oversaw' to impress ATS resume scanners.",
  },
  {
    pattern: /\b(made)\b/gi,
    original: 'made',
    replacement: 'created',
    explanation: "Use action-oriented verbs like 'created', 'designed', or 'formulated' instead of 'made'.",
  },
];

const CLICHE_PATTERNS = [
  {
    pattern: /\b(team player)\b/gi,
    original: 'team player',
    replacement: 'collaborative professional',
    explanation: "'Team player' is a generic resume cliché. Use 'collaborative professional' or demonstrate teamwork with facts.",
  },
  {
    pattern: /\b(hardworking|hard working)\b/gi,
    original: 'hardworking',
    replacement: 'results-driven',
    explanation: "Replace unquantified claims like 'hardworking' with 'results-driven' or 'dedicated'.",
  },
  {
    pattern: /\b(detail oriented|detail-oriented)\b/gi,
    original: 'detail oriented',
    replacement: 'meticulous',
    explanation: "Consider using 'meticulous' or 'thorough' to describe quality control focus.",
  },
  {
    pattern: /\b(self starter|self-starter)\b/gi,
    original: 'self-starter',
    replacement: 'proactive initiator',
    explanation: "Upgrade 'self-starter' to 'proactive initiator' or highlight self-directed projects.",
  },
];

const STANDARD_SECTIONS = ['experience', 'education', 'skills', 'projects', 'summary', 'certifications'];

export function analyzeAtsScore(text: string): AtsScore {
  const issues: AtsIssue[] = [];
  const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const totalWords = Math.max(1, words.length);

  // 1. Action Verbs Check
  let weakVerbCount = 0;
  for (const item of WEAK_VERB_PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(item.pattern.source, 'gi');
    while ((match = regex.exec(text)) !== null) {
      weakVerbCount++;
      issues.push({
        id: `ats-verb-${match.index}`,
        category: 'action_verb',
        title: 'Weak Action Verb',
        original: match[0],
        replacement: item.replacement,
        explanation: item.explanation,
        from: match.index,
        to: match.index + match[0].length,
        impact: 'high',
      });
    }
  }

  // 2. Resume Cliché Check
  let clicheCount = 0;
  for (const item of CLICHE_PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(item.pattern.source, 'gi');
    while ((match = regex.exec(text)) !== null) {
      clicheCount++;
      issues.push({
        id: `ats-cliche-${match.index}`,
        category: 'cliché',
        title: 'Overused Resume Cliché',
        original: match[0],
        replacement: item.replacement,
        explanation: item.explanation,
        from: match.index,
        to: match.index + match[0].length,
        impact: 'medium',
      });
    }
  }

  // 3. Quantification & Metrics Check
  const numbers = text.match(/\b\d+(?:%|\$|k|M|\+)?\b|\$\d+/gi) || [];
  const hasQuantification = numbers.length >= 3;

  if (!hasQuantification && totalWords > 30) {
    issues.push({
      id: 'ats-quant-1',
      category: 'quantification',
      title: 'Missing Measurable Metrics',
      original: 'Achievements without numbers',
      replacement: 'Add percentages (%), dollar amounts ($), or team size counts',
      explanation: 'Resumes with numerical metrics (e.g. "Increased sales by 35%", "Managed $50K budget") rank 40% higher in ATS screening.',
      from: 0,
      to: 0,
      impact: 'high',
    });
  }

  // 4. Structure & Section Header Check
  const lowerText = text.toLowerCase();
  let foundSections = 0;
  for (const sec of STANDARD_SECTIONS) {
    if (lowerText.includes(sec)) {
      foundSections++;
    }
  }

  if (foundSections < 2 && totalWords > 40) {
    issues.push({
      id: 'ats-struct-1',
      category: 'structure',
      title: 'Missing Standard Section Headers',
      original: 'Document structure',
      replacement: 'Add clear headers: Experience, Education, Skills, Projects',
      explanation: 'ATS scanners rely on clear section headings to parse work history and technical skills correctly.',
      from: 0,
      to: 0,
      impact: 'medium',
    });
  }

  // Sub-Scores Calculation
  const actionVerbsScore = Math.max(30, Math.min(100, 100 - weakVerbCount * 12));
  const quantificationScore = hasQuantification ? Math.min(100, 70 + numbers.length * 8) : 45;
  const skillsKeywordScore = Math.min(100, Math.max(50, Math.round(50 + (foundSections / STANDARD_SECTIONS.length) * 50)));
  const formattingScore = Math.max(40, Math.min(100, 100 - clicheCount * 10));

  // Overall ATS Score calculation
  const overall = Math.round(
    actionVerbsScore * 0.35 + quantificationScore * 0.3 + skillsKeywordScore * 0.2 + formattingScore * 0.15
  );

  let label = 'Low ATS Match';
  if (overall >= 85) label = 'Excellent ATS Resume';
  else if (overall >= 70) label = 'Good ATS Match';
  else if (overall >= 55) label = 'Fair ATS Score';

  return {
    overall,
    actionVerbsScore,
    quantificationScore,
    skillsKeywordScore,
    formattingScore,
    label,
    issues,
  };
}
