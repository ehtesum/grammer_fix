import React from 'react';
import { Check, X, BookPlus } from 'lucide-react';
import { Issue } from '../../engine/types';

interface InlineSuggestionPopupProps {
  issue: Issue;
  position: { top: number; left: number };
  onAccept: (issue: Issue) => void;
  onIgnore: (issue: Issue) => void;
  onAddToDictionary: (word: string) => void;
  onClose: () => void;
}

export const InlineSuggestionPopup: React.FC<InlineSuggestionPopupProps> = ({
  issue,
  position,
  onAccept,
  onIgnore,
  onAddToDictionary,
  onClose,
}) => {
  const categoryStyles: Record<string, { badge: string; border: string }> = {
    grammar: { badge: 'bg-red-100 text-red-700', border: 'border-red-200' },
    spelling: { badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
    punctuation: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
    clarity: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    conciseness: { badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
    vocabulary: { badge: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
  };

  const style = categoryStyles[issue.type] || { badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' };

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
    >
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${style.badge}`}>
          {issue.categoryName}
        </span>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Suggested Fix Header */}
      <div className="mb-2">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Correction</p>
        <div className="mt-1 flex items-center gap-2 text-sm leading-relaxed">
          <span className="line-through text-red-500/80 bg-red-50 px-1.5 py-0.5 rounded font-medium">
            {issue.original}
          </span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shadow-2xs">
            → {issue.replacement}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-600 mb-3.5 leading-normal">{issue.explanation}</p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => {
            onAccept(issue);
            onClose();
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition-all transform hover:scale-[1.02]"
        >
          <Check className="h-4 w-4" />
          <span>Accept</span>
        </button>

        <button
          onClick={() => {
            onIgnore(issue);
            onClose();
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Dismiss
        </button>

        {issue.type === 'spelling' && (
          <button
            onClick={() => {
              onAddToDictionary(issue.original);
              onIgnore(issue);
              onClose();
            }}
            className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            title="Add word to custom dictionary"
          >
            <BookPlus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
