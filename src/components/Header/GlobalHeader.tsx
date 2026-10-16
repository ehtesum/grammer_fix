import React, { useState } from 'react';
import { useOllama, FREE_MODELS_PRESETS } from '../../engine/OllamaContext';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronLeft,
  ShieldCheck,
  Feather,
  Key,
  ExternalLink,
} from 'lucide-react';

interface GlobalHeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenPrivacyModal: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  currentRoute,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  onOpenPrivacyModal,
}) => {
  const { state: aiState, selectModel, setApiKey, checkConnection } = useOllama();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedProviderForKey, setSelectedProviderForKey] = useState<'groq' | 'gemini' | 'openrouter'>('groq');
  const [inputKey, setInputKey] = useState('');

  const activePreset = FREE_MODELS_PRESETS.find((m) => m.id === aiState.activeModel);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    selectModel(val);

    const preset = FREE_MODELS_PRESETS.find((m) => m.id === val);
    if (preset) {
      if (preset.provider === 'groq' && !aiState.groqKey) {
        setSelectedProviderForKey('groq');
        setInputKey('');
        setShowKeyModal(true);
      } else if (preset.provider === 'gemini' && !aiState.geminiKey) {
        setSelectedProviderForKey('gemini');
        setInputKey('');
        setShowKeyModal(true);
      } else if (preset.provider === 'openrouter' && !aiState.openrouterKey) {
        setSelectedProviderForKey('openrouter');
        setInputKey('');
        setShowKeyModal(true);
      }
    }
  };

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setApiKey(selectedProviderForKey, inputKey.trim());
    }
    setShowKeyModal(false);
  };

  const currentProviderKeyUrl =
    selectedProviderForKey === 'groq'
      ? 'https://console.groq.com/keys'
      : selectedProviderForKey === 'gemini'
      ? 'https://aistudio.google.com/app/apikey'
      : 'https://openrouter.ai/keys';

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-2xs select-none dark:border-slate-800 dark:bg-slate-900">
      {/* Left Brand & Navigation */}
      <div className="flex items-center gap-4">
        {currentRoute !== 'dashboard' ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xs">
              <Feather className="h-4 w-4" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              OmniWrite Pro
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Route Title Badge */}
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {currentRoute === 'dashboard'
            ? 'Suite Hub'
            : currentRoute === 'writewise'
            ? 'GramoFix'
            : currentRoute === 'inspector'
            ? 'AI Inspector & Humanizer'
            : currentRoute === 'turnitin-detector'
            ? 'AI Checker (Writing Detection & Document Analysis)'
            : currentRoute === 'resume-analyzer'
            ? 'Resume ATS'
            : currentRoute === 'paraphrase'
            ? 'Paraphraser'
            : currentRoute === 'latex-studio'
            ? 'LaTeX Math Studio'
            : currentRoute === 'documents'
            ? 'Document Manager'
            : currentRoute.replace('-', ' ')}
        </span>
      </div>

      {/* Right Controls: Free Model Dropdown Selector */}
      <div className="flex items-center gap-3">
        {/* FREE AI MODEL DROPDOWN SELECTOR */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <select
            value={aiState.activeModel || ''}
            onChange={handleModelChange}
            className="bg-transparent text-xs font-black text-slate-900 dark:text-slate-100 focus:outline-none max-w-[220px]"
          >
            <optgroup label="🚀 Groq (100% Free API)" className="text-black bg-white font-bold">
              <option value="groq/llama-3.3-70b-versatile" className="text-black bg-white font-semibold">🚀 Llama 3.3 70B (Groq Free)</option>
              <option value="groq/deepseek-r1-distill-llama-70b" className="text-black bg-white font-semibold">🚀 DeepSeek R1 70B (Groq Free)</option>
              <option value="groq/gemma2-9b-it" className="text-black bg-white font-semibold">🚀 Gemma 2 9B (Groq Free)</option>
            </optgroup>

            <optgroup label="⚡ Google Gemini (100% Free Tier)" className="text-black bg-white font-bold">
              <option value="gemini/gemini-2.0-flash" className="text-black bg-white font-semibold">⚡ Gemini 2.0 Flash (Google Free)</option>
              <option value="gemini/gemini-1.5-flash" className="text-black bg-white font-semibold">⚡ Gemini 1.5 Flash (Google Free)</option>
            </optgroup>

            <optgroup label="🌐 OpenRouter Free Models" className="text-black bg-white font-bold">
              <option value="openrouter/meta-llama/llama-3.2-3b-instruct:free" className="text-black bg-white font-semibold">🌐 Llama 3.2 3B (OpenRouter Free)</option>
              <option value="openrouter/deepseek/deepseek-r1:free" className="text-black bg-white font-semibold">🌐 DeepSeek R1 (OpenRouter Free)</option>
              <option value="openrouter/qwen/qwen-2.5-coder-32b-instruct:free" className="text-black bg-white font-semibold">🌐 Qwen 2.5 32B (OpenRouter Free)</option>
            </optgroup>

            <optgroup label="🤖 Local Ollama Models" className="text-black bg-white font-bold">
              {aiState.availableModels
                .filter((m) => m.startsWith('ollama/'))
                .map((m) => (
                  <option key={m} value={m} className="text-black bg-white font-semibold">
                    🤖 {m.replace('ollama/', '')} (Local Ollama)
                  </option>
                ))}
            </optgroup>
          </select>

          {activePreset && (
            <button
              onClick={() => {
                setSelectedProviderForKey(activePreset.provider as any);
                setInputKey(
                  activePreset.provider === 'groq'
                    ? aiState.groqKey
                    : activePreset.provider === 'gemini'
                    ? aiState.geminiKey
                    : aiState.openrouterKey
                );
                setShowKeyModal(true);
              }}
              className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
              title="Set or view free API key"
            >
              Key
            </button>
          )}
        </div>

        {/* Offline Badge */}
        <button
          onClick={onOpenPrivacyModal}
          className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          title="Privacy details"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privacy Guaranteed</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </div>

      {/* FREE API KEY ENTRY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-base capitalize text-slate-900 dark:text-white">
                  {selectedProviderForKey} Free API Key
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Get your <b>100% Free API Key</b> (no credit card required) directly from {selectedProviderForKey}:
            </p>

            <a
              href={currentProviderKeyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Get Free {selectedProviderForKey.toUpperCase()} Key</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder={`Paste your ${selectedProviderForKey} API key here...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-amber-700 transition-colors"
              >
                Save & Activate Model
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
