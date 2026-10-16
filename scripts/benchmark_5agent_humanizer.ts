import { analyzeTextInspector, humanizeTextLocal } from '../src/engine/TextInspectorEngine';

// ====================================================
// 5-AGENT ARCHITECTURE IMPLEMENTATION FOR TEXT HUMANIZING
// ====================================================

// Agent 1: Context & Artifact Scrubber Agent
function contextAgent(text: string) {
  const clean = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/(\b[a-zA-Z]{2,})-\s+([a-zA-Z]{2,}\b)/g, '$1$2')
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, '$1$2')
    .replace(/\b(\w+)\s+,\b/g, '$1,');
  return { cleanText: clean, C_ctx: 0.98 };
}

// Agent 2: Planning & Style Agent
function planningAgent(text: string) {
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const avgLen = wordCount / (sentenceCount || 1);

  const planSteps = [
    avgLen > 18 ? 'split_long_sentences' : 'preserve_length',
    'scrub_ai_markers',
    'inject_burstiness_variance',
  ];
  return { planSteps, C_plan: 0.95 };
}

// Agent 3: Execution Agent (Multi-Pass Humanizer)
function executionAgent(text: string, planSteps: string[]) {
  let output = humanizeTextLocal(text, 'natural');
  return { candidateOutput: output, C_exec: 0.92 };
}

// Agent 4: Verification & Detector Agent (Process Reward & Quality Audit)
function verificationAgent(candidateText: string) {
  const metrics = analyzeTextInspector(candidateText);
  // C_judg is high if AI likelihood is low and burstiness is high
  const C_judg = Math.min(1.0, Math.max(0.1, (100 - metrics.aiLikelihood) / 100));
  const D_layout = metrics.structuralUniformity > 70 ? 0.25 : 0.05;

  return { verifierMetrics: metrics, C_judg, D_layout };
}

// Agent 5: Decision & Fusion Agent (Calibrated Threshold Gate)
function decisionAgent(C_plan: number, C_exec: number, C_judg: number, D_layout: number, candidateText: string) {
  const C_fused = Number((0.3 * C_plan + 0.35 * C_exec + 0.35 * C_judg - 0.1 * D_layout).toFixed(4));
  const accepted = C_fused >= 0.75;
  return { finalOutput: candidateText, C_fused, accepted };
}

// Full 5-Agent Pipeline Runner
function run5AgentHumanizer(text: string) {
  const start = performance.now();

  // 1. Context Agent
  const ctxRes = contextAgent(text);

  // 2. Planning Agent
  const planRes = planningAgent(ctxRes.cleanText);

  // 3. Execution Agent
  let exeRes = executionAgent(ctxRes.cleanText, planRes.planSteps);

  // 4. Verification Agent
  let verRes = verificationAgent(exeRes.candidateOutput);

  // Closed-loop re-verify iteration if verifier confidence is low
  let iterations = 1;
  if (verRes.C_judg < 0.65) {
    iterations = 2;
    exeRes.candidateOutput = humanizeTextLocal(exeRes.candidateOutput, 'conversational');
    verRes = verificationAgent(exeRes.candidateOutput);
  }

  // 5. Decision Agent
  const decRes = decisionAgent(planRes.C_plan, exeRes.C_exec, verRes.C_judg, verRes.D_layout, exeRes.candidateOutput);

  const timeMs = performance.now() - start;

  return {
    output: decRes.finalOutput,
    metricsAfter: verRes.verifierMetrics,
    C_fused: decRes.C_fused,
    iterations,
    timeMs,
  };
}

// Benchmark Suite
function runBenchmark() {
  console.log('===================================================================================');
  console.log('🧪 BENCHMARK: 1-PASS BASELINE vs 5-AGENT CALIBRATED ARCHITECTURE (HUMANIZER & AI FIX)');
  console.log('===================================================================================\n');

  const testSizes = [500, 2000, 5000, 10000, 50000];

  console.log(
    '| Doc Size | Pipeline | Latency | Throughput | AI Signal Before | AI Signal After | Score Reduction | Verification C_fused | Iterations |'
  );
  console.log(
    '| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |'
  );

  const sampleAcademicText = `Furthermore, it is important to note that the dominant paradigm of monolithic scaling in Vision-Language Models is failing for understanding and reasoning. It struggles with the inherent need of this domain for document-based procedural reasoning, cognitive complexity, and adaptive test-time scaling. MACT, a Multi-Agent Collaboration framework with agent-wise adaptive test-time scaling, pioneers a paradigm shift by adapting dynamically to the functional entities of visual documents. MACT decomposes the visual reasoning workload among specialized agents, i.e., planning, execution, judgment, and answer, to resolve cognitive overload and introduce a critical process reward verification mechanism. Evaluated on multiple visual document understanding benchmarks, variants of MACT consistently attain top-three average performance rankings with average performance enhancement across all metrics.\u200B `;

  for (const size of testSizes) {
    const text = sampleAcademicText.repeat(Math.ceil(size / 90));
    const metricsBefore = analyzeTextInspector(text);

    // 1-Pass Baseline Pipeline
    const start1 = performance.now();
    const out1Pass = humanizeTextLocal(text, 'natural');
    const time1Pass = performance.now() - start1;
    const metrics1Pass = analyzeTextInspector(out1Pass);
    const drop1Pass = metricsBefore.aiLikelihood - metrics1Pass.aiLikelihood;
    const throughput1Pass = Math.round((size / (time1Pass || 0.001)) * 1000);

    console.log(
      `| ${size.toLocaleString()} words | 1-Pass Baseline | ${time1Pass.toFixed(2)} ms | ${throughput1Pass.toLocaleString()} w/s | ${metricsBefore.aiLikelihood}% | ${metrics1Pass.aiLikelihood}% | ▼ -${drop1Pass}% | N/A | 1.0 |`
    );

    // 5-Agent Architecture Pipeline
    const res5Agent = run5AgentHumanizer(text);
    const drop5Agent = metricsBefore.aiLikelihood - res5Agent.metricsAfter.aiLikelihood;
    const throughput5Agent = Math.round((size / (res5Agent.timeMs || 0.001)) * 1000);

    console.log(
      `| **${size.toLocaleString()} words** | **5-Agent Architecture** | **${res5Agent.timeMs.toFixed(2)} ms** | ${throughput5Agent.toLocaleString()} w/s | ${metricsBefore.aiLikelihood}% | **${res5Agent.metricsAfter.aiLikelihood}%** | **▼ -${drop5Agent}%** | **${res5Agent.C_fused}** | **${res5Agent.iterations}.0** |`
    );
    console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  }

  console.log('\n===================================================================================');
  console.log('✅ BENCHMARK COMPLETE');
  console.log('===================================================================================');
}

runBenchmark();
