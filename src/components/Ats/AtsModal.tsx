import React from 'react';
import { AtsScore, AtsIssue } from '../../engine/types';
import { Award, Check, Sparkles, AlertCircle, FileSpreadsheet, X, Zap } from 'lucide-react';

interface AtsModalProps {
  atsScore: AtsScore;
  onApplyFix: (issue: AtsIssue) => void;
  onClose: () => void;
}

export const AtsModal: React.FC<AtsModalProps> = ({ atsScore, onApplyFix, onClose }) => {
  let scoreColor = 'text-emerald-600 border-emerald-500 bg-emerald-50';
  if (atsScore.overall < 70) scoreColor = 'text-amber-600 border-amber-500 bg-amber-50';
  if (atsScore.overall < 55) scoreColor = 'text-red-600 border-red-500 bg-red-50';

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ATS Resume Optimizer & Checker</h2>
              <p className="text-xs text-slate-500">Applicant Tracking System Score & Actionable Recruiter Suggestions</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">ATS Match Readiness</span>
              </div>
              <h3 className="text-xl font-bold">{atsScore.label}</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Optimized resumes with strong action verbs and quantified metrics pass ATS filters 3x faster.
              </p>
            </div>

            {/* Gauge */}
            <div className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-4 font-extrabold shadow-md ${scoreColor}`}>
              <span className="text-3xl">{atsScore.overall}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">/ 100 ATS</span>
            </div>
          </div>

          {/* ATS Metrics Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Action Verbs</p>
              <p className="text-lg font-bold text-indigo-600 mt-0.5">{atsScore.actionVerbsScore}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Quantification Metrics</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{atsScore.quantificationScore}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Structure Headers</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{atsScore.skillsKeywordScore}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Formatting & Clichés</p>
              <p className="text-lg font-bold text-purple-600 mt-0.5">{atsScore.formattingScore}%</p>
            </div>
          </div>

          {/* ATS Action Suggestions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>ATS Improvement Suggestions ({atsScore.issues.length})</span>
              </h3>
            </div>

            {atsScore.issues.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-emerald-800">
                <Zap className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Great job! Outstanding ATS Score</h4>
                <p className="text-xs text-emerald-700 mt-1">No weak action verbs or resume clichés detected.</p>
              </div>
            ) : (
              atsScore.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                      {issue.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">High Impact</span>
                  </div>

                  <div className="mb-2 text-xs">
                    {issue.original !== 'Achievements without numbers' && issue.original !== 'Document structure' ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-medium">
                          {issue.original}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          → {issue.replacement}
                        </span>
                      </div>
                    ) : (
                      <p className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        💡 Suggestion: {issue.replacement}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{issue.explanation}</p>

                  {issue.from > 0 && (
                    <button
                      onClick={() => onApplyFix(issue)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Apply Fix in Document</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
