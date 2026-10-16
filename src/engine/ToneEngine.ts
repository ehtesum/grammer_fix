import { ToneMetrics } from './types';

const PROF_WORDS = new Set(['system', 'analysis', 'project', 'research', 'demonstrate', 'performance', 'efficiency', 'results', 'data', 'implementation', 'professor', 'university', 'report', 'application', 'structure']);
const FRIENDLY_WORDS = new Set(['hello', 'hi', 'welcome', 'thanks', 'thank', 'great', 'awesome', 'friendly', 'happy', 'help', 'pleasure', 'nice', 'useful']);
const CONFIDENT_WORDS = new Set(['definitely', 'certainly', 'proven', 'strong', 'ensure', 'guarantee', 'will', 'must', 'clearly', 'excellent']);
const FORMAL_WORDS = new Set(['furthermore', 'nevertheless', 'consequently', 'accordingly', 'therefore', 'regarding', 'discuss', 'advise', 'proceed']);
const CASUAL_WORDS = new Set(['hey', 'yeah', 'cool', 'stuff', 'guy', 'guys', 'gonna', 'wanna', 'anyway']);

export function analyzeTone(text: string): ToneMetrics {
  const words = (text.toLowerCase().match(/\b[a-z]+\b/g) || []);
  const total = Math.max(1, words.length);

  let profCount = 0;
  let friendCount = 0;
  let confCount = 0;
  let formalCount = 0;
  let casualCount = 0;

  for (const w of words) {
    if (PROF_WORDS.has(w)) profCount++;
    if (FRIENDLY_WORDS.has(w)) friendCount++;
    if (CONFIDENT_WORDS.has(w)) confCount++;
    if (FORMAL_WORDS.has(w)) formalCount++;
    if (CASUAL_WORDS.has(w)) casualCount++;
  }

  // Base normalization
  const baseFactor = 15;
  const professional = Math.min(95, Math.max(35, Math.round(50 + (profCount / total) * 100 * baseFactor)));
  const friendly = Math.min(95, Math.max(20, Math.round(40 + (friendCount / total) * 100 * baseFactor)));
  const confident = Math.min(95, Math.max(30, Math.round(45 + (confCount / total) * 100 * baseFactor)));
  const formal = Math.min(95, Math.max(30, Math.round(45 + (formalCount / total) * 100 * baseFactor)));
  const casual = Math.min(95, Math.max(10, Math.round(20 + (casualCount / total) * 100 * baseFactor)));
  const neutral = Math.max(20, 100 - Math.round((professional + formal) / 2));

  // Determine dominant tone
  const scores = [
    { name: 'Professional', score: professional },
    { name: 'Formal', score: formal },
    { name: 'Confident', score: confident },
    { name: 'Friendly', score: friendly },
    { name: 'Casual', score: casual },
  ];
  scores.sort((a, b) => b.score - a.score);

  return {
    professional,
    friendly,
    confident,
    formal,
    casual,
    neutral,
    dominantTone: scores[0].name,
  };
}
