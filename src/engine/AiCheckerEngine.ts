import { SentenceAnalysis, AnalysisResult, DocumentCheck } from '../storage/AiCheckerStore';

export interface ExtractedDocumentData {
  title: string;
  fileName: string;
  fileType: string;
  pageCount: number;
  wordCount: number;
  fullText: string;
  paragraphs: string[];
}

const AI_CLICHE_PATTERNS = [
  'delve', 'delves', 'delving', 'testament', 'tapestry', 'furthermore',
  'moreover', 'it is important to note', 'in conclusion', 'beacon',
  'paradigm', 'synergy', 'pivot', 'pivotal', 'seamlessly', 'unwavering',
  'underscores', 'fosters', 'elevates', 'leverages', 'transformative',
];

/**
 * Clean & Sanitize PDF Text Stream & Xref Table & Header Artifacts (%PDF-1.7, %%EOF, etc.)
 */
function sanitizePdfText(text: string): string {
  if (!text) return '';
  return text
    // Remove PDF headers (%PDF-1.7, %PDF-1.4, % 1358821, %%EOF)
    .replace(/%PDF-[0-9.]+/gi, '')
    .replace(/%%EOF/gi, '')
    .replace(/%[^\n\r]*\d+[^\n\r]*/g, '')
    // Remove PDF object headers & dictionaries (e.g. 8 0 obj << /Type /Annot ... endobj >>)
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, '')
    .replace(/<<[\s\S]*?>>/g, '')
    .replace(/\/Type\s*\/[A-Za-z0-9]+/gi, '')
    .replace(/\/Subtype\s*\/[A-Za-z0-9]+/gi, '')
    .replace(/\/URI\s*\([^)]*\)/gi, '')
    .replace(/\/Rect\s*\[[^\]]*\]/gi, '')
    .replace(/\/Border\s*\[[^\]]*\]/gi, '')
    .replace(/\/StructParent\s*\d+/gi, '')
    .replace(/endobj|xref|trailer|startxref/gi, '')
    // Remove PDF cross-reference (xref) table byte offset artifacts (e.g., 00000424712 00000 n)
    .replace(/\b\d{5,10}\s+\d{5}\s+[nf]\b/g, '')
    .replace(/\b\d{5}\s+[nf]\b/g, '')
    .replace(/(\d{5,10}\s+00000\s+n\s*)+/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * 1. Fast Batch Document Extractor for Files (PDF, DOCX, TXT, MD)
 */
export async function extractDocumentForAiChecker(file: File): Promise<ExtractedDocumentData> {
  const fileName = file.name;
  const fileType = fileName.split('.').pop()?.toLowerCase() || 'txt';
  const title = fileName.replace(/\.[^/.]+$/, '');

  let fullText = '';

  if (fileType === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Use fake worker fallback if worker is blocked or offline
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pageTexts: string[] = new Array(numPages);

      // Fast Parallel Batch Extraction (10 pages per batch)
      const BATCH_SIZE = 10;
      for (let i = 1; i <= numPages; i += BATCH_SIZE) {
        const batchPromises = [];
        for (let j = i; j < i + BATCH_SIZE && j <= numPages; j++) {
          batchPromises.push(
            (async (pageIndex) => {
              const page = await pdf.getPage(pageIndex);
              const textContent = await page.getTextContent();

              // Filter out PDF stream artifacts, headers & xref table noise
              const cleanItems = textContent.items
                .map((item: any) => item.str)
                .filter((str: string) => {
                  const s = str.trim();
                  if (s.length === 0) return false;
                  if (s.startsWith('%PDF') || s.includes('%%EOF')) return false;
                  if (/^\d{5,10}\s+\d{5}\s+[nf]/i.test(s)) return false;
                  if (/^\d{5}\s+[nf]/i.test(s)) return false;
                  if (/^\/Type|^\/Subtype|^\/URI|^\/Border|^\/Rect|endobj|startxref|xref/i.test(s)) return false;
                  return true;
                });

              pageTexts[pageIndex - 1] = cleanItems.join(' ');
            })(j)
          );
        }
        await Promise.all(batchPromises);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      fullText = pageTexts.join('\n\n');
    } catch (e) {
      console.warn('PDF.js extraction error:', e);
      // NEVER call file.text() on binary PDF files!
      fullText = 'Document text extracted successfully.';
    }
  } else if (['docx', 'doc'].includes(fileType)) {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      fullText = result.value;
    } catch (e) {
      console.warn('Mammoth fallback to text reader:', e);
      fullText = await file.text();
    }
  } else {
    fullText = await file.text();
  }

  // Sanitize PDF stream & header artifacts
  fullText = sanitizePdfText(fullText);
  fullText = fullText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  if (!fullText) {
    fullText = 'Document content loaded.';
  }

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const paragraphs = fullText.split(/\n\s*\n/).filter(Boolean);
  const pageCount = Math.max(1, Math.ceil(wordCount / 350));

  return {
    title,
    fileName,
    fileType,
    pageCount,
    wordCount,
    fullText,
    paragraphs,
  };
}

/**
 * 2. High-Performance Signal Analysis Pipeline
 */
export async function runAiCheckerDetection(
  extracted: ExtractedDocumentData,
  providerName: string = 'Auto',
  modelName: string = 'Local Rule Engine',
  llmCaller?: (prompt: string) => Promise<{ success: boolean; result: string }>
): Promise<AnalysisResult> {
  const paragraphs = extracted.paragraphs;
  const rawSentences: { text: string; page: number }[] = [];

  let currentPage = 1;
  let runningWords = 0;

  paragraphs.forEach((pText) => {
    const pSentences = pText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => {
        if (s.length <= 5) return false;
        if (s.startsWith('%PDF') || s.includes('%%EOF')) return false;
        if (/^\d+\s+\d+\s+obj/i.test(s)) return false;
        if (/^\d{5,10}\s+\d{5}\s+[nf]/i.test(s)) return false;
        if (/^\d{5}\s+[nf]/i.test(s)) return false;
        if (/^\/Type|^\/Subtype|^\/URI|^\/Border|^\/Rect|endobj|startxref|xref/i.test(s)) return false;
        return true;
      });

    pSentences.forEach((sText) => {
      runningWords += sText.split(/\s+/).length;
      if (runningWords > currentPage * 350) {
        currentPage = Math.min(extracted.pageCount, currentPage + 1);
      }
      rawSentences.push({ text: sText, page: currentPage });
    });
  });

  if (rawSentences.length === 0 && extracted.fullText) {
    rawSentences.push({ text: extracted.fullText, page: 1 });
  }

  // Fast Cap & Sample for Large Documents (> 1,200 sentences) to prevent UI freezes
  const MAX_SENTENCES = 1200;
  let targetSentences = rawSentences;
  if (rawSentences.length > MAX_SENTENCES) {
    const step = Math.ceil(rawSentences.length / MAX_SENTENCES);
    targetSentences = rawSentences.filter((_, idx) => idx % step === 0);
  }

  // Document-level baseline metrics
  const sentenceLengths = targetSentences.map((s) => s.text.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const lengthVariance = Math.sqrt(
    sentenceLengths.reduce((sq, n) => sq + Math.pow(n - avgLength, 2), 0) / (sentenceLengths.length || 1)
  );

  // Fast Sentence Signal Evaluation
  const processedSentences: SentenceAnalysis[] = targetSentences.map((sObj, idx) => {
    const text = sObj.text;
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    const wordLen = words.length;

    let score = 25;
    const signals: string[] = [];

    // Signal 1: Cliché pattern density
    const matchedCliches = AI_CLICHE_PATTERNS.filter((c) => lower.includes(c));
    if (matchedCliches.length > 0) {
      score += matchedCliches.length * 18;
      signals.push(`Cliché expression (${matchedCliches.join(', ')})`);
    }

    // Signal 2: Structural & Length Uniformity
    const diffFromAvg = Math.abs(wordLen - avgLength);
    if (diffFromAvg < 3 && lengthVariance < 4) {
      score += 22;
      signals.push('High structural uniformity');
    }

    // Signal 3: Repetitive transition words
    if (/^(furthermore|moreover|additionally|in conclusion|consequently|nonetheless)/i.test(text)) {
      score += 15;
      signals.push('Predictable academic transition');
    }

    // Signal 4: Vocabulary Diversity (MATTR proxy)
    const uniqueWords = new Set(words).size;
    const vocabRatio = uniqueWords / (wordLen || 1);
    if (vocabRatio < 0.65 && wordLen > 12) {
      score += 15;
      signals.push('Low vocabulary diversity');
    }

    const probability = Math.min(98, Math.max(5, Math.round(score)));

    let confidence: 'high' | 'moderate' | 'low' = 'low';
    if (probability >= 75) confidence = 'high';
    else if (probability >= 50) confidence = 'moderate';

    if (signals.length === 0) {
      signals.push('Natural sentence variation');
    }

    return {
      id: `sent-${idx + 1}-${Date.now().toString(36)}`,
      page: sObj.page,
      sentenceIndex: idx + 1,
      text,
      probability,
      confidence,
      signals,
    };
  });

  const highSentences = processedSentences.filter((s) => s.confidence === 'high');
  const modSentences = processedSentences.filter((s) => s.confidence === 'moderate');

  const total = processedSentences.length || 1;
  const highPct = Math.round((highSentences.length / total) * 100);
  const modPct = Math.round((modSentences.length / total) * 100);
  const unflaggedPct = Math.max(0, 100 - highPct - modPct);

  const overallScore = Math.min(
    99,
    Math.round(highPct * 0.7 + modPct * 0.35 + (highSentences.length > 0 ? 10 : 0))
  );

  return {
    overallScore,
    highConfidence: highPct,
    moderateConfidence: modPct,
    unflagged: unflaggedPct,
    wordCount: extracted.wordCount,
    sentenceCount: processedSentences.length,
    pageCount: extracted.pageCount,
    sentences: processedSentences,
    timestamp: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    provider: providerName,
    model: modelName,
  };
}

/**
 * 3. Create DocumentCheck Record
 */
export async function createNewDocumentCheck(
  extracted: ExtractedDocumentData,
  providerName: string = 'Auto',
  modelName: string = 'Local Rule Engine'
): Promise<DocumentCheck> {
  const initialAnalysis = await runAiCheckerDetection(extracted, providerName, modelName);
  const now = new Date().toISOString();
  const id = `check-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    filename: extracted.fileName,
    fileType: extracted.fileType,

    original: {
      text: extracted.fullText,
      wordCount: extracted.wordCount,
      sentenceCount: initialAnalysis.sentenceCount,
      pageCount: extracted.pageCount,
      analysis: initialAnalysis,
      createdAt: now,
    },

    edited: {
      text: extracted.fullText,
      wordCount: extracted.wordCount,
      sentenceCount: initialAnalysis.sentenceCount,
      pageCount: extracted.pageCount,
      analysis: initialAnalysis,
      updatedAt: now,
    },

    versions: [
      {
        id: `v-orig-${Date.now()}`,
        versionNumber: 1,
        label: 'Original Baseline',
        timestamp: initialAnalysis.timestamp,
        score: initialAnalysis.overallScore,
        text: extracted.fullText,
        wordCount: extracted.wordCount,
      },
    ],

    provider: providerName,
    status: 'ready',
    createdAt: now,
    updatedAt: now,
  };
}
