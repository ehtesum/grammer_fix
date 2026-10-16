import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AIRewriteMode, localLLM } from '../../engine/LocalLLM';

interface AIToolbarProps {
  selectedText: string;
  onApplyRewrite: (newText: string) => void;
  onClose: () => void;
}

export const AIToolbar: React.FC<AIToolbarProps> = ({ selectedText, onApplyRewrite, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAction = async (mode: AIRewriteMode) => {
    setLoading(true);
    setNotice(null);

    const res = await localLLM.rewrite(selectedText, mode);
    setLoading(false);

    if (res.success) {
      setResult(res.result);
    } else {
      setNotice(res.message || 'Local AI model not detected.');
    }
  };

  return (
    <div className="rounded-xl border border-purple-200 bg-white p-3.5 shadow-xl transition-all duration-200 max-w-lg w-full">
      <div className="flex items-center justify-between border-b border-purple-100 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Local AI Tools</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">
          ✕
        </button>
      </div>

      {!result && !notice && (
        <div>
          <p className="text-xs text-slate-500 mb-2 truncate italic">
            "{selectedText.slice(0, 70)}{selectedText.length > 70 ? '...' : ''}"
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAction('improve')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Improve</span>
            </button>
            <button
              onClick={() => handleAction('rewrite')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Rewrite</span>
            </button>
            <button
              onClick={() => handleAction('concise')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Make concise</span>
            </button>
            <button
              onClick={() => handleAction('formal')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Make formal</span>
            </button>
            <button
              onClick={() => handleAction('friendly')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Make friendly</span>
            </button>
            <button
              onClick={() => handleAction('simplify')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50/50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>✨ Simplify</span>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 text-purple-600">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <span className="text-xs font-medium">Generating local AI suggestion...</span>
        </div>
      )}

      {notice && (
        <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
          <div className="flex items-start gap-2 text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold mb-1">Local AI model not detected</p>
              <p className="text-amber-700 leading-relaxed mb-2">
                Install a supported local model (e.g. Ollama running at localhost:11434) to enable AI rewriting.
              </p>
              <p className="text-amber-600 font-medium">
                ✓ All grammar checking and spelling corrections work 100% offline without AI.
              </p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs">
            <p className="text-slate-400 font-semibold mb-1 uppercase tracking-wider">AI Suggestion</p>
            <p className="text-slate-800 font-medium leading-relaxed">{result}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setResult(null)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              onClick={() => {
                onApplyRewrite(result);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept Rewrite</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
