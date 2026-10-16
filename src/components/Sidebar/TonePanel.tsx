import React from 'react';
import { ToneMetrics } from '../../engine/types';
import { Smile } from 'lucide-react';

interface TonePanelProps {
  tone: ToneMetrics;
}

export const TonePanel: React.FC<TonePanelProps> = ({ tone }) => {
  const tones = [
    { label: 'Professional', score: tone.professional, color: 'bg-indigo-500' },
    { label: 'Formal', score: tone.formal, color: 'bg-blue-500' },
    { label: 'Confident', score: tone.confident, color: 'bg-purple-500' },
    { label: 'Friendly', score: tone.friendly, color: 'bg-emerald-500' },
    { label: 'Casual', score: tone.casual, color: 'bg-amber-500' },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Smile className="h-4 w-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tone Detector</h3>
        </div>
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-100">
          {tone.dominantTone}
        </span>
      </div>

      <div className="space-y-2.5 pt-1 text-xs">
        {tones.map((t) => (
          <div key={t.label}>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-slate-600">{t.label}</span>
              <span className="font-bold text-slate-800">{t.score}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${t.color} transition-all duration-300`}
                style={{ width: `${t.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 italic pt-1">Estimated heuristic tone metrics processed locally.</p>
    </div>
  );
};
