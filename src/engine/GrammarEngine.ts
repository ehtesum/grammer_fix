import { Issue } from './types';

interface GrammarPattern {
  id: string;
  regex: RegExp;
  category: 'article' | 'subject_verb' | 'verb_tense' | 'plural' | 'preposition' | 'punctuation';
  replacement: string | ((match: string, ...groups: string[]) => string);
  explanation: string;
  type: 'grammar' | 'punctuation';
  severity: 'error' | 'warning';
}

const GRAMMAR_RULES: GrammarPattern[] = [
  // Article errors
  {
    id: 'art_a_example',
    regex: /\b(a)\s+(example|apple|hour|honest|idea|option|issue|answer|advice|advices|outcome|overview|error|article|assistant)\b/gi,
    category: 'article',
    replacement: (match, art, word) => `${art.toLowerCase() === 'a' ? (art === 'A' ? 'An' : 'an') : art} ${word}`,
    explanation: "Use 'an' instead of 'a' before words beginning with a vowel sound.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'art_an_consonant',
    regex: /\b(an)\s+(book|car|dog|university|system|professor|user|project|table|chair|method|result)\b/gi,
    category: 'article',
    replacement: (match, art, word) => `${art.toLowerCase() === 'an' ? (art === 'An' ? 'A' : 'a') : art} ${word}`,
    explanation: "Use 'a' instead of 'an' before words starting with a consonant sound.",
    type: 'grammar',
    severity: 'error',
  },

  // Subject-Verb Agreement
  {
    id: 'sv_she_go',
    regex: /\b(she|he|it|the system|the assistant|the user|the team)\s+(go)\b/gi,
    category: 'subject_verb',
    replacement: '$1 goes',
    explanation: "The singular subject requires the third-person verb form 'goes'.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'sv_system_analyze',
    regex: /\b(the system|the app|the assistant)\s+(analyze|give|work|need|run|check)\b/gi,
    category: 'subject_verb',
    replacement: (match, subj, verb) => {
      const verbMap: Record<string, string> = {
        analyze: 'analyzes',
        give: 'gives',
        work: 'works',
        need: 'needs',
        run: 'runs',
        check: 'checks',
      };
      return `${subj} ${verbMap[verb.toLowerCase()] || verb + 's'}`;
    },
    explanation: "Singular subject requires a third-person singular verb ending in '-s' or '-es'.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'sv_he_give',
    regex: /\b(he|she|it)\s+(give|take|make|find|say|know|think)\b/gi,
    category: 'subject_verb',
    replacement: (match, subj, verb) => {
      const verbMap: Record<string, string> = {
        give: 'gives',
        take: 'takes',
        make: 'makes',
        find: 'finds',
        say: 'says',
        know: 'knows',
        think: 'thinks',
      };
      return `${subj} ${verbMap[verb.toLowerCase()] || verb + 's'}`;
    },
    explanation: "The third-person singular pronoun requires a singular verb form.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'sv_they_goes',
    regex: /\b(they|we|you)\s+(goes|analyzes|gives|works|checks)\b/gi,
    category: 'subject_verb',
    replacement: (match, subj, verb) => {
      const verbMap: Record<string, string> = {
        goes: 'go',
        analyzes: 'analyze',
        gives: 'give',
        works: 'work',
        checks: 'check',
      };
      return `${subj} ${verbMap[verb.toLowerCase()] || verb}`;
    },
    explanation: "Plural subjects take the base form of the verb.",
    type: 'grammar',
    severity: 'error',
  },

  // Verb Tense
  {
    id: 'vt_yesterday_go',
    regex: /\b(yesterday|last week|last year|ago)\s+(i|he|she|they|we)\s+(go)\b/gi,
    category: 'verb_tense',
    replacement: '$1 $2 went',
    explanation: "Past time references like 'yesterday' require past tense verb forms ('went').",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'vt_yesterday_meet',
    regex: /\b(yesterday|last night|last month)\s+(i|he|she|they|we)\s+(meet)\b/gi,
    category: 'verb_tense',
    replacement: '$1 $2 met',
    explanation: "Use past tense 'met' when describing actions completed in the past.",
    type: 'grammar',
    severity: 'error',
  },

  // Pluralization & Uncountable Nouns
  {
    id: 'plural_two_book',
    regex: /\b(two|three|four|five|several|many)\s+(book|student|car|day|problem|result)\b/gi,
    category: 'plural',
    replacement: '$1 $2s',
    explanation: "Quantifiers like 'two' or 'many' require plural noun forms.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'plural_useful_advices',
    regex: /\b(useful|some|good|great)\s+(advices)\b/gi,
    category: 'plural',
    replacement: '$1 advice',
    explanation: "'Advice' is an uncountable noun and does not take a plural '-s'. Use 'advice' or 'pieces of advice'.",
    type: 'grammar',
    severity: 'error',
  },

  // Preposition Errors
  {
    id: 'prep_discuss_about',
    regex: /\b(discuss|discussed|discussing)\s+(about)\b/gi,
    category: 'preposition',
    replacement: '$1',
    explanation: "The verb 'discuss' takes a direct object. 'About' is redundant.",
    type: 'grammar',
    severity: 'warning',
  },

  // PDF Artifacts & Broken Words (Hyphenated line-breaks and space splits)
  {
    id: 'pdf_broken_hyphen',
    regex: /\b([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})\b/g,
    category: 'punctuation',
    replacement: (match, part1, part2) => `${part1}${part2}`,
    explanation: "Broken word caused by PDF line-break hyphenation. Merge into a single word.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'pdf_split_capital',
    regex: /\b([A-Z])\s+([a-z]{2,})\b/g,
    category: 'punctuation',
    replacement: (match, cap, rest) => `${cap}${rest}`,
    explanation: "Remove unnecessary space split inside capitalized word.",
    type: 'grammar',
    severity: 'error',
  },
  {
    id: 'pdf_space_comma',
    regex: /\b(\w+)\s+,\b/g,
    category: 'punctuation',
    replacement: '$1,',
    explanation: "Remove space before comma.",
    type: 'punctuation',
    severity: 'error',
  },

  // Punctuation
  {
    id: 'punc_hello_how_are_you',
    regex: /\b(hello|hi)\s+(how are you)\b/gi,
    category: 'punctuation',
    replacement: '$1, $2?',
    explanation: "Add a comma after greetings and end questions with a question mark.",
    type: 'punctuation',
    severity: 'error',
  },
];

export function analyzeGrammar(text: string): Issue[] {
  const issues: Issue[] = [];

  for (const rule of GRAMMAR_RULES) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.regex.source, rule.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      const start = match.index;
      const end = start + original.length;

      let replacementStr = '';
      if (typeof rule.replacement === 'function') {
        // @ts-ignore
        replacementStr = rule.replacement(...match);
      } else {
        replacementStr = original.replace(new RegExp(rule.regex.source, 'i'), rule.replacement);
      }

      issues.push({
        id: `gram-${rule.id}-${start}`,
        type: rule.type,
        severity: rule.severity,
        from: start,
        to: end,
        original,
        replacement: replacementStr,
        explanation: rule.explanation,
        categoryName: rule.type === 'punctuation' ? 'Punctuation' : 'Grammar',
      });
    }
  }

  return issues;
}
