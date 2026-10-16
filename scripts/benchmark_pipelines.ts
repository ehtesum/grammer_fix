import { analyzeTextInspector, humanizeTextLocal } from '../src/engine/TextInspectorEngine';

// Pipeline B: Watermark Scrubber Simulation (Layer A Zero-width & Provenance Stripper)
function watermarkScrubberPipeline(text: string): { output: string; executionTimeMs: number } {
  const start = performance.now();

  // 1. Strip zero-width Unicode characters (U+200B, U+200C, U+200D, U+FEFF)
  let clean = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Strip C2PA/SynthID hidden control tokens & metadata strings
  clean = clean.replace(/\[c2pa:[^\]]+\]/gi, '')
               .replace(/\[provenance:[^\]]+\]/gi, '');

  // 3. Layer A deterministic n-gram cleaner
  clean = clean.replace(/\bdelve into\b/gi, 'examine')
               .replace(/\bin order to\b/gi, 'to')
               .replace(/\bdue to the fact that\b/gi, 'because');

  const executionTimeMs = performance.now() - start;
  return { output: clean, executionTimeMs };
}

// Pipeline A: OmniWrite Pro AI Humanizer & Inspector Pipeline
function omniWriteHumanizerPipeline(text: string): { metricsBefore: any; metricsAfter: any; output: string; executionTimeMs: number } {
  const start = performance.now();

  // 1. Initial AI Likelihood & Perplexity Analysis
  const metricsBefore = analyzeTextInspector(text);

  // 2. Stylistic Humanizer Transformation (Vary sentence structure, vocabulary TTR, burstiness)
  const output = humanizeTextLocal(text, 'natural');

  // 3. Post-Humanize Verification & Re-Analysis
  const metricsAfter = analyzeTextInspector(output);

  const executionTimeMs = performance.now() - start;
  return { metricsBefore, metricsAfter, output, executionTimeMs };
}

function generateSampleText(wordCountCount: number): string {
  const paragraph = `Furthermore, it is important to note that the system delves into a rich tapestry of natural language processing rules. In order to utilize these features, a wide variety of metrics are calculated at this point in time. Additionally, it serves as a testament to local AI processing efficiency.\u200B `;
  const repeatCount = Math.ceil(wordCountCount / 40);
  return paragraph.repeat(repeatCount);
}

function runPipelineBenchmark() {
  console.log('==================================================');
  console.log('⚡ PIPELINE COMPARATIVE BENCHMARK: OMNIWRITE PRO vs WATERMARK SCRUBBER');
  console.log('==================================================\n');

  const testSizes = [500, 2000, 5000, 10000, 50000];

  console.log(
    '| Doc Size | Pipeline | Execution Time | Throughput | AI Signal Before | AI Signal After | Score Reduction |'
  );
  console.log(
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
  );

  for (const size of testSizes) {
    const sampleText = generateSampleText(size);
    const wordCount = sampleText.split(/\s+/).filter(Boolean).length;

    // Benchmark Pipeline A (OmniWrite Pro AI Humanizer)
    const resA = omniWriteHumanizerPipeline(sampleText);
    const throughputA = Math.round((wordCount / (resA.executionTimeMs || 0.001)) * 1000);
    const dropA = resA.metricsBefore.aiLikelihood - resA.metricsAfter.aiLikelihood;

    console.log(
      `| **${size.toLocaleString()} words** | **OmniWrite Pro** | **${resA.executionTimeMs.toFixed(2)} ms** | ${throughputA.toLocaleString()} w/s | ${resA.metricsBefore.aiLikelihood}% | ${resA.metricsAfter.aiLikelihood}% | **▼ -${dropA}%** |`
    );

    // Benchmark Pipeline B (Watermark Scrubber)
    const resB = watermarkScrubberPipeline(sampleText);
    const metricsBeforeB = analyzeTextInspector(sampleText);
    const metricsAfterB = analyzeTextInspector(resB.output);
    const throughputB = Math.round((wordCount / (resB.executionTimeMs || 0.001)) * 1000);
    const dropB = metricsBeforeB.aiLikelihood - metricsAfterB.aiLikelihood;

    console.log(
      `| ${size.toLocaleString()} words | Watermark Scrubber | ${resB.executionTimeMs.toFixed(2)} ms | ${throughputB.toLocaleString()} w/s | ${metricsBeforeB.aiLikelihood}% | ${metricsAfterB.aiLikelihood}% | ▼ -${dropB}% |`
    );
    console.log('| --- | --- | --- | --- | --- | --- | --- |');
  }

  console.log('\n==================================================');
  console.log('✅ BENCHMARK COMPLETE');
  console.log('==================================================');
}

runPipelineBenchmark();
