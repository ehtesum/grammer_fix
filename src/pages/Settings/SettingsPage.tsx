import React, { useState } from 'react';
import { UserSettings } from '../../engine/types';
import { DictionaryStore } from '../../storage/DictionaryStore';
import { Sliders, Book, ShieldCheck, Trash2, Plus, Check } from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  isDarkMode,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'rules' | 'dictionary' | 'privacy'>('general');
  const [dictionary, setDictionary] = useState<string[]>(DictionaryStore.getWords());
  const [newWordInput, setNewWordInput] = useState('');

  const handleAddWord = () => {
    if (newWordInput.trim()) {
      const updated = DictionaryStore.addWord(newWordInput.trim());
      setDictionary(updated);
      setNewWordInput('');
    }
  };

  const handleRemoveWord = (word: string) => {
    const updated = DictionaryStore.removeWord(word);
    setDictionary(updated);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <h1 className="text-xl font-extrabold tracking-tight">OmniWrite Pro Settings & Privacy</h1>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Configure writing rules, personal dictionary & inspect offline privacy model.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 rounded-xl py-2 transition-colors ${
              activeTab === 'general' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            General Preferences
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 rounded-xl py-2 transition-colors ${
              activeTab === 'rules' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Writing Rules
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex-1 rounded-xl py-2 transition-colors ${
              activeTab === 'dictionary' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Personal Dictionary
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 rounded-xl py-2 transition-colors ${
              activeTab === 'privacy' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Privacy Center
          </button>
        </div>

        {/* Tab Panels */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Check while typing</p>
                  <p className="text-[11px] text-slate-500">Debounced real-time local document analysis</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.checkWhileTyping}
                  onChange={(e) => onUpdateSettings({ ...settings, checkWhileTyping: e.target.checked })}
                  className="h-4 w-4 rounded text-purple-600"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Auto-save documents</p>
                  <p className="text-[11px] text-slate-500">Persist document changes automatically to local storage</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => onUpdateSettings({ ...settings, autoSave: e.target.checked })}
                  className="h-4 w-4 rounded text-purple-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Appearance Theme</p>
                  <p className="text-[11px] text-slate-500">Toggle between Light and Dark visual mode</p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                >
                  {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {(Object.keys(settings.enabledRules) as Array<keyof UserSettings['enabledRules']>).map((ruleKey) => (
                <label
                  key={ruleKey}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/50 cursor-pointer dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <span className="font-bold capitalize">{ruleKey} Rule Checker</span>
                  <input
                    type="checkbox"
                    checked={settings.enabledRules[ruleKey]}
                    onChange={() =>
                      onUpdateSettings({
                        ...settings,
                        enabledRules: {
                          ...settings.enabledRules,
                          [ruleKey]: !settings.enabledRules[ruleKey],
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-purple-600"
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'dictionary' && (
            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom word..."
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={handleAddWord}
                  className="flex items-center gap-1 rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Word</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {dictionary.map((word) => (
                  <span
                    key={word}
                    className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                  >
                    <span>{word}</span>
                    <button onClick={() => handleRemoveWord(word)} className="hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>🟢 100% Offline-First Architecture</span>
                </div>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                  Your documents, sentences, dictionary terms, and AI prompts stay exclusively on this computer.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="flex items-center gap-2 font-semibold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Zero cloud AI (No OpenAI, Claude, Gemini, or Grammarly APIs)</span>
                </p>
                <p className="flex items-center gap-2 font-semibold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Zero remote analytics or telemetry tracking</span>
                </p>
                <p className="flex items-center gap-2 font-semibold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>All grammar, spelling, and readability engines process locally</span>
                </p>
                <p className="flex items-center gap-2 font-semibold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Local LLM runs through Ollama on localhost (127.0.0.1:11434)</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
