import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-6 text-white text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">100% Offline & Private</h2>
          <p className="text-xs text-emerald-100 mt-1">Your writing stays exclusively on your machine.</p>
        </div>

        <div className="p-6 space-y-3 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>No cloud connections or external API calls</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>Text analysis executed locally in background</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>Documents & dictionary stored in local encrypted storage</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>Optional AI rewriting runs through local Ollama runtime</span>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
