import { analyzeGrammar } from '../src/engine/GrammarEngine';
import { analyzeSpelling } from '../src/engine/SpellChecker';
import { analyzeConciseness } from '../src/engine/ConcisenessEngine';
import { analyzeVocabulary } from '../src/engine/VocabularyEngine';
import { analyzeReadability } from '../src/engine/ReadabilityEngine';
import { analyzeTone } from '../src/engine/ToneEngine';
import { calculateWritingScore } from '../src/engine/ScoreEngine';
import { analyzeAtsScore } from '../src/engine/AtsEngine';
import { Issue } from '../src/engine/types';

interface StressTestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  wordCount: number;
  memoryUsedMb: number;
  details: string;
  bugsFound: string[];
}

const results: StressTestResult[] = [];

function getMemoryMb(): number {
  return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
}

console.log(`\n==================================================`);
console.log(`🔬 WRITEWISE STRESS TEST & SIMULATION SUITE`);
console.log(`==================================================\n`);

// ---------------------------------------------------------
// TEST 1: Massive Document Stress Test (50,000 words)
// ---------------------------------------------------------
function testMassiveDocument() {
  const basePara = `This is a example document for testing WriteWise. The system analyze text in real time and give suggestions for improving grammar, spelling and clarity. Yesterday I go to the university and meet with my professor. We discussed about the project and he give me some useful advices. Worked on several systems, helped with research, responsible for code review. Very good results due to the fact that at this point in time many team players worked. `;
  
  // Repeat to reach ~50,000 words
  const wordsPerPara = basePara.split(/\s+/).length;
  const repeats = Math.ceil(50000 / wordsPerPara);
  const text = basePara.repeat(repeats);
  const actualWords = text.split(/\s+/).length;

  const bugs: string[] = [];
  const startMem = getMemoryMb();
  const t0 = performance.now();

  try {
    const gram = analyzeGrammar(text);
    const spell = analyzeSpelling(text, ['WriteWise']);
    const concise = analyzeConciseness(text);
    const vocab = analyzeVocabulary(text);
    const read = analyzeReadability(text);
    const tone = analyzeTone(text);
    const allIssues = [...gram, ...spell, ...concise, ...vocab];
    const score = calculateWritingScore(allIssues, read);
    const ats = analyzeAtsScore(text);

    // Validate index boundaries
    for (const iss of allIssues) {
      if (iss.from < 0 || iss.to > text.length || iss.from > iss.to) {
        bugs.push(`Index out of bounds in issue ${iss.id}: from=${iss.from}, to=${iss.to}, textLen=${text.length}`);
      }
    }

    const t1 = performance.now();
    const endMem = getMemoryMb();

    results.push({
      name: '50,000 Word Massive Document Test',
      passed: bugs.length === 0,
      durationMs: t1 - t0,
      wordCount: actualWords,
      memoryUsedMb: endMem - startMem,
      details: `Processed ${actualWords.toLocaleString()} words & ${allIssues.length.toLocaleString()} issues in ${(t1 - t0).toFixed(2)} ms`,
      bugsFound: bugs,
    });
  } catch (e: any) {
    results.push({
      name: '50,000 Word Massive Document Test',
      passed: false,
      durationMs: 0,
      wordCount: actualWords,
      memoryUsedMb: 0,
      details: `Crash exception: ${e.message}`,
      bugsFound: [e.message],
    });
  }
}

// ---------------------------------------------------------
// TEST 2: High-Frequency Rapid Typing Simulation (1,000 Rapid Updates)
// ---------------------------------------------------------
function testRapidTypingSimulation() {
  const bugs: string[] = [];
  let text = 'This is a example';
  const startMem = getMemoryMb();
  const t0 = performance.now();

  try {
    for (let i = 0; i < 1000; i++) {
      text += ` word ${i}`;
      const gram = analyzeGrammar(text);
      const spell = analyzeSpelling(text);
      const read = analyzeReadability(text);
      const score = calculateWritingScore([...gram, ...spell], read);
      if (score.overall < 0 || score.overall > 100) {
        bugs.push(`Writing score out of 0-100 range: ${score.overall}`);
      }
    }

    const t1 = performance.now();
    const endMem = getMemoryMb();

    results.push({
      name: '1,000 Iteration Rapid Typing Simulation',
      passed: bugs.length === 0,
      durationMs: t1 - t0,
      wordCount: text.split(/\s+/).length,
      memoryUsedMb: endMem - startMem,
      details: `Completed 1,000 consecutive document edits & re-analyses in ${(t1 - t0).toFixed(2)} ms`,
      bugsFound: bugs,
    });
  } catch (e: any) {
    results.push({
      name: '1,000 Iteration Rapid Typing Simulation',
      passed: false,
      durationMs: 0,
      wordCount: 0,
      memoryUsedMb: 0,
      details: `Crash exception: ${e.message}`,
      bugsFound: [e.message],
    });
  }
}

// ---------------------------------------------------------
// TEST 3: Edge Case & Boundary Value Testing
// ---------------------------------------------------------
function testEdgeCases() {
  const bugs: string[] = [];
  const startMem = getMemoryMb();
  const t0 = performance.now();

  const edgeInputs = [
    '', // Empty string
    '   ', // Whitespace only
    '\n\n\n\t\t\t', // Newlines & tabs
    'A'.repeat(10000), // 10,000 char word without spaces
    '🚀🎉🔥 Hello world! 💯✨', // Emojis & Unicode
    '<div><script>alert("test")</script></div>', // HTML/XSS injection string
    '1234567890 !@#$%^&*()_+', // Numbers & symbols only
    'a a a a a a a a a a', // Repetitive single characters
    'Supercalifragilisticexpialidocious', // Very long word
  ];

  for (let idx = 0; idx < edgeInputs.length; idx++) {
    const input = edgeInputs[idx];
    try {
      const gram = analyzeGrammar(input);
      const spell = analyzeSpelling(input);
      const read = analyzeReadability(input);
      const tone = analyzeTone(input);
      const score = calculateWritingScore([...gram, ...spell], read);
      const ats = analyzeAtsScore(input);

      if (isNaN(read.fleschScore)) {
        bugs.push(`NaN detected in Flesch Score for edge case #${idx}`);
      }
      if (isNaN(score.overall)) {
        bugs.push(`NaN detected in Writing Score for edge case #${idx}`);
      }
      if (isNaN(ats.overall)) {
        bugs.push(`NaN detected in ATS Score for edge case #${idx}`);
      }
    } catch (e: any) {
      bugs.push(`Exception on edge input #${idx} ("${input.slice(0, 20)}..."): ${e.message}`);
    }
  }

  const t1 = performance.now();
  const endMem = getMemoryMb();

  results.push({
    name: 'Edge Cases & Malformed Input Test',
    passed: bugs.length === 0,
    durationMs: t1 - t0,
    wordCount: 0,
    memoryUsedMb: endMem - startMem,
    details: `Evaluated ${edgeInputs.length} malformed & extreme edge inputs in ${(t1 - t0).toFixed(2)} ms`,
    bugsFound: bugs,
  });
}

// ---------------------------------------------------------
// TEST 4: Memory Leak & Garbage Collection Check (500 Full Cycles)
// ---------------------------------------------------------
function testMemoryLeak() {
  const bugs: string[] = [];
  const text = SAMPLE_TEXT();
  const initialMem = getMemoryMb();
  const t0 = performance.now();

  for (let i = 0; i < 500; i++) {
    const gram = analyzeGrammar(text);
    const spell = analyzeSpelling(text);
    const read = analyzeReadability(text);
    const tone = analyzeTone(text);
    calculateWritingScore([...gram, ...spell], read);
    analyzeAtsScore(text);
  }

  const t1 = performance.now();
  const finalMem = getMemoryMb();
  const memDiff = finalMem - initialMem;

  if (memDiff > 50) {
    bugs.push(`Potential memory leak detected: Heap grew by ${memDiff.toFixed(2)} MB over 500 cycles`);
  }

  results.push({
    name: 'Memory Leak & Endurance Test (500 cycles)',
    passed: bugs.length === 0,
    durationMs: t1 - t0,
    wordCount: text.split(/\s+/).length,
    memoryUsedMb: memDiff,
    details: `Heap growth: ${memDiff.toFixed(2)} MB over 500 iterations in ${(t1 - t0).toFixed(2)} ms`,
    bugsFound: bugs,
  });
}

function SAMPLE_TEXT() {
  return `This is a example paragraph for memory testing. WriteWise engine analyzes text in real time. Yesterday I go to university and meet with professor. We discussed about the project and he give me useful advices. Worked on several systems, helped with research.`;
}

// Run All Tests
testMassiveDocument();
testRapidTypingSimulation();
testEdgeCases();
testMemoryLeak();

// Print Report Summary
console.log(`--------------------------------------------------`);
console.log(`SUMMARY OF STRESS TEST RESULTS:`);
console.log(`--------------------------------------------------`);
let totalBugs = 0;
for (const r of results) {
  const icon = r.passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`${icon} | ${r.name}`);
  console.log(`   └─ ${r.details}`);
  if (r.bugsFound.length > 0) {
    console.log(`   └─ 🐞 BUGS DETECTED (${r.bugsFound.length}):`);
    for (const b of r.bugsFound) {
      console.log(`       - ${b}`);
    }
    totalBugs += r.bugsFound.length;
  }
}
console.log(`--------------------------------------------------`);
console.log(`Total Bug Count Discovered: ${totalBugs}`);
console.log(`==================================================\n`);
