import React, { useState, useEffect } from 'react';
import { UserSettings } from '../../engine/types';
import { DictionaryStore } from '../../storage/DictionaryStore';
import { localLLM, LocalAIStatus } from '../../engine/LocalLLM';
import { Sliders, Book, Cpu, Trash2, Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'writing' | 'dictionary' | 'ai'>('general');
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [newWordInput, setNewWordInput] = useState('');
  const [aiStatus, setAiStatus] = useState<LocalAIStatus | null>(null);
  const [checkingAi, setCheckingAi] = useState(false);

  useEffect(() => {
    setDictionary(DictionaryStore.getWords());
    checkAiEngine();
  }, []);

  const checkAiEngine = async () => {
    setCheckingAi(true);
    const res = await localLLM.checkStatus();
    setAiStatus(res);
    setCheckingAi(false);
  };

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

  const toggleRule = (ruleKey: keyof UserSettings['enabledRules']) => {
    onUpdateSettings({
      ...settings,
      enabledRules: {
        ...settings.enabledRules,
        [ruleKey]: !settings.enabledRules[ruleKey],
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">WriteWise Settings</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            ✕
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Sidebar Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-3 space-y-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                activeTab === 'general' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('writing')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                activeTab === 'writing' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Writing Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                activeTab === 'dictionary' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <Book className="h-4 w-4" />
              <span>Personal Dictionary</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                activeTab === 'ai' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Local AI Engine</span>
            </button>
          </div>

          {/* Settings Tab Panels */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">General Preferences</h3>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Check while typing</p>
                    <p className="text-[11px] text-slate-500">Real-time debounced local document analysis</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.checkWhileTyping}
                    onChange={(e) => onUpdateSettings({ ...settings, checkWhileTyping: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Auto-save documents</p>
                    <p className="text-[11px] text-slate-500">Automatically persist document edits locally</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => onUpdateSettings({ ...settings, autoSave: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                </div>
              </div>
            )}

            {activeTab === 'writing' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Enabled Grammar Rules</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(settings.enabledRules) as Array<keyof UserSettings['enabledRules']>).map((ruleKey) => (
                    <label key={ruleKey} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/50 cursor-pointer">
                      <span className="text-xs font-bold text-slate-800 capitalize">{ruleKey}</span>
                      <input
                        type="checkbox"
                        checked={settings.enabledRules[ruleKey]}
                        onChange={() => toggleRule(ruleKey)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'dictionary' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Dictionary</h3>
                <p className="text-xs text-slate-500">Words listed here will never be flagged as spelling errors.</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom word..."
                    value={newWordInput}
                    onChange={(e) => setNewWordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddWord}
                    className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {dictionary.map((word) => (
                    <span key={word} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      <span>{word}</span>
                      <button onClick={() => handleRemoveWord(word)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Local AI Status</h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Local AI Engine</p>
                      <p className="text-xs text-slate-500 mt-0.5">Runtime: Ollama (http://127.0.0.1:11434)</p>
                    </div>

                    <button
                      onClick={checkAiEngine}
                      disabled={checkingAi}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${checkingAi ? 'animate-spin' : ''}`} />
                      <span>Check Local AI</span>
                    </button>
                  </div>

                  {aiStatus?.available ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-100/70 p-3 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{aiStatus.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Not detected</p>
                        <p className="mt-0.5 text-amber-700 leading-relaxed">
                          Install Ollama locally and run a model (e.g. <code className="bg-amber-100 px-1 rounded">ollama run llama3</code>) to activate local AI text rewriting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
