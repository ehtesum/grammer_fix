import React, { useState, useRef } from 'react';
import {
  analyzeTextInspector,
  humanizeTextLocal,
  run5AgentInspectorPipeline,
  HumanizeStyle,
  InspectorMetrics,
} from '../../engine/TextInspectorEngine';
import { useOllama } from '../../engine/OllamaContext';
import { extractTextFromFile } from '../../utils/DocumentExtractor';
import {
  Search,
  Sparkles,
  Upload,
  Copy,
  Check,
  TrendingDown,
  BarChart2,
  FileText,
  Activity,
  Loader2,
  Brush,
  RefreshCw,
  Download,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const InspectorPage: React.FC = () => {
  const { state: ollamaState, generateText } = useOllama();

  const [text, setText] = useState<string>(
    `Furthermore, it is important to note that the system delves into a rich tapestry of natural language processing rules. In order to utilize these features, a wide variety of metrics are calculated at this point in time.`
  );
  const [humanizedOutput, setHumanizedOutput] = useState<string>('');
  const [humanizeStyle, setHumanizeStyle] = useState<HumanizeStyle>('natural');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [scrubbing, setScrubbing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  // Explicit AI Inspector Metrics State (Only populated when "Check AI" or actions are triggered)
  const [metrics, setMetrics] = useState<InspectorMetrics | null>(null);
  const [humanizedMetrics, setHumanizedMetrics] = useState<InspectorMetrics | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckAi = () => {
    if (!text.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const pipelineRes = run5AgentInspectorPipeline(text, humanizeStyle);
      setMetrics(pipelineRes.metrics);
      setAnalyzing(false);
    }, 200);
  };

  const handleScrubAi = () => {
    if (!text.trim()) return;
    setScrubbing(true);
    setTimeout(() => {
      const pipelineRes = run5AgentInspectorPipeline(text, humanizeStyle);
      setText(pipelineRes.output);
      setMetrics(pipelineRes.metrics);
      setScrubbing(false);
    }, 200);
  };

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);

    // 5-Agent Pipeline Execution
    const pipelineRes = run5AgentInspectorPipeline(text, humanizeStyle);
    setMetrics(pipelineRes.metrics);

    let finalOutput = pipelineRes.output;

    if (ollamaState.connected && ollamaState.activeModel) {
      const prompt = `Rewrite the following text to sound 100% human-written in a ${humanizeStyle} tone. Preserve all paragraph breaks, section headings, and line spacing. Vary sentence length drastically, introduce natural human transition phrases, increase vocabulary diversity, eliminate all repetitive AI clichés (like 'delve', 'testament', 'furthermore', 'procedural reasoning'), and break uniform structural patterns. Return ONLY the rewritten humanized text:\n\n"${finalOutput}"`;

      const res = await generateText(prompt);
      if (res.success && res.result && res.result.trim().length > 0) {
        finalOutput = res.result;
      } else if (res.message) {
        console.warn('Cloud LLM message:', res.message);
      }
    }

    setHumanizedOutput(finalOutput);
    const humMetrics = run5AgentInspectorPipeline(finalOutput, humanizeStyle).metrics;
    setHumanizedMetrics(humMetrics);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    setMetrics(null);
    setHumanizedMetrics(null);
    setHumanizedOutput('');

    try {
      const extracted = await extractTextFromFile(file);
      if (extracted.trim().length > 0) {
        setText(extracted);
      } else {
        alert('Could not extract text from document. Please ensure the file contains readable text.');
      }
    } catch (err: any) {
      alert(`Error reading ${file.name}: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyHumanized = () => {
    navigator.clipboard.writeText(humanizedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHumanized = () => {
    if (!humanizedOutput) return;
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Humanized_Document';
    const downloadName = `${baseName}_Cleaned.md`;

    const blob = new Blob([humanizedOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReplaceWithHumanized = () => {
    if (humanizedOutput) {
      setText(humanizedOutput);
      setHumanizedOutput('');
      setMetrics(humanizedMetrics);
      setHumanizedMetrics(null);
    }
  };

  const scoreDrop = metrics && humanizedMetrics ? metrics.aiLikelihood - humanizedMetrics.aiLikelihood : 0;

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hidden File Input supporting PDF, DOC/DOCX, TEX, TXT, MD */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.tex,.latex,.txt,.md,.markdown,.json,.rtf"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="mx-auto max-w-6xl w-full space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Search className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">AI Inspector & Humanizer (5-Agent Calibrated Pipeline)</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Powered by 5-Agent Architecture (Context, Planning, Execution, Verification, Decision). Upload PDF/Word/LaTeX, click <b>Check AI</b> to audit, or <b>Humanize</b> to download.
            </p>
          </div>
        </div>

        {/* PROMINENT BEFORE vs AFTER AI COMPARISON BANNER */}
        {humanizedMetrics && metrics && (
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950 to-emerald-950 p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  5-Agent AI Likelihood Reduction Analysis
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300 border border-emerald-500/30">
                ▼ {scoreDrop > 0 ? `-${scoreDrop}%` : '0%'} AI Signal Reduced!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* BEFORE */}
              <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold uppercase">Before (Original Text)</span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-extrabold text-[10px]">
                    {metrics.signalLabel}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-amber-400">{metrics.aiLikelihood}%</span>
                  <span className="text-xs text-slate-400 font-semibold">AI Signal Probability</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.aiLikelihood}%` }} />
                </div>
              </div>

              {/* AFTER */}
              <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="font-bold uppercase">After (5-Agent Humanized)</span>
                  <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-emerald-200 font-extrabold text-[10px]">
                    {humanizedMetrics.signalLabel}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-400">{humanizedMetrics.aiLikelihood}%</span>
                  <span className="text-xs text-emerald-300 font-semibold">AI Signal Probability</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${humanizedMetrics.aiLikelihood}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-AGENT ARCHITECTURE STATUS CARD (Shown when metrics exist) */}
        {metrics && metrics.pipelineStatus && (
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  5-Agent Calibrated Architecture Execution Status
                </span>
              </div>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 border border-emerald-500/30">
                Confidence Fusion C_fused: {metrics.pipelineStatus.decision.C_fused} (Accepted)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
              <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Agent 1: Context Safety</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Pass (Cleaned)
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Agent 2: Planning</p>
                <p className="text-xs font-bold text-amber-400 mt-0.5 truncate">
                  3 Trajectory Steps
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Agent 3: Execution</p>
                <p className="text-xs font-bold text-indigo-400 mt-0.5">
                  {metrics.pipelineStatus.execution.passesApplied} Passes Applied
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Agent 4: Verification</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">
                  C_judg: {metrics.pipelineStatus.verification.C_judg} (Approved)
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Agent 5: Decision</p>
                <p className="text-xs font-bold text-purple-400 mt-0.5">
                  {metrics.pipelineStatus.decision.iterationsRequired}.0 Iteration Gate
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI-Likelihood Meter */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original AI-Likelihood</span>
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              <div className="my-4">
                <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{metrics.aiLikelihood}%</span>
                <p className="text-xs font-bold text-slate-700 mt-1 dark:text-slate-200">{metrics.signalLabel}</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                *Estimates stylistic markers associated with AI generators.
              </p>
            </div>

            {/* Statistical Metrics Grid */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                <BarChart2 className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  Stylistic Metrics Breakdown
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Perplexity</p>
                  <p className="text-base font-bold text-indigo-600 mt-0.5 dark:text-indigo-400">{metrics.perplexity}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Burstiness Index</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5 dark:text-emerald-400">{metrics.burstiness}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Vocab Diversity (MATTR)</p>
                  <p className="text-base font-bold text-purple-600 mt-0.5 dark:text-purple-400">{metrics.vocabDiversity}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Repetition</p>
                  <p className="text-base font-bold text-amber-600 mt-0.5 dark:text-amber-400">{metrics.repetition}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Structural Uniformity</p>
                  <p className="text-base font-bold text-blue-600 mt-0.5 dark:text-blue-400">{metrics.structuralUniformity}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UNIFIED CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-md border border-slate-800">
          {/* Left: Humanizer Style Profile Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Style Profile:</span>
            <div className="flex gap-1.5">
              {(['natural', 'conversational', 'varied', 'concise'] as HumanizeStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setHumanizeStyle(style)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                    humanizeStyle === style
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>{uploading ? 'Extracting...' : '📁 Upload Document'}</span>
            </button>

            {fileName && (
              <span className="rounded-xl bg-amber-500/20 px-2.5 py-1.5 text-xs font-extrabold text-amber-300 border border-amber-500/30">
                {fileName}
              </span>
            )}

            <button
              onClick={handleCheckAi}
              disabled={analyzing || !text.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3.5 py-2 text-xs font-extrabold text-amber-300 hover:bg-amber-900/50 transition-colors shadow-xs"
              title="Click to audit with 5-Agent Calibrated Architecture"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Checking...' : '🔍 Check AI Signal'}</span>
            </button>

            <button
              onClick={handleScrubAi}
              disabled={scrubbing || !text.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
              title="Run Layer A Scrubber to remove zero-width tokens and AI clichés"
            >
              <Brush className={`h-3.5 w-3.5 text-emerald-400 ${scrubbing ? 'animate-spin' : ''}`} />
              <span>{scrubbing ? 'Scrubbing...' : '🧹 Scrub AI Marks'}</span>
            </button>

            <button
              onClick={handleHumanize}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all transform hover:scale-105"
            >
              <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Humanizing...' : '✨ Humanize Text (Bypass AI)'}</span>
            </button>
          </div>
        </div>

        {/* GRAMMARLY-STYLE WHOLE-PAGE DOCUMENT WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[520px]">
          {/* Input Panel */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileText className="h-4 w-4 text-amber-600" />
                <span>Original Document Text {fileName ? `(${fileName})` : ''}</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {text.split(/\s+/).filter(Boolean).length} Words
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setMetrics(null);
                setHumanizedMetrics(null);
              }}
              placeholder="Paste or upload PDF, Word (.doc/.docx), LaTeX (.tex) or Text file to analyze and humanize..."
              className="w-full h-full min-h-[420px] resize-none bg-transparent text-sm leading-relaxed focus:outline-none dark:text-white font-sans"
            />
          </div>

          {/* Humanized Output Panel (Whole-Page Ready for Download) */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                <Sparkles className="h-4 w-4" />
                <span>Humanized Whole-Page Output (5-Agent Verified)</span>
              </div>

              {humanizedOutput && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadHumanized}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-amber-700 transition-colors"
                    title="Download humanized document with full formatting preserved"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>📥 Download Document</span>
                  </button>

                  <button
                    onClick={handleCopyHumanized}
                    className="flex items-center gap-1 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl dark:border-slate-700 dark:text-slate-200"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleReplaceWithHumanized}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-800"
                  >
                    <span>Use Humanized Text</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[420px] text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-sans overflow-y-auto">
              {humanizedOutput ? (
                humanizedOutput
              ) : (
                <span className="text-slate-400 italic">
                  Click "✨ Humanize Text (Bypass AI)" above to generate your humanized document ready for download...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
