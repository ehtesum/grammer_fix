import React, { useState, useEffect, useCallback } from 'react';
import { OllamaProvider } from './engine/OllamaContext';
import { GlobalHeader } from './components/Header/GlobalHeader';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { WriteWisePage } from './pages/WriteWise/WriteWisePage';
import { ParaphrasePage } from './pages/Paraphrase/ParaphrasePage';
import { InspectorPage } from './pages/Inspector/InspectorPage';
import { AiCheckerPage } from './pages/AiChecker/AiCheckerPage';
import { LatexStudioPage } from './pages/LatexStudio/LatexStudioPage';
import { ResumePage } from './pages/ResumeAnalyzer/ResumePage';
import { DocumentHubPage } from './pages/Documents/DocumentHubPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { PrivacyModal } from './components/Privacy/PrivacyModal';
import { DocumentData, Issue, ReadabilityMetrics, ToneMetrics, UserSettings, WritingScore } from './engine/types';
import { DocumentStore } from './storage/DocumentStore';
import { DictionaryStore } from './storage/DictionaryStore';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en-US',
  autoSave: true,
  checkWhileTyping: true,
  sensitivity: 'medium',
  writingDomain: 'general',
  enabledRules: {
    grammar: true,
    spelling: true,
    punctuation: true,
    clarity: true,
    conciseness: true,
    vocabulary: true,
  },
  localAiEndpoint: 'http://127.0.0.1:11434',
};

export const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocumentData | null>(null);

  const [customDictionary, setCustomDictionary] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  const [readability, setReadability] = useState<ReadabilityMetrics>({
    fleschScore: 100,
    readingLevel: 'Easy',
    avgSentenceLength: 0,
    avgWordLength: 0,
    sentenceCount: 0,
    wordCount: 0,
    charCount: 0,
  });

  const [tone, setTone] = useState<ToneMetrics>({
    professional: 80,
    friendly: 70,
    confident: 75,
    formal: 85,
    casual: 20,
    neutral: 50,
    dominantTone: 'Professional',
  });

  const [score, setScore] = useState<WritingScore>({
    overall: 100,
    correctness: 100,
    clarity: 100,
    engagement: 100,
    delivery: 100,
    label: 'Great writing',
  });

  // Load documents and settings on boot
  useEffect(() => {
    const docs = DocumentStore.getDocuments();
    setDocuments(docs);
    if (docs.length > 0) {
      setCurrentDoc(docs[0]);
    }
    setCustomDictionary(DictionaryStore.getWords());
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!currentDoc) return;

      const updatedDoc = {
        ...currentDoc,
        content: newContent,
        updatedAt: new Date().toISOString(),
      };

      setCurrentDoc(updatedDoc);

      if (settings.autoSave) {
        DocumentStore.saveDocument(updatedDoc);
        setDocuments(DocumentStore.getDocuments());
      }
    },
    [currentDoc, settings.autoSave]
  );

  const handleAnalysisUpdate = useCallback(
    (data: { issues: Issue[]; readability: ReadabilityMetrics; tone: ToneMetrics; score: WritingScore }) => {
      setIssues(data.issues);
      setReadability(data.readability);
      setTone(data.tone);
      setScore(data.score);
    },
    []
  );

  const handleAcceptIssue = (issue: Issue) => {
    if (!currentDoc) return;

    const text = currentDoc.content;
    const before = text.slice(0, issue.from);
    const after = text.slice(issue.to);
    const newContent = before + issue.replacement + after;

    handleContentChange(newContent);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
    setActiveIssueId(null);
  };

  const handleAcceptAllIssues = () => {
    if (!currentDoc || issues.length === 0) return;
    let text = currentDoc.content;

    // Filter out overlapping issues to prevent text corruption
    const nonOverlapping: Issue[] = [];
    const sorted = [...issues].sort((a, b) => a.from - b.from);
    let lastEnd = -1;

    for (const iss of sorted) {
      if (iss.from >= lastEnd) {
        nonOverlapping.push(iss);
        lastEnd = iss.to;
      }
    }

    // Apply non-overlapping issues in reverse order (right-to-left) so indexes remain accurate
    const reverseSorted = [...nonOverlapping].sort((a, b) => b.from - a.from);
    for (const iss of reverseSorted) {
      if (text.slice(iss.from, iss.to) === iss.original) {
        const before = text.slice(0, iss.from);
        const after = text.slice(iss.to);
        text = before + iss.replacement + after;
      }
    }

    handleContentChange(text);
    setIssues([]);
    setActiveIssueId(null);
  };

  const handleIgnoreIssue = (issue: Issue) => {
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
    if (activeIssueId === issue.id) {
      setActiveIssueId(null);
    }
  };

  const handleAddToDictionary = (word: string) => {
    const updated = DictionaryStore.addWord(word);
    setCustomDictionary(updated);
  };

  const handleCreateDocument = () => {
    const newDoc = DocumentStore.createDocument('Untitled Document', '');
    setDocuments(DocumentStore.getDocuments());
    setCurrentDoc(newDoc);
    setCurrentRoute('writewise');
  };

  const handleDeleteDocument = (id: string) => {
    DocumentStore.deleteDocument(id);
    const updatedDocs = DocumentStore.getDocuments();
    setDocuments(updatedDocs);
    if (currentDoc?.id === id) {
      setCurrentDoc(updatedDocs.length > 0 ? updatedDocs[0] : null);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans dark:bg-slate-950">
      {/* Suite Global Header */}
      <GlobalHeader
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenPrivacyModal={() => setShowPrivacyModal(true)}
      />

      {/* Main Suite Route Switcher */}
      <div className="flex flex-1 overflow-hidden">
        {currentRoute === 'dashboard' && (
          <DashboardPage
            documents={documents}
            onNavigate={(route) => setCurrentRoute(route)}
            onOpenDocument={(doc) => {
              setCurrentDoc(doc);
              setCurrentRoute('writewise');
            }}
            onCreateDocument={handleCreateDocument}
          />
        )}

        {currentRoute === 'writewise' && (
          <WriteWisePage
            currentDocument={currentDoc}
            customDictionary={customDictionary}
            settings={settings}
            issues={issues}
            score={score}
            readability={readability}
            tone={tone}
            activeIssueId={activeIssueId}
            onAnalysisUpdate={handleAnalysisUpdate}
            onContentChange={handleContentChange}
            onSelectIssueId={(id) => setActiveIssueId(id)}
            onAcceptIssue={handleAcceptIssue}
            onAcceptAllIssues={handleAcceptAllIssues}
            onIgnoreIssue={handleIgnoreIssue}
            onAddToDictionary={handleAddToDictionary}
          />
        )}

        {currentRoute === 'paraphrase' && <ParaphrasePage />}
        {currentRoute === 'inspector' && <InspectorPage />}
        {currentRoute === 'turnitin-detector' && (
          <AiCheckerPage
            onNavigateHome={() => setCurrentRoute('dashboard')}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentRoute === 'latex-studio' && <LatexStudioPage />}
        {currentRoute === 'resume-analyzer' && <ResumePage />}
        {currentRoute === 'documents' && (
          <DocumentHubPage
            documents={documents}
            onOpenDocument={(doc) => {
              setCurrentDoc(doc);
              setCurrentRoute('writewise');
            }}
            onCreateDocument={handleCreateDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
        {currentRoute === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={(s) => setSettings(s)}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <OllamaProvider>
      <AppContent />
    </OllamaProvider>
  );
};
