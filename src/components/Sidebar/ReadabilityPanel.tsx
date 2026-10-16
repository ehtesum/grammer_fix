import React from 'react';
import { ReadabilityMetrics } from '../../engine/types';
import { BookOpen, FileText, AlignLeft, Hash } from 'lucide-react';

interface ReadabilityPanelProps {
  metrics: ReadabilityMetrics;
}

export const ReadabilityPanel: React.FC<ReadabilityPanelProps> = ({ metrics }) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <BookOpen className="h-4 w-4 text-brand-600" />
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Readability Analysis</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Flesch Reading Ease</p>
          <p className="text-xl font-bold text-brand-600 mt-0.5">{metrics.fleschScore}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Reading Level</p>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={metrics.readingLevel}>
            {metrics.readingLevel}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <AlignLeft className="h-3.5 w-3.5" />
            <span>Avg sentence length</span>
          </div>
          <span className="font-semibold text-slate-800">{metrics.avgSentenceLength} words</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            <span>Avg word length</span>
          </div>
          <span className="font-semibold text-slate-800">{metrics.avgWordLength} chars</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Hash className="h-3.5 w-3.5" />
            <span>Sentences / Words</span>
          </div>
          <span className="font-semibold text-slate-800">
            {metrics.sentenceCount} / {metrics.wordCount}
          </span>
        </div>
      </div>
    </div>
  );
};
