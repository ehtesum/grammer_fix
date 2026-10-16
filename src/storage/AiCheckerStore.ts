export interface SentenceAnalysis {
  id: string;
  page: number;
  sentenceIndex: number;
  text: string;
  probability: number;
  confidence: 'high' | 'moderate' | 'low';
  signals: string[];
}

export interface AnalysisResult {
  overallScore: number;
  highConfidence: number;
  moderateConfidence: number;
  unflagged: number;
  wordCount: number;
  sentenceCount: number;
  pageCount: number;
  sentences: SentenceAnalysis[];
  timestamp: string;
  provider: string;
  model: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  label: string;
  timestamp: string;
  score: number;
  text: string;
  wordCount: number;
}

export interface DocumentCheck {
  id: string;
  filename: string;
  fileType: string;

  original: {
    text: string;
    wordCount: number;
    sentenceCount: number;
    pageCount: number;
    analysis: AnalysisResult;
    createdAt: string;
  };

  edited: {
    text: string;
    wordCount: number;
    sentenceCount: number;
    pageCount: number;
    analysis: AnalysisResult;
    updatedAt: string;
  };

  versions: DocumentVersion[];
  provider: string;
  status: 'analyzing' | 'ready' | 'error';
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'omniwrite_ai_checker';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class AiCheckerStore {
  static async saveCheck(check: DocumentCheck): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(check);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getCheck(id: string): Promise<DocumentCheck | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  static async getAllChecks(): Promise<DocumentCheck[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  static async deleteCheck(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async clearAllChecks(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
