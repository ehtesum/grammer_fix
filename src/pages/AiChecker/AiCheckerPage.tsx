import React, { useState, useEffect, useRef } from 'react';
import { useOllama } from '../../engine/OllamaContext';
import { AiCheckerStore, DocumentCheck, SentenceAnalysis } from '../../storage/AiCheckerStore';
import {
  extractDocumentForAiChecker,
  runAiCheckerDetection,
  createNewDocumentCheck,
  ExtractedDocumentData,
} from '../../engine/AiCheckerEngine';
import {
  downloadOriginalPdfReport,
  downloadEditedPdfReport,
  downloadCleanPdfDocument,
} from '../../utils/AiCheckerPdfExporter';
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  Lock,
  Cloud,
  X,
  FileCheck,
  ChevronLeft,
  Edit3,
  CheckCircle2,
  BookOpen,
  Sun,
  Moon,
  Save,
  Clock,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const AiCheckerPage: React.FC<{
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}> = ({ onNavigateHome, isDarkMode: externalDarkMode, onToggleTheme: externalToggleTheme }) => {
  const { state: aiState, setApiKey, generateText } = useOllama();

  // Local Theme State with 'dark' default as specified in Rule 3 & 4
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('omniwrite_theme');
    if (saved !== null) return saved === 'dark';
    return true; // Dark mode by default
  });

  const isDark = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode;

  const handleToggleTheme = () => {
    if (externalToggleTheme) {
      externalToggleTheme();
    } else {
      const next = !internalDarkMode;
      setInternalDarkMode(next);
      localStorage.setItem('omniwrite_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Sub-views: 'new-check' | 'submissions' | 'workspace' | 'settings'
  const [activeTab, setActiveTab] = useState<'new-check' | 'submissions' | 'workspace' | 'settings'>('new-check');

  // New Check Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocumentData | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('auto');

  // Submissions Inbox History State
  const [savedChecks, setSavedChecks] = useState<DocumentCheck[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active Workspace Dual Document State
  const [activeCheck, setActiveCheck] = useState<DocumentCheck | null>(null);
  const [liveEditedText, setLiveEditedText] = useState<string>('');
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null);
  const [focusedSentenceId, setFocusedSentenceId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [isReAnalyzing, setIsReAnalyzing] = useState<boolean>(false);

  // Settings State
  const [localOnlyMode, setLocalOnlyMode] = useState<boolean>(
    localStorage.getItem('omniwrite_local_only_mode') === 'true'
  );
  const [groqKeyInput, setGroqKeyInput] = useState<string>(aiState.groqKey);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(aiState.geminiKey);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentenceRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Saved Checks from IndexedDB
  const loadSavedChecks = async () => {
    try {
      const list = await AiCheckerStore.getAllChecks();
      setSavedChecks(list);
    } catch (e) {
      console.error('Failed to load AI Checker submissions:', e);
    }
  };

  useEffect(() => {
    loadSavedChecks();
  }, []);

  // Handle File Upload
  const handleFileSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext || '')) {
      alert('Invalid file format. Please upload a PDF, DOCX, TXT, or MD file.');
      return;
    }

    setSelectedFile(file);
    setExtracting(true);

    try {
      const extracted = await extractDocumentForAiChecker(file);
      setExtractedDoc(extracted);
    } catch (err: any) {
      alert(`Error reading ${file.name}: ${err.message || err}`);
      setSelectedFile(null);
    } finally {
      setExtracting(false);
    }
  };

  // Run Baseline Original Analysis
  const handleRunBaselineAnalysis = async () => {
    if (!extractedDoc) return;

    setAnalyzing(true);

    try {
      // Yield to UI thread so loading spinner renders immediately
      await new Promise((resolve) => setTimeout(resolve, 50));

      const providerLabel = selectedModel.includes('groq')
        ? 'Groq Free'
        : selectedModel.includes('gemini')
        ? 'Google Gemini'
        : 'Local Rule Engine';

      const checkRecord = await createNewDocumentCheck(extractedDoc, providerLabel, selectedModel);
      await AiCheckerStore.saveCheck(checkRecord);
      await loadSavedChecks();

      setActiveCheck(checkRecord);
      setLiveEditedText(checkRecord.edited.text);
      setActivePage(1);
      setActiveTab('workspace');
      setSelectedFile(null);
      setExtractedDoc(null);
    } catch (e: any) {
      alert(`Analysis failed: ${e.message || e}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // REAL-TIME SMART LIVE RE-ANALYSIS (350-500ms DEBOUNCE)
  const handleLiveTextEdit = (newText: string) => {
    setLiveEditedText(newText);
    if (!activeCheck) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsReAnalyzing(true);

      const wordCount = newText.split(/\s+/).filter(Boolean).length;
      const pageCount = Math.max(1, Math.ceil(wordCount / 350));

      const mockExtracted: ExtractedDocumentData = {
        title: activeCheck.filename.replace(/\.[^/.]+$/, ''),
        fileName: activeCheck.filename,
        fileType: activeCheck.fileType,
        pageCount,
        wordCount,
        fullText: newText,
        paragraphs: newText.split(/\n\s*\n/).filter(Boolean),
      };

      const updatedAnalysis = await runAiCheckerDetection(mockExtracted, activeCheck.provider, activeCheck.edited.analysis.model);

      const updatedCheck: DocumentCheck = {
        ...activeCheck,
        edited: {
          text: newText,
          wordCount,
          sentenceCount: updatedAnalysis.sentenceCount,
          pageCount,
          analysis: updatedAnalysis,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      await AiCheckerStore.saveCheck(updatedCheck);
      setActiveCheck(updatedCheck);
      setIsReAnalyzing(false);
    }, 450);
  };

  // Explicit Save Handler
  const handleExplicitSave = async () => {
    if (!activeCheck) return;
    await AiCheckerStore.saveCheck(activeCheck);
    await loadSavedChecks();
    alert('✅ Working Document & Latest Analysis Saved!');
  };

  const handleOpenCheck = (check: DocumentCheck) => {
    setActiveCheck(check);
    setLiveEditedText(check.edited.text);
    setSelectedSentence(null);
    setActivePage(1);
    setActiveTab('workspace');
  };

  const handleDeleteCheck = async (id: string) => {
    await AiCheckerStore.deleteCheck(id);
    setDeleteConfirmId(null);
    if (activeCheck?.id === id) setActiveCheck(null);
    await loadSavedChecks();
  };

  const handleToggleLocalOnlyMode = () => {
    const next = !localOnlyMode;
    setLocalOnlyMode(next);
    localStorage.setItem('omniwrite_local_only_mode', String(next));
  };

  const scrollToSentence = (id: string) => {
    setFocusedSentenceId(id);
    const el = sentenceRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setFocusedSentenceId(null), 2500);
  };

  // Filtered Submissions List
  const filteredChecks = savedChecks.filter((c) => {
    const matchesSearch = c.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'high') return c.edited.analysis.overallScore >= 60;
    if (filterStatus === 'low') return c.edited.analysis.overallScore < 40;
    return true;
  });

  // Page & Severity Filtered Sentences for Left Panel AI Marks
  const activeAnalysis = activeCheck?.edited.analysis;

  const flaggedSentences = activeAnalysis
    ? activeAnalysis.sentences.filter((s) => {
        if (severityFilter === 'high') return s.confidence === 'high';
        if (severityFilter === 'moderate') return s.confidence === 'moderate';
        if (severityFilter === 'low') return s.confidence === 'low';
        return s.confidence !== 'low';
      })
    : [];

  const pageFlaggedSentences = flaggedSentences.filter((s) => s.page === activePage);

  // Score Delta Calculation
  const origScore = activeCheck?.original.analysis.overallScore || 0;
  const currentScore = activeCheck?.edited.analysis.overallScore || 0;
  const scoreDelta = currentScore - origScore;

  return (
    <div className={`flex flex-col h-screen w-full select-none overflow-hidden font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0B0D10] text-[#F3F4F6]' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* TOP NAVIGATION BAR */}
      <header className={`flex h-14 w-full items-center justify-between border-b px-6 shadow-2xs shrink-0 ${
        isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
              isDark ? 'border-[#272D35] bg-[#171B21] text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>OmniWrite Pro</span>
          </button>

          <div className={`h-4 w-px ${isDark ? 'bg-[#272D35]' : 'bg-slate-200'}`} />

          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-extrabold tracking-tight">AI Checker</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Standalone AI Detection & Editing Workspace</p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className={`flex items-center gap-1 rounded-xl p-1 border ${
          isDark ? 'bg-[#171B21] border-[#272D35]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('new-check')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'new-check' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Check
          </button>
          <button
            onClick={() => {
              loadSavedChecks();
              setActiveTab('submissions');
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'submissions' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submissions ({savedChecks.length})
          </button>
          {activeCheck && (
            <button
              onClick={() => setActiveTab('workspace')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                activeTab === 'workspace' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Workspace ({activeCheck.filename})
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'settings' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Settings & API Keys"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Top Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          {activeCheck && activeTab === 'workspace' && (
            <button
              onClick={handleExplicitSave}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
              title="Save working copy & current detection state"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>
          )}

          {/* DAY / NIGHT TOGGLE BUTTON */}
          <button
            onClick={handleToggleTheme}
            className={`rounded-xl border p-2 text-xs font-bold transition-colors ${
              isDark
                ? 'border-[#272D35] bg-[#171B21] text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.doc,.txt,.md"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileSelect(f);
        }}
        className="hidden"
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: NEW CHECK */}
        {activeTab === 'new-check' && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold">Start AI Detection Check</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload your document to generate an immutable Original Baseline analysis and open the real-time editing workspace.
              </p>
            </div>

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelect(f);
                }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer group shadow-2xs ${
                  isDark ? 'border-[#272D35] bg-[#111418] hover:border-sky-500' : 'border-slate-300 bg-white hover:border-sky-500'
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-sm font-extrabold">Drag & drop your document here</h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">Accepted formats: PDF • DOCX • DOC • TXT • MD</p>
                <button
                  type="button"
                  className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 transition-colors"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
                isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
              }`}>
                <div className={`flex items-center justify-between border-b pb-4 ${
                  isDark ? 'border-[#272D35]' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold">{selectedFile.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-400">
                        <span>{extractedDoc ? `${extractedDoc.wordCount.toLocaleString()} words` : 'Extracting...'}</span>
                        <span>•</span>
                        <span>{extractedDoc ? `${extractedDoc.pageCount} pages` : ''}</span>
                        <span>•</span>
                        <span className="uppercase text-sky-400 font-bold">{extractedDoc?.fileType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setExtractedDoc(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    title="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Detection Provider Engine
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className={`w-full rounded-xl border p-3 text-xs font-bold focus:border-sky-500 focus:outline-none ${
                      isDark ? 'border-[#272D35] bg-[#171B21] text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    <option value="auto">⭐ Auto / Recommended (Local Rule Engine + Cloud Signal Fusion)</option>
                    <option value="groq/llama-3.3-70b-versatile">🚀 Groq Llama 3.3 70B (Cloud Free)</option>
                    <option value="gemini/gemini-2.0-flash">⚡ Google Gemini 2.0 Flash (Cloud Free)</option>
                    {aiState.availableModels.map((m) => (
                      <option key={m} value={m}>
                        🤖 {m.replace('ollama/', '')} (Local Ollama)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunBaselineAnalysis}
                  disabled={analyzing || extracting || !extractedDoc}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-xs font-extrabold text-white shadow-lg hover:bg-sky-500 transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Analyzing Baseline Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-sky-200" />
                      <span>Analyze Document</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SUBMISSIONS HISTORY */}
        {activeTab === 'submissions' && (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">Saved AI Detection Checks</h2>
                <p className="text-xs text-slate-400 mt-0.5">Review original baselines vs edited document histories.</p>
              </div>
              <button
                onClick={() => setActiveTab('new-check')}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 transition-colors"
              >
                <span>+ New Check</span>
              </button>
            </div>

            <div className={`overflow-x-auto rounded-2xl border shadow-xs ${
              isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
            }`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-slate-400 font-bold uppercase tracking-wider ${
                  isDark ? 'border-[#272D35] bg-[#171B21]' : 'border-slate-100 bg-slate-50'
                }`}>
                  <tr>
                    <th className="p-4">Document</th>
                    <th className="p-4">Original Score</th>
                    <th className="p-4">Current Score</th>
                    <th className="p-4">Delta</th>
                    <th className="p-4">Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${
                  isDark ? 'divide-[#272D35]' : 'divide-slate-100'
                }`}>
                  {filteredChecks.map((c) => {
                    const oScore = c.original.analysis.overallScore;
                    const cScore = c.edited.analysis.overallScore;
                    const d = cScore - oScore;

                    return (
                      <tr key={c.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="p-4 font-bold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sky-400" />
                          <span>{c.filename}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-400">{oScore}% AI</td>
                        <td className="p-4">
                          <span className={`rounded-lg px-2.5 py-1 font-extrabold text-xs border ${
                            cScore >= 60
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : cScore >= 40
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {cScore}% AI
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-extrabold ${d < 0 ? 'text-emerald-400' : d > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                            {d <= 0 ? `${d}%` : `+${d}%`}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{c.edited.analysis.timestamp}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenCheck(c)}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white hover:bg-sky-500 transition-colors"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: MAIN STANDALONE WORKSPACE (3-COLUMN LAYOUT) */}
        {activeTab === 'workspace' && activeCheck && (
          <div className="flex flex-col h-full space-y-4">
            {/* Action Bar with 3 PDF Exporters */}
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-2xs shrink-0 ${
              isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'border-[#272D35] bg-[#171B21] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  ← Submissions
                </button>
                <h3 className="text-sm font-extrabold">{activeCheck.filename}</h3>

                {/* Score Comparison Badge */}
                <div className="flex items-center gap-2 text-xs font-bold rounded-lg bg-slate-800/80 px-3 py-1 border border-slate-700">
                  <span className="text-slate-400">Original: {origScore}%</span>
                  <span>→</span>
                  <span className="text-sky-300">Current: {currentScore}%</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    scoreDelta < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {scoreDelta <= 0 ? `${scoreDelta}%` : `+${scoreDelta}%`}
                  </span>
                </div>
              </div>

              {/* 3 PDF EXPORT BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Export 1: Original Baseline PDF */}
                <button
                  onClick={() => downloadOriginalPdfReport(activeCheck)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-extrabold text-slate-200 hover:bg-slate-700 transition-colors shadow-2xs"
                  title="Download Original Baseline PDF Report"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Original AI Report</span>
                </button>

                {/* Export 2: Edited Document AI PDF */}
                <button
                  onClick={() => downloadEditedPdfReport(activeCheck)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/60 px-3 py-1.5 text-xs font-extrabold text-sky-300 hover:bg-sky-900/60 transition-colors shadow-2xs"
                  title="Download Current Edited AI Report PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Current AI Report</span>
                </button>

                {/* Export 3: Clean Paper PDF */}
                <button
                  onClick={() => downloadCleanPdfDocument(activeCheck)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                  title="Download clean edited paper without highlights"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Download Clean Edited Document</span>
                </button>
              </div>
            </div>

            {/* 3-COLUMN DESKTOP WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
              {/* LEFT COLUMN (3 Cols): AI MARKS (Page-Grouped Flagged Passages) */}
              <div className={`lg:col-span-3 flex flex-col rounded-2xl border p-4 space-y-4 overflow-y-auto shadow-2xs ${
                isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>AI MARKS ({flaggedSentences.length})</span>
                    <span className="text-[10px] text-sky-400">Page {activePage} Selected</span>
                  </h4>

                  {/* Severity Filter Tabs */}
                  <div className="flex gap-1 mb-2 text-[10px] font-bold">
                    {(['all', 'high', 'moderate'] as const).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev)}
                        className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                          severityFilter === sev
                            ? 'bg-sky-600 text-white'
                            : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  {/* Page Selector Grid */}
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: activeCheck.edited.pageCount }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setActivePage(pg)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          activePage === pg
                            ? 'bg-sky-600 text-white'
                            : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAGE-GROUPED FLAGGED PASSAGES */}
                <div className="border-t border-slate-800 pt-3 flex-1 flex flex-col min-h-0">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    PAGE {activePage} MARKS ({pageFlaggedSentences.length})
                  </h5>

                  <div className="space-y-2 overflow-y-auto flex-1 pr-1 text-xs">
                    {pageFlaggedSentences.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-slate-400 text-xs">
                        No flagged passages on Page {activePage} 🎉
                      </div>
                    ) : (
                      pageFlaggedSentences.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSentence(s);
                            scrollToSentence(s.id);
                          }}
                          className={`rounded-xl border p-2.5 hover:border-sky-500 cursor-pointer transition-colors space-y-1 ${
                            isDark ? 'border-[#272D35] bg-[#171B21]' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={`font-bold flex items-center gap-1 ${
                              s.confidence === 'high' ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              <span>{s.confidence === 'high' ? '🔴' : '🟠'}</span>
                              <span>{s.confidence === 'high' ? 'HIGH AI' : 'MODERATE AI'}</span>
                            </span>
                            <span className="font-extrabold">{s.probability}%</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 italic">"{s.text}"</p>
                          <div className="text-[9px] text-slate-400 truncate">
                            {s.signals[0] || 'Predictable structure'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN (6 Cols): DEDICATED ACADEMIC DOCUMENT READER */}
              <div className={`lg:col-span-6 flex flex-col rounded-2xl border p-6 space-y-4 overflow-y-auto shadow-sm ${
                isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 text-xs font-bold ${
                  isDark ? 'border-[#272D35] text-slate-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-400" />
                    <span>DOCUMENT READER (Page {activePage} of {activeCheck.edited.pageCount})</span>
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-red-400">🔴 High AI (≥ 75%)</span>
                    <span className="flex items-center gap-1 text-amber-400">🟠 Moderate AI (50-74%)</span>
                  </div>
                </div>

                {/* ANNOTATED READ DISPLAY WITH SEVERITY HIGHLIGHTS */}
                <div className={`flex-1 rounded-xl border p-6 text-sm leading-relaxed font-sans space-y-3 whitespace-pre-wrap select-text overflow-y-auto min-h-[440px] ${
                  isDark ? 'border-[#272D35] bg-[#0B0D10] text-slate-100' : 'border-slate-100 bg-white text-slate-900'
                }`}>
                  {pageFlaggedSentences.length === 0 && (activeAnalysis?.sentences.filter((s) => s.page === activePage).length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No text content found on Page {activePage}.</p>
                  ) : (
                    (activeAnalysis?.sentences.filter((s) => s.page === activePage) || []).map((s) => {
                      const isHigh = s.confidence === 'high';
                      const isMod = s.confidence === 'moderate';
                      const isSelected = selectedSentence?.id === s.id;
                      const isFocused = focusedSentenceId === s.id;

                      return (
                        <span
                          key={s.id}
                          ref={(el) => {
                            sentenceRefs.current[s.id] = el;
                          }}
                          onClick={() => setSelectedSentence(s)}
                          className={`inline transition-colors rounded px-1 py-0.5 cursor-pointer relative ${
                            isHigh
                              ? 'bg-red-500/20 text-red-300 border-b-2 border-red-500 font-medium'
                              : isMod
                              ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-500 font-medium'
                              : 'hover:bg-slate-800/40'
                          } ${isSelected || isFocused ? 'ring-2 ring-sky-400' : ''}`}
                        >
                          {s.text}{' '}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN (3 Cols): CURRENT LIVE SCORE & DETAILS */}
              <div className={`lg:col-span-3 flex flex-col rounded-2xl border p-4 space-y-4 overflow-y-auto shadow-2xs ${
                isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
              }`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CURRENT DOCUMENT ANALYSIS</h4>

                {/* Score Summary */}
                <div className={`rounded-xl p-4 border text-center space-y-1 ${
                  isDark ? 'border-[#272D35] bg-[#171B21]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AI Detection Estimate</span>
                  <div className="text-3xl font-black text-sky-400 flex items-center justify-center gap-1">
                    {isReAnalyzing ? <RefreshCw className="h-5 w-5 animate-spin text-sky-400" /> : null}
                    <span>{currentScore}%</span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">
                    {currentScore >= 60 ? '🔴 High AI Estimate' : '🟢 Natural / Human'}
                  </p>
                </div>

                {/* Breakdown Bars */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-red-400">
                    <span>High AI (🔴)</span>
                    <span>{activeAnalysis?.highConfidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${activeAnalysis?.highConfidence}%` }} />
                  </div>

                  <div className="flex justify-between font-bold text-amber-400 pt-1">
                    <span>Moderate AI (🟠)</span>
                    <span>{activeAnalysis?.moderateConfidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${activeAnalysis?.moderateConfidence}%` }} />
                  </div>

                  <div className="flex justify-between font-bold text-emerald-400 pt-1">
                    <span>Human-like (🟢)</span>
                    <span>{activeAnalysis?.unflagged}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${activeAnalysis?.unflagged}%` }} />
                  </div>
                </div>

                {/* Selected Sentence Detail */}
                {selectedSentence ? (
                  <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                    <h5 className="font-extrabold text-sky-400">Selected Sentence</h5>
                    <p className="text-[11px] text-slate-300 italic">"{selectedSentence.text}"</p>
                    <div className={`rounded-xl p-3 space-y-1 text-[11px] border ${
                      isDark ? 'border-[#272D35] bg-[#171B21]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <p className="font-bold text-white">AI Probability: {selectedSentence.probability}%</p>
                      <p className="text-slate-400">Confidence: {selectedSentence.confidence}</p>
                      <p className="text-slate-400 font-bold mt-1">Detected Signals:</p>
                      {selectedSentence.signals.map((sig, i) => (
                        <p key={i} className="text-sky-300">
                          • {sig}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic pt-2">
                    Click any highlighted sentence in the document editor to inspect its signals...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold">AI Checker Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Configure provider API keys, local Ollama endpoint, and privacy controls.</p>
            </div>

            <div className={`rounded-2xl border p-6 space-y-4 ${
              isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
            }`}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Privacy & Local Mode</span>
              </h3>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold">Local Only Mode</p>
                  <p className="text-[11px] text-slate-400">
                    Disables all cloud providers. Document analysis will strictly use local Ollama or Rule Engine.
                  </p>
                </div>
                <button
                  onClick={handleToggleLocalOnlyMode}
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                    localOnlyMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {localOnlyMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-sm w-full p-6 border shadow-2xl space-y-4 text-center ${
            isDark ? 'border-[#272D35] bg-[#111418]' : 'border-slate-200 bg-white'
          }`}>
            <h3 className="text-base font-extrabold">Delete this submission?</h3>
            <p className="text-xs text-slate-400">
              This will remove the baseline and edited document analysis history.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCheck(deleteConfirmId)}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
