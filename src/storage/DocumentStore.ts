import { DocumentData } from '../engine/types';

const INITIAL_DEMO_DOC: DocumentData = {
  id: 'demo-doc-1',
  title: 'Demo Document',
  content: `This is a example document for demonstrating the WriteWise writing assistant. The system analyze your writing in real time and give you suggestions for improving grammar, spelling and clarity.

Yesterday I go to the university and meet with my professor. We discussed about the project and he give me some useful advices.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'writewise_documents_v1';

export class DocumentStore {
  public static getDocuments(): DocumentData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Save initial demo document
        const initialList = [INITIAL_DEMO_DOC];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
        return initialList;
      }
      return JSON.parse(raw);
    } catch {
      return [INITIAL_DEMO_DOC];
    }
  }

  public static getDocument(id: string): DocumentData | null {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || null;
  }

  public static saveDocument(doc: DocumentData): void {
    const docs = this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      docs[index] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }

  public static createDocument(title: string = 'Untitled Document', content: string = ''): DocumentData {
    const newDoc: DocumentData = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveDocument(newDoc);
    return newDoc;
  }

  public static deleteDocument(id: string): void {
    const docs = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }
}
