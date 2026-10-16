import { Issue } from './types';

// Common spelling corrections dictionary
const COMMON_MISSPELLINGS: Record<string, string> = {
  'recieve': 'receive',
  'recieved': 'received',
  'seperate': 'separate',
  'definately': 'definitely',
  'definatly': 'definitely',
  'occured': 'occurred',
  'occuring': 'occurring',
  'grammer': 'grammar',
  'writting': 'writing',
  'proffesor': 'professor',
  'professer': 'professor',
  'tommorrow': 'tomorrow',
  'untill': 'until',
  'accommodate': 'accommodate',
  'truely': 'truly',
  'goverment': 'government',
  'environemnt': 'environment',
  'calender': 'calendar',
  'maintainance': 'maintenance',
  'happenning': 'happening',
  'experiance': 'experience',
  'belive': 'believe',
  'neccessary': 'necessary',
  'privilege': 'privilege',
  'privelege': 'privilege',
  'func-tional': 'functional',
  'rea-soning': 'reasoning',
  'in-troduce': 'introduce',
  'al-locate': 'allocate',
  'mul-tiple': 'multiple',
  'complex-ity': 'complexity',
  'test-time': 'test-time',
};

// Valid common English words dictionary hash
const DICTIONARY = new Set<string>([
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'done', 'will', 'would', 'shall', 'should', 'can', 'could', 'may',
  'might', 'must', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'in', 'on', 'at', 'by', 'to', 'from', 'with',
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
  'now', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself',
  'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'writewise', 'gramofix', 'ehtesum', 'professor', 'university',
  'project', 'assistant', 'system', 'writing', 'grammar', 'spelling', 'clarity', 'conciseness', 'vocabulary',
  'readability', 'demonstrating', 'demonstrate', 'improving', 'improved', 'suggestions', 'suggestion', 'offline',
  'document', 'documents', 'editing', 'editor', 'analysis', 'analyzes', 'score', 'scores', 'tone', 'dictionary',
  'sentence', 'sentences', 'paragraph', 'paragraphs', 'word', 'words', 'character', 'characters', 'college',
  'research', 'proposal', 'job', 'application', 'report', 'settings', 'privacy', 'local', 'ollama', 'model',
  'visual', 'understanding', 'reasoning', 'collaboration', 'framework', 'adaptive', 'paradigm', 'cognitive',
  'complexity', 'functional', 'introduce', 'allocate', 'multiple', 'performance', 'benchmark', 'evaluated',
  'variants', 'parameter', 'scale', 'scenarios', 'compromise', 'general', 'math', 'attain', 'average', 'rankings',
  'enhancement', 'monolithic', 'scaling', 'procedural', 'entities'
]);

export function analyzeSpelling(text: string, customDictionary: string[] = []): Issue[] {
  const issues: Issue[] = [];
  const customSet = new Set(customDictionary.map(w => w.toLowerCase()));

  // Tokenize text into words and hyphenated words with index tracking
  const wordRegex = /\b[A-Za-z'-]+\b/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const lowerWord = word.toLowerCase();
    const start = match.index;
    const end = start + word.length;

    // Skip valid terms in custom dictionary or basic dictionary
    if (customSet.has(lowerWord) || DICTIONARY.has(lowerWord)) continue;

    // Check direct misspelling map
    if (COMMON_MISSPELLINGS[lowerWord]) {
      const correction = COMMON_MISSPELLINGS[lowerWord];
      const replacement = word[0] === word[0].toUpperCase()
        ? correction[0].toUpperCase() + correction.slice(1)
        : correction;

      issues.push({
        id: `spell-${start}`,
        type: 'spelling',
        severity: 'error',
        from: start,
        to: end,
        original: word,
        replacement,
        explanation: `Possible spelling or broken word. Did you mean '${replacement}'?`,
        categoryName: 'Spelling',
      });
    }
  }

  return issues;
}
