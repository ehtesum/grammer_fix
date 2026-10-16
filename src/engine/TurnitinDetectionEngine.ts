import { analyzeTextInspector, AI_PHRASE_MAP } from './TextInspectorEngine';
import { extractTextFromFile } from '../utils/DocumentExtractor';

export interface NormalizedSentenceResult {
  id: string;
  text: string;
  page: number;
  paragraph: number;
  aiProbability: number; // 0 - 100%
  confidence: 'low' | 'moderate' | 'high';
  markers: string[];
}

export interface TurnitinReportData {
  id: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'other';
  uploadDate: string;
  wordCount: number;
  pageCount: number;
  overallScore: number; // 0 - 100%
  highConfidence: number; // %
  moderateConfidence: number; // %
  unflagged: number; // %
  model: string;
  provider: string;
  sentences: NormalizedSentenceResult[];
  fullText: string;
  status: 'Completed' | 'Analyzing' | 'Failed';
  errorMessage?: string;
}

export interface ExtractedDocumentData {
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'other';
  pageCount: number;
  wordCount: number;
  fullText: string;
  paragraphs: string[];
}

/**
 * Provider-Independent Document Extraction Service
 */
export async function extractDocumentForTurnitin(file: File): Promise<ExtractedDocumentData> {
  const fullText = await extractTextFromFile(file);

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  let fileType: 'pdf' | 'docx' | 'txt' | 'other' = 'other';
  if (fileExt === 'pdf') fileType = 'pdf';
  else if (fileExt === 'docx' || fileExt === 'doc') fileType = 'docx';
  else if (fileExt === 'txt' || fileExt === 'md') fileType = 'txt';

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  // Split into paragraphs by double newlines or single newlines
  const paragraphs = fullText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Estimate page count: ~350 words per page for PDF, or 1 for small text
  const estimatedPages = fileType === 'pdf' ? Math.max(1, Math.ceil(wordCount / 350)) : Math.max(1, Math.ceil(wordCount / 400));

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    fileName: file.name,
    fileType,
    pageCount: estimatedPages,
    wordCount,
    fullText,
    paragraphs: paragraphs.length > 0 ? paragraphs : [fullText],
  };
}

/**
 * Normalized AI Detection Engine
 */
export async function runTurnitinDetection(
  extractedDoc: ExtractedDocumentData,
  selectedModel: string,
  generateTextFn?: (prompt: string) => Promise<{ success: boolean; result: string; message?: string }>
): Promise<TurnitinReportData> {
  const reportId = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const sentencesList: NormalizedSentenceResult[] = [];
  let sIdCounter = 1;

  let currentWordCount = 0;
  const wordsPerPage = Math.max(1, Math.ceil(extractedDoc.wordCount / extractedDoc.pageCount));

  extractedDoc.paragraphs.forEach((pText, pIndex) => {
    // Segment paragraph into sentences
    const rawSentences = pText.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);

    rawSentences.forEach((sText) => {
      const trimmed = sText.trim();
      const sWords = trimmed.split(/\s+/).filter(Boolean);
      currentWordCount += sWords.length;

      const pageNum = Math.min(extractedDoc.pageCount, Math.max(1, Math.ceil(currentWordCount / wordsPerPage)));

      // Analyze sentence signals using local inspector engine rules
      const sMetrics = analyzeTextInspector(trimmed);
      let aiProb = sMetrics.aiLikelihood;
      const markers: string[] = [];

      // Check for specific markers
      const lower = trimmed.toLowerCase();

      if (trimmed.length > 90 && sMetrics.structuralUniformity > 75) {
        markers.push('High linguistic uniformity');
      }
      if (sMetrics.vocabDiversity < 65) {
        markers.push('Predictable sentence structure');
      }

      // Check cliché phrases
      let foundCliche = false;
      const clicheEntries = Object.entries(AI_PHRASE_MAP);
      for (const [aiPhrase] of clicheEntries) {
        if (lower.includes(aiPhrase)) {
          foundCliche = true;
          markers.push(`Cliché expression: "${aiPhrase}"`);
          break;
        }
      }

      if (foundCliche) {
        aiProb = Math.min(98, aiProb + 30);
      }

      let confidence: 'low' | 'moderate' | 'high' = 'low';
      if (aiProb >= 75) confidence = 'high';
      else if (aiProb >= 50) confidence = 'moderate';

      if (markers.length === 0) {
        if (confidence === 'high') markers.push('Formulaic phrasing pattern');
        else if (confidence === 'moderate') markers.push('Repetitive structural rhythm');
        else markers.push('Natural sentence rhythm');
      }

      sentencesList.push({
        id: `s-${sIdCounter++}`,
        text: trimmed,
        page: pageNum,
        paragraph: pIndex + 1,
        aiProbability: aiProb,
        confidence,
        markers,
      });
    });
  });

  // Calculate Overall Document Metrics
  const totalSentences = Math.max(1, sentencesList.length);
  const highCount = sentencesList.filter((s) => s.confidence === 'high').length;
  const modCount = sentencesList.filter((s) => s.confidence === 'moderate').length;
  const lowCount = sentencesList.filter((s) => s.confidence === 'low').length;

  const highPct = Math.round((highCount / totalSentences) * 100);
  const modPct = Math.round((modCount / totalSentences) * 100);
  const unflaggedPct = Math.max(0, 100 - highPct - modPct);

  // Overall Document Score calculation
  const overallMetrics = analyzeTextInspector(extractedDoc.fullText);
  let overallScore = Math.round(highPct * 0.7 + modPct * 0.3 + overallMetrics.aiLikelihood * 0.3);
  overallScore = Math.min(98, Math.max(4, overallScore));

  const providerName = selectedModel.includes('/') ? selectedModel.split('/')[0].toUpperCase() : 'OLLAMA';

  return {
    id: reportId,
    filename: extractedDoc.fileName,
    fileType: extractedDoc.fileType,
    uploadDate: dateStr,
    wordCount: extractedDoc.wordCount,
    pageCount: extractedDoc.pageCount,
    overallScore,
    highConfidence: highPct,
    moderateConfidence: modPct,
    unflagged: unflaggedPct,
    model: selectedModel,
    provider: providerName,
    sentences: sentencesList,
    fullText: extractedDoc.fullText,
    status: 'Completed',
  };
}
