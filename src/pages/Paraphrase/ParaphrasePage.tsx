import React, { useState } from 'react';
import { useOllama } from '../../engine/OllamaContext';
import { paraphraseTextLocal, ParaphraseMode, SynonymDensity } from '../../engine/ParaphraseEngine';
import { Repeat, Sparkles, Copy, Check, Plus, Trash2, Sliders, Layers } from 'lucide-react';

export const ParaphrasePage: React.FC = () => {
  const { state: ollamaState, generateText } = useOllama();

  const [input, setInput] = useState(
    'The system processes sensor data in real time due to the fact that at this point in time a large number of tests were executed.'
  );
  const [output, setOutput] = useState('');
  const [variants, setVariants] = useState<string[]>([]);
  const [mode, setMode] = useState<ParaphraseMode>('standard');
  const [density, setDensity] = useState<SynonymDensity>('medium');
  const [frozenWords, setFrozenWords] = useState<string[]>(['WriteWise', 'OmniWrite']);
  const [newFrozenInput, setNewFrozenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const modes: { id: ParaphraseMode; label: string; desc: string }[] = [
    { id: 'standard', label: 'Standard', desc: 'Balanced rephrasing' },
    { id: 'fluency', label: 'Fluency', desc: 'Improves flow & grammar' },
    { id: 'formal', label: 'Formal', desc: 'Professional tone' },
    { id: 'academic', label: 'Academic', desc: 'Scholarly vocabulary' },
    { id: 'creative', label: 'Creative', desc: 'Expressive rephrasing' },
    { id: 'expand', label: 'Expand', desc: 'Adds explanatory detail' },
    { id: 'shorten', label: 'Shorten', desc: 'Concise & direct' },
  ];

  const handleParaphrase = async () => {
    if (!input.trim()) return;
    setLoading(true);

    if (ollamaState.connected && ollamaState.activeModel) {
      const prompt = `Paraphrase the following text in a ${mode} style with ${density} synonym variation. Protect these words from changing: [${frozenWords.join(
        ', '
      )}]. Return ONLY the paraphrased text:\n"${input}"`;

      const res = await generateText(prompt);
      setLoading(false);

      if (res.success && res.result) {
        setOutput(res.result);
        setVariants([
          res.result,
          `Alternatively: ${res.result}`,
          `In other words: ${res.result}`,
        ]);
        return;
      }
    }

    // Fallback local rule-based paraphrase engine
    setTimeout(() => {
      const res = paraphraseTextLocal(input, { mode, density, frozenWords });
      setOutput(res.output);
      setVariants(res.variants);
      setLoading(false);
    }, 200);
  };

  const handleAddFrozenWord = () => {
    if (newFrozenInput.trim() && !frozenWords.includes(newFrozenInput.trim())) {
      setFrozenWords([...frozenWords, newFrozenInput.trim()]);
      setNewFrozenInput('');
    }
  };

  const handleRemoveFrozenWord = (word: string) => {
    setFrozenWords(frozenWords.filter((w) => w !== word));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <Repeat className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Paraphrase Studio</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              QuillBot-style rephraser with 7 modes, synonym density control & word freezer.
            </p>
          </div>

          <button
            onClick={handleParaphrase}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all transform hover:scale-105"
          >
            <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Paraphrasing...' : 'Paraphrase Text'}</span>
          </button>
        </div>

        {/* Paraphrase Modes Bar */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-2 border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                mode === m.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Side-by-side Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Text</span>
              <span className="text-[11px] text-slate-400">{input.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type text to paraphrase..."
              className="flex-1 min-h-[220px] w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none dark:text-white"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paraphrased Result</span>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[220px] text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-100">
              {output ? (
                output
              ) : (
                <span className="text-slate-400 italic">Click "Paraphrase Text" to generate result...</span>
              )}
            </div>
          </div>
        </div>

        {/* Synonym Density & Word Freezer Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Synonym Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                  Synonym Density
                </span>
              </div>
              <span className="text-xs font-extrabold text-purple-600 uppercase">{density}</span>
            </div>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as SynonymDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`flex-1 rounded-xl py-1.5 text-xs font-bold capitalize transition-colors ${
                    density === d
                      ? 'bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Freeze Words */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 block">
              Frozen Words (Locked Jargon)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Lock word (e.g. LSTM)..."
                value={newFrozenInput}
                onChange={(e) => setNewFrozenInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFrozenWord()}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                onClick={handleAddFrozenWord}
                className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Lock</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {frozenWords.map((w) => (
                <span
                  key={w}
                  className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                >
                  <span>🔒 {w}</span>
                  <button onClick={() => handleRemoveFrozenWord(w)} className="hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Variants List */}
        {variants.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
              <Layers className="h-4 w-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                Alternative Sentence Variants
              </h3>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setOutput(v)}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-medium hover:border-purple-300 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <span>{v}</span>
                  <button className="text-purple-600 font-bold hover:underline shrink-0 ml-2">Use Variant</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
