import React from 'react';
import { Check, X, BookPlus } from 'lucide-react';
import { Issue } from '../../engine/types';

interface SuggestionCardProps {
  issue: Issue;
  isActive: boolean;
  onAccept: (issue: Issue) => void;
  onIgnore: (issue: Issue) => void;
  onAddToDictionary?: (word: string) => void;
  onClick: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  issue,
  isActive,
  onAccept,
  onIgnore,
  onAddToDictionary,
  onClick,
}) => {
  const categoryStyles: Record<string, { badge: string; border: string }> = {
    grammar: { badge: 'bg-red-100 text-red-700', border: 'border-red-200 hover:border-red-300' },
    spelling: { badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200 hover:border-amber-300' },
    punctuation: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200 hover:border-purple-300' },
    clarity: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200 hover:border-blue-300' },
    conciseness: { badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200 hover:border-emerald-300' },
    vocabulary: { badge: 'bg-pink-100 text-pink-700', border: 'border-pink-200 hover:border-pink-300' },
  };

  const style = categoryStyles[issue.type] || { badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-3.5 shadow-xs transition-all duration-200 cursor-pointer ${style.border} ${
        isActive ? 'ring-2 ring-brand-500 shadow-md bg-slate-50/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
          {issue.categoryName}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIgnore(issue);
          }}
          className="text-slate-400 hover:text-slate-600 rounded p-1"
          title="Ignore suggestion"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Comparison View */}
      <div className="mb-2 text-xs leading-relaxed">
        <span className="line-through text-red-500/80 bg-red-50 px-1 py-0.5 rounded font-medium mr-1.5">
          {issue.original}
        </span>
        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
          → {issue.replacement}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-600 mb-3 leading-normal">{issue.explanation}</p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept(issue);
          }}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition-colors"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onIgnore(issue);
          }}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Ignore
        </button>

        {issue.type === 'spelling' && onAddToDictionary && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToDictionary(issue.original);
              onIgnore(issue);
            }}
            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/50 px-2 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors ml-auto"
            title="Add to personal dictionary"
          >
            <BookPlus className="h-3.5 w-3.5" />
            <span>Add Word</span>
          </button>
        )}
      </div>
    </div>
  );
};
