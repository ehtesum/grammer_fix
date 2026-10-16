import React from 'react';
import { WritingScore } from '../../engine/types';

interface WritingScoreCardProps {
  score: WritingScore;
  totalIssuesCount: number;
}

export const WritingScoreCard: React.FC<WritingScoreCardProps> = ({ score, totalIssuesCount }) => {
  // Score color helper
  let scoreBg = 'text-emerald-600 border-emerald-500 bg-emerald-50';
  if (score.overall < 70) scoreBg = 'text-amber-600 border-amber-500 bg-amber-50';
  if (score.overall < 50) scoreBg = 'text-red-600 border-red-500 bg-red-50';

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Writing Score</h3>
          <p className="text-sm font-semibold text-slate-800">{score.label}</p>
        </div>

        {/* Circular / Badge Score Gauge */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-bold text-xl shadow-xs ${scoreBg}`}>
          {score.overall}
        </div>
      </div>

      {/* Issues summary text */}
      <div className="mb-4 text-xs text-slate-500 font-medium">
        {totalIssuesCount === 0 ? (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            ✓ Looks good — No issues detected
          </span>
        ) : (
          <span>{totalIssuesCount} suggestion{totalIssuesCount > 1 ? 's' : ''} to review</span>
        )}
      </div>

      {/* Sub-score progress bars */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
        <div>
          <div className="flex justify-between font-medium mb-1">
            <span className="text-slate-600">Correctness</span>
            <span className="font-bold text-slate-800">{score.correctness}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${score.correctness}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-medium mb-1">
            <span className="text-slate-600">Clarity</span>
            <span className="font-bold text-slate-800">{score.clarity}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${score.clarity}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-medium mb-1">
            <span className="text-slate-600">Engagement</span>
            <span className="font-bold text-slate-800">{score.engagement}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink-500 transition-all duration-300"
              style={{ width: `${score.engagement}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-medium mb-1">
            <span className="text-slate-600">Delivery</span>
            <span className="font-bold text-slate-800">{score.delivery}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${score.delivery}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
