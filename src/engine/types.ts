export type IssueType = 
  | 'grammar' 
  | 'spelling' 
  | 'punctuation' 
  | 'clarity' 
  | 'conciseness' 
  | 'vocabulary';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';

export interface Issue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  from: number;
  to: number;
  original: string;
  replacement: string;
  explanation: string;
  categoryName: string;
}

export interface WritingScore {
  overall: number;
  correctness: number;
  clarity: number;
  engagement: number;
  delivery: number;
  label: string;
}

export interface ReadabilityMetrics {
  fleschScore: number;
  readingLevel: string;
  avgSentenceLength: number;
  avgWordLength: number;
  sentenceCount: number;
  wordCount: number;
  charCount: number;
}

export interface ToneMetrics {
  professional: number;
  friendly: number;
  confident: number;
  formal: number;
  casual: number;
  neutral: number;
  dominantTone: string;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  language: string;
  autoSave: boolean;
  checkWhileTyping: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  writingDomain: 'general' | 'academic' | 'business' | 'technical';
  enabledRules: {
    grammar: boolean;
    spelling: boolean;
    punctuation: boolean;
    clarity: boolean;
    conciseness: boolean;
    vocabulary: boolean;
  };
  localAiEndpoint: string;
}

export interface AtsIssue {
  id: string;
  category: 'action_verb' | 'quantification' | 'cliché' | 'structure';
  title: string;
  original: string;
  replacement: string;
  explanation: string;
  from: number;
  to: number;
  impact: 'high' | 'medium' | 'low';
}

export interface AtsScore {
  overall: number; // 0-100
  actionVerbsScore: number;
  quantificationScore: number;
  skillsKeywordScore: number;
  formattingScore: number;
  label: string;
  issues: AtsIssue[];
}

