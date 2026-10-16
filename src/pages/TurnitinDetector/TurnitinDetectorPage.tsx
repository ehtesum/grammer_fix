import React, { useState, useEffect, useRef } from 'react';
import { useOllama } from '../../engine/OllamaContext';
import { TurnitinStore } from '../../storage/TurnitinStore';
import {
  extractDocumentForTurnitin,
  runTurnitinDetection,
  TurnitinReportData,
  ExtractedDocumentData,
  NormalizedSentenceResult,
} from '../../engine/TurnitinDetectionEngine';
import { downloadTurnitinPdfReport, downloadCleanPdfDocument } from '../../utils/PdfReportExporter';
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
} from 'lucide-react';

export const TurnitinDetectorPage: React.FC<{
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}> = ({ onNavigateHome, isDarkMode = false, onToggleTheme }) => {
  const { state: aiState, setApiKey, generateText } = useOllama();

  // Navigation Sub-views: 'new-check' | 'submissions' | 'report' | 'settings'
  const [activeTab, setActiveTab] = useState<'new-check' | 'submissions' | 'report' | 'settings'>('new-check');

  // New Check State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocumentData | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('Preparing document...');

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<string>('auto');

  // Submissions Inbox State
  const [reports, setReports] = useState<TurnitinReportData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active Report Viewer State
  const [activeReport, setActiveReport] = useState<TurnitinReportData | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<NormalizedSentenceResult | null>(null);
  const [hoveredSentenceId, setHoveredSentenceId] = useState<string | null>(null);
  const [activeReportPage, setActiveReportPage] = useState<number>(1);

  // PAGE-AWARE LIVE EDITING & RE-ANALYSIS
  const [pageTextEditMode, setPageTextEditMode] = useState<boolean>(false);
  const [liveContent, setLiveContent] = useState<string>('');
  const [isReAnalyzing, setIsReAnalyzing] = useState<boolean>(false);

  // Settings State
  const [localOnlyMode, setLocalOnlyMode] = useState<boolean>(
    localStorage.getItem('omniwrite_local_only_mode') === 'true'
  );
  const [groqKeyInput, setGroqKeyInput] = useState<string>(aiState.groqKey);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(aiState.geminiKey);
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState<string>(aiState.openrouterKey);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentenceRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Submissions from IndexedDB
  const loadSubmissions = async () => {
    try {
      const list = await TurnitinStore.getAllReports();
      setReports(list);
    } catch (e) {
      console.error('Failed to load Turnitin submissions:', e);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Handle File Selection
  const handleFileSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext || '')) {
      alert('Invalid file format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setSelectedFile(file);
    setExtracting(true);

    try {
      const extracted = await extractDocumentForTurnitin(file);
      setExtractedDoc(extracted);
    } catch (err: any) {
      alert(`Error reading ${file.name}: ${err.message || err}`);
      setSelectedFile(null);
    } finally {
      setExtracting(false);
    }
  };

  // Resolve Auto Model Selection
  const resolveTargetModel = (): string => {
    if (selectedModel !== 'auto') return selectedModel;

    if (aiState.groqKey) return 'groq/llama-3.3-70b-versatile';
    if (aiState.geminiKey) return 'gemini/gemini-2.0-flash';
    if (aiState.connected && aiState.availableModels.length > 0) return aiState.availableModels[0];
    return 'groq/llama-3.3-70b-versatile';
  };

  // Run Document Analysis Pipeline
  const handleRunAnalysis = async () => {
    if (!extractedDoc) return;

    setAnalyzing(true);
    setAnalysisStatusText('Analyzing sentence patterns & linguistic metrics...');

    const targetModel = resolveTargetModel();

    setTimeout(async () => {
      try {
        const report = await runTurnitinDetection(extractedDoc, targetModel, generateText);

        await TurnitinStore.saveReport(report);
        await loadSubmissions();

        setActiveReport(report);
        setLiveContent(report.fullText);
        setActiveReportPage(1);
        setAnalyzing(false);
        setActiveTab('report');
        setSelectedFile(null);
        setExtractedDoc(null);
      } catch (e: any) {
        alert(`Analysis failed: ${e.message || e}`);
        setAnalyzing(false);
      }
    }, 400);
  };

  // LIVE REAL-TIME RE-ANALYSIS AS USER EDITS PAGE TEXT
  const handleLiveContentChange = (newText: string) => {
    setLiveContent(newText);
    if (!activeReport) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsReAnalyzing(true);

      const wordCount = newText.split(/\s+/).filter(Boolean).length;
      const pageCount = Math.max(1, Math.ceil(wordCount / 350));

      const mockExtracted: ExtractedDocumentData = {
        title: activeReport.filename.replace(/\.[^/.]+$/, ''),
        fileName: activeReport.filename,
        fileType: activeReport.fileType,
        pageCount,
        wordCount,
        fullText: newText,
        paragraphs: newText.split(/\n\s*\n/).filter(Boolean),
      };

      const updatedReport = await runTurnitinDetection(mockExtracted, activeReport.model, generateText);
      updatedReport.id = activeReport.id;

      await TurnitinStore.saveReport(updatedReport);
      setActiveReport(updatedReport);
      setIsReAnalyzing(false);
    }, 450);
  };

  const handleOpenReport = (report: TurnitinReportData) => {
    setActiveReport(report);
    setLiveContent(report.fullText);
    setSelectedSentence(null);
    setActiveReportPage(1);
    setPageTextEditMode(false);
    setActiveTab('report');
  };

  const handleDeleteReport = async (id: string) => {
    await TurnitinStore.deleteReport(id);
    setDeleteConfirmId(null);
    if (activeReport?.id === id) setActiveReport(null);
    await loadSubmissions();
  };

  const handleToggleLocalOnlyMode = () => {
    const next = !localOnlyMode;
    setLocalOnlyMode(next);
    localStorage.setItem('omniwrite_local_only_mode', String(next));
  };

  const isLocalActive = selectedModel.startsWith('ollama/') || (selectedModel === 'auto' && aiState.connected && !aiState.groqKey && !aiState.geminiKey);

  // Filtered Submissions Inbox
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'high') return r.overallScore >= 60;
    if (filterStatus === 'low') return r.overallScore < 40;
    if (filterStatus === 'completed') return r.status === 'Completed';
    return true;
  });

  // Sort Submissions Inbox
  filteredReports.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    if (sortBy === 'oldest') return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    if (sortBy === 'highest-score') return b.overallScore - a.overallScore;
    if (sortBy === 'lowest-score') return a.overallScore - b.overallScore;
    if (sortBy === 'word-count') return b.wordCount - a.wordCount;
    return 0;
  });

  const scrollToSentence = (id: string) => {
    const el = sentenceRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // PAGE-AWARE FILTERED SENTENCES FOR ACTIVE PAGE
  const pageSentences = activeReport
    ? activeReport.sentences.filter((s) => s.page === activeReportPage)
    : [];

  const pageFlaggedSentences = activeReport
    ? activeReport.sentences.filter((s) => s.page === activeReportPage && s.confidence !== 'low')
    : [];

  const totalFlaggedCount = activeReport
    ? activeReport.sentences.filter((s) => s.confidence !== 'low').length
    : 0;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 select-none overflow-hidden font-sans transition-colors duration-200">
      {/* TOP AI CHECKER NAVIGATION SHELL */}
      <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>OmniWrite Pro</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">AI Checker</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">AI Writing Detection & Document Analysis</p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('new-check')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'new-check' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            New Check
          </button>
          <button
            onClick={() => {
              loadSubmissions();
              setActiveTab('submissions');
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'submissions' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Submissions ({reports.length})
          </button>
          {activeReport && (
            <button
              onClick={() => setActiveTab('report')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                activeTab === 'report' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Report ({activeReport.filename})
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
              activeTab === 'settings' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Settings & API Keys"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Privacy Status Badge & Theme Toggle */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          )}

          {isLocalActive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
              <Lock className="h-3.5 w-3.5" />
              <span>🔒 Local Analysis</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30">
              <Cloud className="h-3.5 w-3.5" />
              <span>☁ Cloud API</span>
            </span>
          )}
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

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: NEW CHECK */}
        {activeTab === 'new-check' && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Writing Detection</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload your document to evaluate sentence-level AI probabilities, structural uniformity, and cliché markers.
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
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center hover:border-sky-500 hover:bg-slate-50 transition-all cursor-pointer group shadow-2xs dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform dark:bg-sky-500/10 dark:text-sky-400">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">Drag & drop your document here</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Accepted formats: PDF • DOCX • TXT</p>
                <button
                  type="button"
                  className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 transition-colors"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedFile.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{extractedDoc ? `${extractedDoc.wordCount.toLocaleString()} words` : 'Extracting...'}</span>
                        <span>•</span>
                        <span>{extractedDoc ? `${extractedDoc.pageCount} pages` : ''}</span>
                        <span>•</span>
                        <span className="uppercase text-sky-600 dark:text-sky-400 font-bold">{extractedDoc?.fileType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setExtractedDoc(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Detection Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="auto">⭐ Auto / Recommended (Selects Best Available Model)</option>
                    <optgroup label="🚀 Groq (100% Free API)" className="text-black bg-white">
                      <option value="groq/llama-3.3-70b-versatile">🚀 Llama 3.3 70B (Groq Free)</option>
                      <option value="groq/deepseek-r1-distill-llama-70b">🚀 DeepSeek R1 70B (Groq Free)</option>
                      <option value="groq/gemma2-9b-it">🚀 Gemma 2 9B (Groq Free)</option>
                    </optgroup>
                    <optgroup label="⚡ Google Gemini (100% Free Tier)" className="text-black bg-white">
                      <option value="gemini/gemini-2.0-flash">⚡ Gemini 2.0 Flash (Google Free)</option>
                      <option value="gemini/gemini-1.5-flash">⚡ Gemini 1.5 Flash (Google Free)</option>
                    </optgroup>
                    <optgroup label="🌐 OpenRouter Free Models" className="text-black bg-white">
                      <option value="openrouter/meta-llama/llama-3.2-3b-instruct:free">🌐 Llama 3.2 3B (OpenRouter Free)</option>
                      <option value="openrouter/deepseek/deepseek-r1:free">🌐 DeepSeek R1 (OpenRouter Free)</option>
                    </optgroup>
                    <optgroup label="💻 Local Ollama Models" className="text-black bg-white">
                      {aiState.availableModels.map((m) => (
                        <option key={m} value={m}>
                          🤖 {m.replace('ollama/', '')} (Local Ollama)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing || extracting || !extractedDoc}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>{analysisStatusText}</span>
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

        {/* VIEW 2: SUBMISSIONS INBOX */}
        {activeTab === 'submissions' && (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Submissions Inbox</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review previous document audits and export PDF Turnitin reports.</p>
              </div>
              <button
                onClick={() => setActiveTab('new-check')}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 transition-colors"
              >
                <span>+ New Check</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs w-full sm:w-64 dark:border-slate-800 dark:bg-slate-950">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="bg-transparent text-slate-900 dark:text-white focus:outline-none w-full font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Documents</option>
                  <option value="high">High AI Score (≥ 60%)</option>
                  <option value="low">Low AI Score (&lt; 40%)</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest-score">Highest AI Score</option>
                  <option value="lowest-score">Lowest AI Score</option>
                  <option value="word-count">Word Count</option>
                </select>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">No submissions found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload your first document to start an AI detection analysis.</p>
                <button
                  onClick={() => setActiveTab('new-check')}
                  className="mt-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white"
                >
                  + New Check
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                      <th className="p-4">Document</th>
                      <th className="p-4">Words</th>
                      <th className="p-4">AI Score</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span>{r.filename}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{r.wordCount.toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 font-extrabold text-xs border ${
                              r.overallScore >= 60
                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            🔵 {r.overallScore}% AI
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">{r.uploadDate}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenReport(r)}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white hover:bg-sky-500 transition-colors"
                          >
                            View Report
                          </button>
                          <button
                            onClick={() => downloadTurnitinPdfReport(r)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            title="Download Turnitin AI Audit PDF Report"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: REPORT VIEWER (PAGE-AWARE FILTERING FOR LEFT FLAGGED & MIDDLE EDITOR) */}
        {activeTab === 'report' && activeReport && (
          <div className="flex flex-col h-full space-y-4">
            {/* Top Report Bar with DUAL PDF EXPORT BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  ← Submissions
                </button>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{activeReport.filename}</h3>
                <span className="rounded-lg bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 px-3 py-1 text-xs font-extrabold flex items-center gap-1.5">
                  {isReAnalyzing ? <RefreshCw className="h-3 w-3 animate-spin text-sky-500" /> : null}
                  <span>AI Detection Estimate: {activeReport.overallScore}%</span>
                </span>
              </div>

              {/* DUAL PDF DOWNLOAD BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => downloadTurnitinPdfReport(activeReport)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-1.5 text-xs font-extrabold text-sky-800 hover:bg-sky-100 dark:border-sky-500/40 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60 transition-colors shadow-2xs"
                  title="Download official Turnitin-style AI Audit PDF with light blue highlights"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>📥 Download AI Detection Report (PDF)</span>
                </button>

                <button
                  onClick={() => downloadCleanPdfDocument(activeReport)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                  title="Download clean edited paper without highlights for submission"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>📥 Download Clean Document (PDF)</span>
                </button>
              </div>
            </div>

            {/* 3-Column Desktop Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Left Column (3 cols): PAGE SELECTOR & PAGE-FILTERED FLAGGED PASSAGES */}
              <div className="lg:col-span-3 flex flex-col rounded-2xl border border-slate-200 bg-white p-4 space-y-4 overflow-y-auto shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Pages ({activeReport.pageCount})</span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400">Page {activeReportPage} Selected</span>
                  </h4>
                  {/* Page Selector Grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: activeReport.pageCount }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => {
                          setActiveReportPage(pg);
                          setSelectedSentence(null);
                        }}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                          activeReportPage === pg
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAGE-FILTERED FLAGGED PASSAGES LIST */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex-1 flex flex-col min-h-0">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Flagged Passages</span>
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      Page {activeReportPage}: {pageFlaggedSentences.length} of {totalFlaggedCount}
                    </span>
                  </h4>

                  <div className="space-y-2 overflow-y-auto flex-1 pr-1 text-xs">
                    {pageFlaggedSentences.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs dark:border-slate-800">
                        No flagged passages on Page {activeReportPage} 🎉
                      </div>
                    ) : (
                      pageFlaggedSentences.map((s, idx) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSentence(s);
                            scrollToSentence(s.id);
                          }}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 hover:border-sky-500 cursor-pointer transition-colors space-y-1 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-500/60"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-sky-600 dark:text-sky-400">#{idx + 1} High Signal</span>
                            <span className="font-extrabold text-sky-700 dark:text-sky-300">{s.aiProbability}% AI</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 italic">"{s.text}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column (6 cols): UNIFIED PAGE-AWARE EDITOR & TURNITIN LIGHT-BLUE READER */}
              <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 space-y-4 overflow-y-auto shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span>DOCUMENT READER (Page {activeReportPage} of {activeReport.pageCount})</span>
                  </div>

                  <button
                    onClick={() => setPageTextEditMode(!pageTextEditMode)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      pageTextEditMode
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{pageTextEditMode ? 'Editing Page Text' : 'Edit Page Text'}</span>
                  </button>
                </div>

                {/* PAGE-AWARE EDITOR & ANNOTATED DISPLAY WORKSPACE */}
                <div className="flex-1 flex flex-col min-h-[440px] space-y-3">
                  {pageTextEditMode ? (
                    <textarea
                      value={liveContent}
                      onChange={(e) => handleLiveContentChange(e.target.value)}
                      placeholder={`Edit text for Page ${activeReportPage} directly here...`}
                      className="w-full flex-1 min-h-[400px] resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-sans text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white leading-relaxed"
                    />
                  ) : (
                    /* PAGE-FILTERED ANNOTATED PASSAGE DISPLAY WITH LIGHT-BLUE HIGHLIGHTS (#DBEAFE) */
                    <div className="flex-1 rounded-xl border border-slate-100 bg-white p-5 text-sm leading-relaxed text-slate-900 font-sans space-y-3 whitespace-pre-wrap select-text dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-100 overflow-y-auto">
                      {pageSentences.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No text content found on Page {activeReportPage}.</p>
                      ) : (
                        pageSentences.map((s) => {
                          const isFlagged = s.confidence === 'high' || s.confidence === 'moderate';
                          const isSelected = selectedSentence?.id === s.id;

                          return (
                            <span
                              key={s.id}
                              ref={(el) => {
                                sentenceRefs.current[s.id] = el;
                              }}
                              onClick={() => setSelectedSentence(s)}
                              onMouseEnter={() => setHoveredSentenceId(s.id)}
                              onMouseLeave={() => setHoveredSentenceId(null)}
                              className={`inline transition-colors rounded px-1 py-0.5 cursor-pointer relative ${
                                isFlagged
                                  ? 'bg-blue-100 text-blue-900 border-b-2 border-sky-500 dark:bg-sky-950/90 dark:text-sky-100 dark:border-sky-400 font-medium'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                              } ${isSelected ? 'ring-2 ring-sky-400' : ''}`}
                            >
                              {s.text}{' '}
                              {/* Hover Tooltip Popover */}
                              {hoveredSentenceId === s.id && isFlagged && (
                                <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-xl border border-sky-300 bg-white p-3 text-xs shadow-2xl space-y-1 dark:border-sky-500/40 dark:bg-slate-950">
                                  <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-extrabold">
                                    <span>AI Detection Signal</span>
                                    <span>{s.aiProbability}% AI Signal</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">Confidence: {s.confidence}</p>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                                    {s.markers.map((m, i) => (
                                      <p key={i} className="flex items-center gap-1 text-sky-600 dark:text-sky-300">
                                        • {m}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (3 cols): Analysis Details Panel */}
              <div className="lg:col-span-3 flex flex-col rounded-2xl border border-slate-200 bg-white p-4 space-y-4 overflow-y-auto shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis Details</h4>

                {/* Score Summary */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center space-y-1 dark:bg-slate-950 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AI Detection Estimate</span>
                  <div className="text-3xl font-black text-sky-600 dark:text-sky-400 flex items-center justify-center gap-1">
                    {isReAnalyzing ? <RefreshCw className="h-5 w-5 animate-spin text-sky-500" /> : null}
                    <span>{activeReport.overallScore}%</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    {activeReport.overallScore >= 60 ? 'High AI Estimate' : 'Natural / Human Estimate'}
                  </p>
                </div>

                {/* Confidence Bars */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>High Confidence</span>
                    <span className="text-sky-600 dark:text-sky-400">{activeReport.highConfidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${activeReport.highConfidence}%` }} />
                  </div>

                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 pt-1">
                    <span>Moderate Confidence</span>
                    <span className="text-sky-500 dark:text-sky-300">{activeReport.moderateConfidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400/80" style={{ width: `${activeReport.moderateConfidence}%` }} />
                  </div>

                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 pt-1">
                    <span>Unflagged / Human</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{activeReport.unflagged}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${activeReport.unflagged}%` }} />
                  </div>
                </div>

                {/* Selected Sentence Detail */}
                {selectedSentence ? (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                    <h5 className="font-extrabold text-sky-600 dark:text-sky-400">Sentence Analysis</h5>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">"{selectedSentence.text}"</p>
                    <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-[11px] border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white">AI Probability: {selectedSentence.aiProbability}%</p>
                      <p className="text-slate-500 dark:text-slate-400">Confidence Level: {selectedSentence.confidence}</p>
                      <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Detected Signals:</p>
                      {selectedSentence.markers.map((m, i) => (
                        <p key={i} className="text-sky-700 dark:text-sky-300">
                          • {m}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic pt-2">
                    Click any highlighted sentence in the document reader to inspect its analysis signals...
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
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Checker Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure cloud provider API keys, local Ollama endpoint, and privacy controls.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Privacy & Local Mode</span>
              </h3>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Local Only Mode</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Disables all cloud providers. Document analysis will strictly use local Ollama models.
                  </p>
                </div>
                <button
                  onClick={handleToggleLocalOnlyMode}
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
                    localOnlyMode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {localOnlyMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Free Provider API Keys</span>
              </h3>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Groq API Key</span>
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
                    Get Free Key
                  </a>
                </div>
                <input
                  type="password"
                  value={groqKeyInput}
                  onChange={(e) => {
                    setGroqKeyInput(e.target.value);
                    setApiKey('groq', e.target.value);
                  }}
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Google Gemini API Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
                    Get Free Key
                  </a>
                </div>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => {
                    setGeminiKeyInput(e.target.value);
                    setApiKey('gemini', e.target.value);
                  }}
                  placeholder="AIza..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Storage & Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All submissions and report documents are stored locally in IndexedDB.</p>
              <button
                onClick={async () => {
                  if (confirm('Clear all submission history and reports? This cannot be undone.')) {
                    await TurnitinStore.clearAllReports();
                    await loadSubmissions();
                    setActiveReport(null);
                    alert('Submission database cleared.');
                  }
                }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 transition-colors"
              >
                Clear Submission Database
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete this submission?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will remove the original document analysis and stored PDF report.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
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
