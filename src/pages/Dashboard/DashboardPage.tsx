import React from 'react';
import {
  Feather,
  Repeat,
  Search,
  Sigma,
  FileSpreadsheet,
  FolderKanban,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { DocumentData } from '../../engine/types';

interface DashboardPageProps {
  documents: DocumentData[];
  onNavigate: (route: string) => void;
  onOpenDocument: (doc: DocumentData) => void;
  onCreateDocument: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  documents,
  onNavigate,
  onOpenDocument,
  onCreateDocument,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const tools = [
    {
      id: 'turnitin-detector',
      icon: ShieldCheck,
      title: 'AI Checker',
      subtitle: 'AI Writing Detection & Document Analysis',
      description: 'Dedicated Turnitin-style document AI detection, sentence highlighting & PDF report export.',
      color: 'from-sky-600 to-blue-700',
      badge: 'Turnitin-Style',
      features: [
        'Upload PDF, DOCX, TXT documents',
        'Signature Light-Blue sentence highlights (#DBEAFE)',
        'Interactive sentence AI score popovers',
        'Submissions inbox table with IndexedDB storage',
        'Export official PDF Turnitin report',
        'Auto / Groq / Gemini / OpenRouter / Ollama support',
      ],
    },
    {
      id: 'writewise',
      icon: Feather,
      title: 'GramoFix',
      subtitle: 'Grammar & Spelling Corrector',
      description: 'Grammarly-style local grammar, spelling, punctuation & readability corrector.',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Grammar Engine',
      features: [
        'Real-time wavy colored underlines',
        'Grammarly-style floating suggestion popups',
        'Overall Writing Score gauge (0–100)',
        'Flesch Readability & Tone meters',
        '1-click "Accept All" corrections',
        'Reading & Speaking time estimators',
      ],
    },
    {
      id: 'paraphrase',
      icon: Repeat,
      title: 'Paraphraser',
      subtitle: 'QuillBot-Style Rephraser',
      description: 'Rephrase text locally with custom modes, synonym density control & word freezer.',
      color: 'from-purple-600 to-pink-600',
      badge: 'QuillBot-Style',
      features: [
        '7 Paraphrase Modes (Standard, Formal, Academic, Creative, Shorten...)',
        'Synonym Density Slider (Low, Medium, High)',
        'Frozen Words list (lock custom technical terms)',
        '3 Alternative sentence variants per output',
      ],
    },
    {
      id: 'inspector',
      icon: Search,
      title: 'AI Inspector & Humanizer',
      subtitle: 'AI Detector & Text Remover',
      description: 'Detect AI likelihood score and convert text into natural human prose locally.',
      color: 'from-amber-500 to-orange-600',
      badge: 'AI Detector',
      features: [
        'AI Likelihood Score (0–100%) & Perplexity meter',
        'Document Uploader (.pdf, .doc/.docx, .tex, .txt, .md)',
        'Prominent Before vs After AI percentage banner',
        '4 Humanizer profiles (Natural, Conversational, Varied, Concise)',
      ],
    },
    {
      id: 'latex-studio',
      icon: Sigma,
      title: 'LaTeX Math Studio',
      subtitle: 'Formula Workspace & KaTeX Render',
      description: 'Offline LaTeX math equation editor with live KaTeX rendering canvas.',
      color: 'from-emerald-600 to-teal-600',
      badge: 'KaTeX Render',
      features: [
        'Side-by-side LaTeX editor + live KaTeX render',
        'Quick-insert Symbol Palette (Greek, Calculus, Matrices)',
        'Export rendered math to SVG, PNG, HTML, or PDF',
      ],
    },
    {
      id: 'resume-analyzer',
      icon: FileSpreadsheet,
      title: 'Resume ATS',
      subtitle: 'ATS Resume Score & Optimizer',
      description: 'Applicant Tracking System (ATS) compatibility checker and action verb upgrader.',
      color: 'from-indigo-600 to-cyan-600',
      badge: 'ATS Score',
      features: [
        'ATS Recruiter Match Score (0–100)',
        'Weak Action Verb upgrader (e.g. worked on → engineered)',
        'Quantification metric recommendations',
        '1-click resume language fixes',
      ],
    },
    {
      id: 'documents',
      icon: FolderKanban,
      title: 'Document Manager',
      subtitle: 'Local Storage & Search',
      description: 'Manage local documents with global search, autosave & IndexedDB persistence.',
      color: 'from-slate-700 to-slate-900',
      badge: 'Local Storage',
      features: [
        'Local document CRUD & title/content search',
        'Background autosave to prevent data loss',
        '100% offline local privacy guarantee',
      ],
    },
  ];

  return (
    <div className="flex-1 bg-slate-50/70 p-6 md:p-10 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-400">
                100% Offline AI & Writing Suite
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back to OmniWrite Pro
            </h1>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              Select a dedicated tool below to fix grammar, rephrase text, detect/humanize AI, write LaTeX, or check ATS resumes.
            </p>
          </div>

          <button
            onClick={onCreateDocument}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-all transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* 6 Suite Tools Tile Grid with Explicit Feature Lists */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Suite Applications & Features List
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => onNavigate(t.id)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${t.color} text-white shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        {t.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors dark:text-white dark:group-hover:text-brand-400">
                      {t.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mb-2">{t.subtitle}</p>
                    <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400 mb-4">
                      {t.description}
                    </p>

                    {/* Explicit Feature List */}
                    <div className="border-t border-slate-100 pt-3 space-y-1.5 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Key Features:
                      </span>
                      {t.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 text-xs font-bold text-brand-600 dark:border-slate-800 dark:text-brand-400">
                    <span>Open {t.title}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recent Local Documents ({documents.length})
            </h2>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-500 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="h-4 w-4 text-brand-600" />
                    <span className="text-[10px] font-bold uppercase">{formatDate(doc.updatedAt)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed dark:text-slate-400">
                    {doc.content || 'Empty document...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
