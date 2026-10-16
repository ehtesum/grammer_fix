import React, { useState } from 'react';
import { WritingScoreCard } from './WritingScoreCard';
import { SuggestionCard } from './SuggestionCard';
import { ReadabilityPanel } from './ReadabilityPanel';
import { TonePanel } from './TonePanel';
import { Issue, ReadabilityMetrics, ToneMetrics, WritingScore } from '../../engine/types';
import { CheckCircle2, CheckCheck } from 'lucide-react';

interface RightSidebarProps {
  issues: Issue[];
  score: WritingScore;
  readability: ReadabilityMetrics;
  tone: ToneMetrics;
  activeIssueId: string | null;
  onAcceptIssue: (issue: Issue) => void;
  onAcceptAllIssues: () => void;
  onIgnoreIssue: (issue: Issue) => void;
  onAddToDictionary: (word: string) => void;
  onSelectIssueId: (id: string | null) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  issues,
  score,
  readability,
  tone,
  activeIssueId,
  onAcceptIssue,
  onAcceptAllIssues,
  onIgnoreIssue,
  onAddToDictionary,
  onSelectIssueId,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'readability' | 'tone'>('suggestions');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredIssues = issues.filter((iss) => {
    if (categoryFilter === 'all') return true;
    return iss.type === categoryFilter;
  });

  return (
    <div className="flex h-full w-80 min-w-[320px] flex-col border-l border-slate-200/80 bg-slate-50/60 p-4 overflow-y-auto space-y-4 select-none">
      {/* Top Writing Score Card */}
      <WritingScoreCard score={score} totalIssuesCount={issues.length} />

      {/* Navigation Tabs */}
      <div className="flex rounded-lg bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            activeTab === 'suggestions' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          Suggestions ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('readability')}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            activeTab === 'readability' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          Readability
        </button>
        <button
          onClick={() => setActiveTab('tone')}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            activeTab === 'tone' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          Tone
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'suggestions' && (
        <div className="space-y-3">
          {/* Header & Accept All Action */}
          {issues.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issues List</span>
              <button
                onClick={onAcceptAllIssues}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                title="Accept all suggestions at once"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Accept All ({issues.length})</span>
              </button>
            </div>
          )}

          {/* Category Filters */}
          {issues.length > 0 && (
            <div className="flex flex-wrap gap-1 text-[11px] font-medium">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  categoryFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({issues.length})
              </button>
              <button
                onClick={() => setCategoryFilter('grammar')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  categoryFilter === 'grammar' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Grammar
              </button>
              <button
                onClick={() => setCategoryFilter('spelling')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  categoryFilter === 'spelling' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Spelling
              </button>
              <button
                onClick={() => setCategoryFilter('conciseness')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  categoryFilter === 'conciseness' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Conciseness
              </button>
            </div>
          )}

          {/* Issues List or Empty State */}
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-white border border-slate-200/80 p-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">✓ Looks good!</h4>
              <p className="text-xs text-slate-500 mt-1">No writing issues detected in this category.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <SuggestionCard
                key={issue.id}
                issue={issue}
                isActive={activeIssueId === issue.id}
                onAccept={onAcceptIssue}
                onIgnore={onIgnoreIssue}
                onAddToDictionary={onAddToDictionary}
                onClick={() => onSelectIssueId(issue.id)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'readability' && <ReadabilityPanel metrics={readability} />}
      {activeTab === 'tone' && <TonePanel tone={tone} />}
    </div>
  );
};
