import React, { useState } from 'react';
import { analyzeAtsScore } from '../../engine/AtsEngine';
import { AtsScore, AtsIssue } from '../../engine/types';
import { FileSpreadsheet, Award, Check } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [resumeText, setResumeText] = useState(
    `Worked on backend web development and helped with project deployment. Responsible for reviewing code and handled database setup. Hardworking team player with passion for technology.`
  );
  const [jobDescription, setJobDescription] = useState(
    `Seeking a Senior Software Engineer with strong experience in Python, React, PostgreSQL, Docker, and CI/CD pipelines.`
  );

  const atsScore: AtsScore = analyzeAtsScore(resumeText);

  // Exact character slice replacement fix to prevent replacing the wrong occurrence on duplicate words
  const handleApplyFix = (issue: AtsIssue) => {
    if (!issue.original) return;

    if (
      issue.from !== undefined &&
      issue.to !== undefined &&
      resumeText.slice(issue.from, issue.to) === issue.original
    ) {
      const before = resumeText.slice(0, issue.from);
      const after = resumeText.slice(issue.to);
      setResumeText(before + issue.replacement + after);
    } else {
      setResumeText(resumeText.replace(issue.original, issue.replacement));
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Resume ATS Checker & Optimizer</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Evaluates ATS recruiter compatibility, weak action verbs & quantification metrics.
            </p>
          </div>
        </div>

        {/* Score Banner & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-md">
            <div>
              <div className="flex items-center gap-2 text-indigo-400">
                <Award className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">ATS Score</span>
              </div>
              <h3 className="text-2xl font-black mt-2">{atsScore.label}</h3>
            </div>
            <div className="my-4">
              <span className="text-5xl font-black text-indigo-400">{atsScore.overall}</span>
              <span className="text-xs text-slate-400 block font-bold">/ 100 ATS Match</span>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
              ATS Dimension Scores
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Action Verbs Impact</p>
                <p className="text-lg font-bold text-indigo-600 mt-0.5 dark:text-indigo-400">{atsScore.actionVerbsScore}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Quantified Metrics</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5 dark:text-emerald-400">{atsScore.quantificationScore}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Section Headers</p>
                <p className="text-lg font-bold text-blue-600 mt-0.5 dark:text-blue-400">{atsScore.skillsKeywordScore}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cliché Avoidance</p>
                <p className="text-lg font-bold text-purple-600 mt-0.5 dark:text-purple-400">{atsScore.formattingScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text Area & Action Fixes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resume Content</span>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full min-h-[260px] resize-none bg-transparent text-sm leading-relaxed focus:outline-none dark:text-white"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Actionable Fixes ({atsScore.issues.length})
            </span>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {atsScore.issues.map((issue) => (
                <div key={issue.id} className="rounded-xl border border-slate-200 p-3 text-xs space-y-2 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{issue.title}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{issue.impact} Impact</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{issue.explanation}</p>
                  {issue.original !== 'Achievements without numbers' && issue.original !== 'Document structure' && (
                    <button
                      onClick={() => handleApplyFix(issue)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Upgrade Language</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
