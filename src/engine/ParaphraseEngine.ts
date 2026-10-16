export type ParaphraseMode =
  | 'standard'
  | 'fluency'
  | 'formal'
  | 'academic'
  | 'creative'
  | 'expand'
  | 'shorten';

export type SynonymDensity = 'low' | 'medium' | 'high';

export interface ParaphraseOptions {
  mode: ParaphraseMode;
  density: SynonymDensity;
  frozenWords: string[];
}

export interface ParaphraseResult {
  output: string;
  variants: string[];
  mode: ParaphraseMode;
}

const SYNONYM_MAP: Record<string, string[]> = {
  'good': ['excellent', 'superior', 'high-quality', 'favorable'],
  'bad': ['substandard', 'poor', 'adverse', 'unfavorable'],
  'big': ['substantial', 'extensive', 'sizable', 'large'],
  'small': ['compact', 'minimal', 'modest', 'slight'],
  'fast': ['rapid', 'swift', 'expeditious', 'speedy'],
  'slow': ['gradual', 'unhurried', 'deliberate'],
  'important': ['crucial', 'vital', 'essential', 'significant'],
  'show': ['demonstrate', 'illustrate', 'indicate', 'display'],
  'help': ['assist', 'facilitate', 'support', 'aid'],
  'make': ['create', 'formulate', 'construct', 'generate'],
  'use': ['utilize', 'employ', 'leverage', 'apply'],
  'change': ['modify', 'alter', 'adjust', 'transform'],
  'need': ['require', 'demand', 'necessitate'],
  'system': ['architecture', 'framework', 'infrastructure'],
};

export function paraphraseTextLocal(text: string, options: ParaphraseOptions): ParaphraseResult {
  const frozenSet = new Set(options.frozenWords.map(w => w.toLowerCase().trim()));
  const words = text.split(/(\s+|[.,!?;:()])/);

  const densityProb = options.density === 'high' ? 0.6 : options.density === 'medium' ? 0.35 : 0.15;

  const transformedWords = words.map(token => {
    const lower = token.toLowerCase();
    if (frozenSet.has(lower) || !SYNONYM_MAP[lower]) {
      return token;
    }

    if (Math.random() < densityProb) {
      const candidates = SYNONYM_MAP[lower];
      const synonym = candidates[Math.floor(Math.random() * candidates.length)];
      return token[0] === token[0].toUpperCase()
        ? synonym[0].toUpperCase() + synonym.slice(1)
        : synonym;
    }
    return token;
  });

  let output = transformedWords.join('');

  // Apply mode specific transformations
  if (options.mode === 'formal') {
    output = output.replace(/\bcan't\b/gi, 'cannot')
                   .replace(/\bdon't\b/gi, 'do not')
                   .replace(/\bwon't\b/gi, 'will not')
                   .replace(/\bit's\b/gi, 'it is');
  } else if (options.mode === 'academic') {
    output = output.replace(/\bI think\b/gi, 'the evidence suggests')
                   .replace(/\ba lot of\b/gi, 'a substantial volume of');
  } else if (options.mode === 'shorten') {
    output = output.replace(/\bdue to the fact that\b/gi, 'because')
                   .replace(/\bat this point in time\b/gi, 'now')
                   .replace(/\bin order to\b/gi, 'to');
  } else if (options.mode === 'expand') {
    output = output.replace(/\bbecause\b/gi, 'due to the overarching fact that');
  }

  // Generate 3 sentence variants
  const variants = [
    output,
    `In effect, ${output[0].toLowerCase()}${output.slice(1)}`,
    `Specifically, ${output[0].toLowerCase()}${output.slice(1)}`,
  ];

  return {
    output,
    variants,
    mode: options.mode,
  };
}
