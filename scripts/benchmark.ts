import { analyzeGrammar } from '../src/engine/GrammarEngine';
import { analyzeSpelling } from '../src/engine/SpellChecker';
import { analyzeConciseness } from '../src/engine/ConcisenessEngine';
import { analyzeVocabulary } from '../src/engine/VocabularyEngine';
import { analyzeReadability } from '../src/engine/ReadabilityEngine';
import { analyzeTone } from '../src/engine/ToneEngine';
import { calculateWritingScore } from '../src/engine/ScoreEngine';

// Sample paragraph with deliberate issues
const SAMPLE_PARAGRAPH = `This is a example document for demonstrating the WriteWise writing assistant. The system analyze your writing in real time and give you suggestions for improving grammar, spelling and clarity. Yesterday I go to the university and meet with my professor. We discussed about the project and he give me some useful advices. The system is very good and works very fast due to the fact that at this point in time a large number of tests were executed. Yesterday I meet with two book author who had recieved great feedback. `;

function generateLargeText(targetWordCount: number): string {
  const words = SAMPLE_PARAGRAPH.split(/\s+/);
  const repetitions = Math.ceil(targetWordCount / words.length);
  let result = '';
  for (let i = 0; i < repetitions; i++) {
    result += SAMPLE_PARAGRAPH + '\n\n';
  }
  return result;
}

function runBenchmark(wordTarget: number) {
  const text = generateLargeText(wordTarget);
  const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const actualWordCount = words.length;

  console.log(`\n==================================================`);
  console.log(`⚡ WRITEWISE NLP ENGINE BENCHMARK`);
  console.log(`==================================================`);
  console.log(`Document Size: ${actualWordCount.toLocaleString()} words (${text.length.toLocaleString()} characters)`);
  console.log(`--------------------------------------------------`);

  const t0 = performance.now();
  const grammarIssues = analyzeGrammar(text);
  const t1 = performance.now();

  const spellingIssues = analyzeSpelling(text, ['WriteWise']);
  const t2 = performance.now();

  const concisenessIssues = analyzeConciseness(text);
  const t3 = performance.now();

  const vocabIssues = analyzeVocabulary(text);
  const t4 = performance.now();

  const readability = analyzeReadability(text);
  const t5 = performance.now();

  const tone = analyzeTone(text);
  const t6 = performance.now();

  const allIssues = [...grammarIssues, ...spellingIssues, ...concisenessIssues, ...vocabIssues];
  const score = calculateWritingScore(allIssues, readability);
  const t7 = performance.now();

  const totalTime = t7 - t0;
  const grammarTime = t1 - t0;
  const spellingTime = t2 - t1;
  const concisenessTime = t3 - t2;
  const vocabTime = t4 - t3;
  const readabilityTime = t5 - t4;
  const toneTime = t6 - t5;
  const scoreTime = t7 - t6;

  console.log(`• Grammar Analysis:       ${grammarTime.toFixed(2)} ms (${grammarIssues.length} issues)`);
  console.log(`• Spelling Analysis:      ${spellingTime.toFixed(2)} ms (${spellingIssues.length} issues)`);
  console.log(`• Conciseness Analysis:   ${concisenessTime.toFixed(2)} ms (${concisenessIssues.length} issues)`);
  console.log(`• Vocabulary Analysis:    ${vocabTime.toFixed(2)} ms (${vocabIssues.length} issues)`);
  console.log(`• Readability Analysis:   ${readabilityTime.toFixed(2)} ms (Score: ${readability.fleschScore})`);
  console.log(`• Tone Analysis:          ${toneTime.toFixed(2)} ms (${tone.dominantTone})`);
  console.log(`• Writing Score Calc:     ${scoreTime.toFixed(2)} ms (Overall: ${score.overall})`);
  console.log(`--------------------------------------------------`);
  console.log(`🚀 TOTAL PIPELINE LATENCY: ${totalTime.toFixed(2)} ms`);
  console.log(`⚡ THROUGHPUT:              ${Math.round((actualWordCount / totalTime) * 1000).toLocaleString()} words/sec`);
  console.log(`==================================================\n`);
}

// Execute benchmark for 2,000 words, 5,000 words, and 10,000 words
runBenchmark(2000);
runBenchmark(5000);
runBenchmark(10000);
