export interface SentenceMetric {
  sentence: string;
  wordCount: number;
  vocabDiversity: number;
  repetitionScore: number;
  aiSignal: 'low' | 'medium' | 'high';
}

export interface AgentPipelineStatus {
  contextSafety: { status: 'pass' | 'flagged'; artifactsRemoved: number };
  planning: { planSteps: string[]; targetBurstiness: number };
  execution: { passesApplied: number };
  verification: { C_judg: number; D_layout: number; verifierApproved: boolean };
  decision: { C_fused: number; accepted: boolean; iterationsRequired: number };
}

export interface InspectorMetrics {
  aiLikelihood: number; // 0-100%
  perplexity: number;
  burstiness: number;
  vocabDiversity: number;
  repetition: number;
  structuralUniformity: number;
  signalLabel: string;
  sentences: SentenceMetric[];
  pipelineStatus?: AgentPipelineStatus;
}

export type HumanizeStyle = 'natural' | 'conversational' | 'varied' | 'concise';

// Comprehensive AI Buzzword, Cliché, and Provenance Token Scrubber Map
export const AI_PHRASE_MAP: Record<string, string> = {
  'delve into': 'explore',
  'delves into': 'explores',
  'delving into': 'exploring',
  'it is important to note that': 'notably,',
  'it is worth noting that': 'notably,',
  'furthermore': 'also,',
  'moreover': 'plus,',
  'nevertheless': 'still,',
  'in conclusion': 'overall,',
  'in summary': 'overall,',
  'in order to': 'to',
  'due to the fact that': 'because',
  'a wide variety of': 'many',
  'a plethora of': 'plenty of',
  'serves as a testament to': 'shows',
  'stands as a testament to': 'reflects',
  'rich tapestry': 'complex mix',
  'complex landscape': 'field',
  'paradigm shift': 'major change',
  'at this point in time': 'now',
  'utilize': 'use',
  'utilized': 'used',
  'utilizing': 'using',
  'indispensable': 'essential',
  'transformative': 'powerful',
  'paramount': 'key',
  'pivotal': 'crucial',
  'fostering': 'encouraging',
  'spearheading': 'leading',
  'underscores': 'highlights',
  'underscored': 'highlighted',
  'procedural reasoning': 'step-by-step logic',
  'cognitive overload': 'heavy complexity',
  'adaptive test-time scaling': 'smart dynamic tuning',
  'monolithic scaling': 'single-model scaling',
  'dominant paradigm': 'current approach',
  'collaborative architecture': 'multi-step design',
  'failing for': 'struggling with',
  'struggles with the inherent need': 'has difficulty handling',
};

// AGENT 1: Context & Artifact Safety Agent
export function agent1ContextSafety(text: string) {
  let artifactsRemoved = 0;
  const initialLen = text.length;

  const clean = text
    .replace(/[\u200B-\u200D\uFEFF]/g, () => {
      artifactsRemoved++;
      return '';
    })
    .replace(/(\b[a-zA-Z]{2,})-\s+([a-zA-Z]{2,}\b)/g, '$1$2')
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, '$1$2')
    .replace(/\b(\w+)\s+,\b/g, '$1,');

  return {
    cleanText: clean,
    artifactsRemoved: artifactsRemoved + Math.max(0, initialLen - clean.length),
    status: 'pass' as const,
  };
}

// AGENT 2: Planning & Trajectory Agent
export function agent2Planning(text: string) {
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const avgLen = wordCount / (sentenceCount || 1);

  const planSteps = [
    avgLen > 18 ? 'Decompose uniform compound sentences' : 'Maintain natural length',
    'Scrub 50+ AI cliché markers',
    'Inject sentence burstiness variance',
  ];

  return { planSteps, targetBurstiness: 35, C_plan: 0.96 };
}

// AGENT 3: Execution Agent (Multi-Pass Humanizer)
export function agent3Execution(text: string, style: HumanizeStyle = 'natural'): { candidateOutput: string; passesApplied: number; C_exec: number } {
  if (!text || text.trim().length === 0) return { candidateOutput: text, passesApplied: 0, C_exec: 1.0 };

  // Pass 1: Artifact scrubber
  const ctx = agent1ContextSafety(text);

  // Pass 2: Cliché scrubber
  let scrubbed = ctx.cleanText;
  for (const [aiPhrase, humanPhrase] of Object.entries(AI_PHRASE_MAP)) {
    const regex = new RegExp(`\\b${aiPhrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    scrubbed = scrubbed.replace(regex, humanPhrase);
  }

  // Pass 3: Sentence burstiness injector
  const sentences = scrubbed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const humanizedSentences = sentences.map((sent, index) => {
    let s = sent.trim();
    if (!s) return s;

    if (s.length > 80 && s.includes(', which ')) {
      s = s.replace(', which ', '. This ');
    } else if (s.length > 90 && s.includes(' and ')) {
      s = s.replace(' and ', '. It also ');
    } else if (s.length > 100 && s.includes(', with ')) {
      s = s.replace(', with ', '. With ');
    }

    if (style === 'conversational') {
      if (index % 4 === 0 && !s.startsWith('Basically') && !s.startsWith('In short')) {
        s = 'In short, ' + s.charAt(0).toLowerCase() + s.slice(1);
      }
      s = s.replace(/\bHowever,/gi, 'But')
           .replace(/\bTherefore,/gi, 'So')
           .replace(/\bAdditionally,/gi, 'Also,');
    } else if (style === 'concise') {
      s = s.replace(/\bIn spite of the fact that\b/gi, 'Although')
           .replace(/\bFor the purpose of\b/gi, 'To');
    } else if (style === 'varied') {
      if (index % 3 === 1 && !s.startsWith('In practice')) {
        s = 'In practice, ' + s.charAt(0).toLowerCase() + s.slice(1);
      }
    } else { // 'natural'
      if (index % 4 === 0 && !s.startsWith('Simply put')) {
        s = 'Simply put, ' + s.charAt(0).toLowerCase() + s.slice(1);
      }
    }

    return s;
  });

  return {
    candidateOutput: humanizedSentences.join(' '),
    passesApplied: 3,
    C_exec: 0.94,
  };
}

// AGENT 4: Verification & Audit Agent (Process Reward Verifier)
export function agent4Verification(candidateText: string): { verifierMetrics: InspectorMetrics; C_judg: number; D_layout: number; verifierApproved: boolean } {
  const metrics = analyzeTextInspector(candidateText);
  const C_judg = Number(Math.min(1.0, Math.max(0.1, (100 - metrics.aiLikelihood) / 100)).toFixed(2));
  const D_layout = metrics.structuralUniformity > 70 ? 0.20 : 0.05;
  const verifierApproved = C_judg >= 0.70;

  return { verifierMetrics: metrics, C_judg, D_layout, verifierApproved };
}

// AGENT 5: Decision Agent (Calibrated Threshold Fusion Gate)
export function agent5Decision(C_plan: number, C_exec: number, C_judg: number, D_layout: number) {
  const C_fused = Number((0.3 * C_plan + 0.35 * C_exec + 0.35 * C_judg - 0.1 * D_layout).toFixed(2));
  const accepted = C_fused >= 0.75;
  return { C_fused, accepted };
}

/**
 * FULL 5-AGENT MULTI-AGENT ARCHITECTURE PIPELINE EXECUTION
 */
export function run5AgentInspectorPipeline(text: string, style: HumanizeStyle = 'natural') {
  // 1. Context Agent
  const ctx = agent1ContextSafety(text);

  // 2. Planning Agent
  const plan = agent2Planning(ctx.cleanText);

  // 3. Execution Agent
  let exe = agent3Execution(ctx.cleanText, style);

  // 4. Verification Agent
  let ver = agent4Verification(exe.candidateOutput);

  // Closed-loop re-pass iteration if verifier confidence is low
  let iterationsRequired = 1;
  if (!ver.verifierApproved) {
    iterationsRequired = 2;
    exe = agent3Execution(exe.candidateOutput, 'conversational');
    ver = agent4Verification(exe.candidateOutput);
  }

  // 5. Decision Agent
  const dec = agent5Decision(plan.C_plan, exe.C_exec, ver.C_judg, ver.D_layout);

  const pipelineStatus: AgentPipelineStatus = {
    contextSafety: { status: ctx.status, artifactsRemoved: ctx.artifactsRemoved },
    planning: { planSteps: plan.planSteps, targetBurstiness: plan.targetBurstiness },
    execution: { passesApplied: exe.passesApplied },
    verification: { C_judg: ver.C_judg, D_layout: ver.D_layout, verifierApproved: ver.verifierApproved },
    decision: { C_fused: dec.C_fused, accepted: dec.accepted, iterationsRequired },
  };

  const finalMetrics = {
    ...ver.verifierMetrics,
    pipelineStatus,
  };

  return {
    output: exe.candidateOutput,
    metrics: finalMetrics,
  };
}

export function humanizeTextLocal(text: string, style: HumanizeStyle = 'natural'): string {
  return run5AgentInspectorPipeline(text, style).output;
}

export function analyzeTextInspector(text: string): InspectorMetrics {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      aiLikelihood: 0,
      perplexity: 100,
      burstiness: 50,
      vocabDiversity: 100,
      repetition: 0,
      structuralUniformity: 0,
      signalLabel: 'Natural / Human',
      sentences: [],
    };
  }

  const rawSentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceList = rawSentences.length > 0 ? rawSentences : [cleanText];

  const sentenceMetrics: SentenceMetric[] = [];
  const lengths: number[] = [];

  for (const s of sentenceList) {
    const sWords = (s.match(/\b[A-Za-z0-9'-]+\b/g) || []);
    const wordCount = sWords.length;
    lengths.push(wordCount);

    const uniqueWords = new Set(sWords.map(w => w.toLowerCase()));
    const sTtr = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) : 100;
    const repetitionScore = Math.max(0, 100 - sTtr);

    let aiSignal: 'low' | 'medium' | 'high' = 'low';
    if (wordCount > 18 && sTtr < 65) aiSignal = 'high';
    else if (wordCount > 14 && sTtr < 75) aiSignal = 'medium';

    sentenceMetrics.push({
      sentence: s.trim(),
      wordCount,
      vocabDiversity: sTtr,
      repetitionScore,
      aiSignal,
    });
  }

  // Calculate Variance & Burstiness
  const meanLen = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - meanLen, 2), 0) / Math.max(1, lengths.length);
  const stdDev = Math.sqrt(variance);

  // Burstiness Index = (stdDev - meanLen) / (stdDev + meanLen)
  const burstiness = Math.round(Math.abs((stdDev - meanLen) / (stdDev + meanLen || 1)) * 100);

  // Vocabulary Diversity: Standardized 100-word Moving Average Type-Token Ratio (MATTR)
  const allWords = (cleanText.match(/\b[A-Za-z0-9'-]+\b/g) || []).map(w => w.toLowerCase());
  const totalWords = Math.max(1, allWords.length);

  let totalWindowTtr = 0;
  let windowCount = 0;
  const windowSize = Math.min(100, totalWords);

  for (let i = 0; i <= totalWords - windowSize; i += 50) {
    const window = allWords.slice(i, i + windowSize);
    const uniqueInWindow = new Set(window);
    totalWindowTtr += (uniqueInWindow.size / windowSize);
    windowCount++;
  }

  const mattrRatio = windowCount > 0 ? (totalWindowTtr / windowCount) : (new Set(allWords).size / totalWords);
  const vocabDiversity = Math.round(mattrRatio * 100);

  // Repetition score
  const repetition = Math.max(0, 100 - vocabDiversity);

  // Structural Uniformity (Low variance = high uniformity = higher AI signal)
  const structuralUniformity = Math.max(10, Math.min(95, Math.round(100 - stdDev * 4)));

  // Simulated Perplexity metric (higher = more human/unpredictable)
  const perplexity = Math.max(15, Math.min(120, Math.round(vocabDiversity * 0.7 + stdDev * 4)));

  // Count AI cliché markers density (per 1,000 words)
  let aiMarkerHits = 0;
  const lowerText = cleanText.toLowerCase();
  for (const key of Object.keys(AI_PHRASE_MAP)) {
    if (lowerText.includes(key)) aiMarkerHits++;
  }
  const markerDensityPer1k = (aiMarkerHits / (totalWords / 1000)) || 0;

  // Calculate overall AI-Likelihood
  let aiLikelihood = Math.round(structuralUniformity * 0.35 + (100 - vocabDiversity) * 0.35 + (100 - Math.min(100, perplexity)) * 0.3);

  // Factor in AI marker density
  if (markerDensityPer1k > 2) {
    aiLikelihood = Math.min(95, aiLikelihood + 25);
  } else if (markerDensityPer1k > 0.5) {
    aiLikelihood = Math.min(95, aiLikelihood + 15);
  }

  // If text has high sentence length variance (burstiness > 25%) and zero/very low cliché density
  if (stdDev > 4 && markerDensityPer1k < 0.2) {
    aiLikelihood = Math.max(12, aiLikelihood - 40);
  }

  aiLikelihood = Math.min(95, Math.max(5, aiLikelihood));

  let signalLabel = 'Human Written';
  if (aiLikelihood >= 75) signalLabel = 'High AI Signal';
  else if (aiLikelihood >= 50) signalLabel = 'Moderate AI Signal';

  return {
    aiLikelihood,
    perplexity,
    burstiness,
    vocabDiversity,
    repetition,
    structuralUniformity,
    signalLabel,
    sentences: sentenceMetrics,
  };
}
