import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FreeModelOption {
  id: string;
  name: string;
  provider: 'groq' | 'gemini' | 'openrouter' | 'ollama';
  rawModel: string;
  description: string;
  badge: string;
  getKeyUrl: string;
}

export const FREE_MODELS_PRESETS: FreeModelOption[] = [
  // 1. Groq Free Models
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq Free)',
    provider: 'groq',
    rawModel: 'llama-3.3-70b-versatile',
    description: 'Meta Llama 3.3 70B - Ultra fast 100% free cloud model',
    badge: 'Groq Free',
    getKeyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'groq/deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 70B (Groq Free)',
    provider: 'groq',
    rawModel: 'deepseek-r1-distill-llama-70b',
    description: 'DeepSeek R1 70B reasoning model on Groq',
    badge: 'Groq Free',
    getKeyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'groq/gemma2-9b-it',
    name: 'Gemma 2 9B (Groq Free)',
    provider: 'groq',
    rawModel: 'gemma2-9b-it',
    description: 'Google Gemma 2 9B instruction tuned model',
    badge: 'Groq Free',
    getKeyUrl: 'https://console.groq.com/keys',
  },

  // 2. Google Gemini Free Tier Models
  {
    id: 'gemini/gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Google Free)',
    provider: 'gemini',
    rawModel: 'gemini-2.0-flash',
    description: 'Google Next-Gen Gemini 2.0 Flash (1,500 free requests/day)',
    badge: 'Gemini Free',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'gemini/gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Google Free)',
    provider: 'gemini',
    rawModel: 'gemini-1.5-flash',
    description: 'Google Gemini 1.5 Flash fast free API tier',
    badge: 'Gemini Free',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },

  // 3. OpenRouter Free Tier Models
  {
    id: 'openrouter/meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B (OpenRouter Free)',
    provider: 'openrouter',
    rawModel: 'meta-llama/llama-3.2-3b-instruct:free',
    description: 'Llama 3.2 3B free endpoint via OpenRouter',
    badge: 'OpenRouter',
    getKeyUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'openrouter/deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (OpenRouter Free)',
    provider: 'openrouter',
    rawModel: 'deepseek/deepseek-r1:free',
    description: 'DeepSeek R1 reasoning free model',
    badge: 'OpenRouter',
    getKeyUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'openrouter/qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (OpenRouter Free)',
    provider: 'openrouter',
    rawModel: 'qwen/qwen-2.5-coder-32b-instruct:free',
    description: 'Alibaba Qwen 2.5 32B free endpoint',
    badge: 'OpenRouter',
    getKeyUrl: 'https://openrouter.ai/keys',
  },
];

export interface OllamaState {
  connected: boolean;
  activeModel: string | null;
  activeProvider: 'groq' | 'gemini' | 'openrouter' | 'ollama';
  availableModels: string[];
  endpoint: string;
  isChecking: boolean;
  groqKey: string;
  geminiKey: string;
  openrouterKey: string;
}

interface OllamaContextType {
  state: OllamaState;
  checkConnection: () => Promise<boolean>;
  selectModel: (modelId: string) => void;
  setApiKey: (provider: 'groq' | 'gemini' | 'openrouter', key: string) => void;
  deactivate: () => void;
  generateText: (prompt: string) => Promise<{ success: boolean; result: string; message?: string }>;
}

const DEFAULT_ENDPOINT = 'http://127.0.0.1:11434';

const OllamaContext = createContext<OllamaContextType | null>(null);

export const OllamaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OllamaState>({
    connected: true,
    activeModel: 'groq/llama-3.3-70b-versatile',
    activeProvider: 'groq',
    availableModels: FREE_MODELS_PRESETS.map((m) => m.id),
    endpoint: DEFAULT_ENDPOINT,
    isChecking: false,
    groqKey: localStorage.getItem('omniwrite_groq_key') || '',
    geminiKey: localStorage.getItem('omniwrite_gemini_key') || '',
    openrouterKey: localStorage.getItem('omniwrite_openrouter_key') || '',
  });

  const checkConnection = useCallback(async (): Promise<boolean> => {
    // Check if cloud keys exist
    const gKey = localStorage.getItem('omniwrite_groq_key') || '';
    const gemKey = localStorage.getItem('omniwrite_gemini_key') || '';
    const openKey = localStorage.getItem('omniwrite_openrouter_key') || '';

    setState((prev) => ({
      ...prev,
      connected: true,
      groqKey: gKey,
      geminiKey: gemKey,
      openrouterKey: openKey,
    }));

    // Check Ollama local fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${DEFAULT_ENDPOINT}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json();
        const models: string[] = (data.models || []).map((m: any) => `ollama/${m.name || m.model}`);

        setState((prev) => ({
          ...prev,
          connected: true,
          activeModel: models.length > 0 ? models[0] : prev.activeModel,
          availableModels: Array.from(new Set([...FREE_MODELS_PRESETS.map((m) => m.id), ...models])),
        }));
        return true;
      }
    } catch {
      // Unreachable
    }

    return false;
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const selectModel = (modelId: string) => {
    const preset = FREE_MODELS_PRESETS.find((m) => m.id === modelId);
    const provider = preset ? preset.provider : 'ollama';

    setState((prev) => ({
      ...prev,
      activeModel: modelId,
      activeProvider: provider,
      connected: true,
    }));
  };

  const setApiKey = (provider: 'groq' | 'gemini' | 'openrouter', key: string) => {
    if (provider === 'groq') localStorage.setItem('omniwrite_groq_key', key);
    if (provider === 'gemini') localStorage.setItem('omniwrite_gemini_key', key);
    if (provider === 'openrouter') localStorage.setItem('omniwrite_openrouter_key', key);

    setState((prev) => ({
      ...prev,
      connected: true,
      groqKey: provider === 'groq' ? key : prev.groqKey,
      geminiKey: provider === 'gemini' ? key : prev.geminiKey,
      openrouterKey: provider === 'openrouter' ? key : prev.openrouterKey,
    }));
  };

  const deactivate = () => {
    setState((prev) => ({ ...prev, connected: false, activeModel: null }));
  };

  const generateText = async (prompt: string): Promise<{ success: boolean; result: string; message?: string }> => {
    if (!state.activeModel) {
      return { success: false, result: '', message: 'Please select a model in the top header.' };
    }

    const preset = FREE_MODELS_PRESETS.find((m) => m.id === state.activeModel);
    const provider = preset ? preset.provider : 'ollama';
    const rawModel = preset ? preset.rawModel : state.activeModel.replace('ollama/', '');

    // 1. Groq Free API
    if (provider === 'groq') {
      const apiKey = state.groqKey || localStorage.getItem('omniwrite_groq_key');
      if (!apiKey) {
        return {
          success: false,
          result: '',
          message: 'Groq API Key required. Get a free key at console.groq.com',
        };
      }

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: rawModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textOut = data.choices?.[0]?.message?.content || '';
          return { success: true, result: textOut.trim() };
        } else {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            result: '',
            message: errData.error?.message || `Groq API Error (${response.status})`,
          };
        }
      } catch (e: any) {
        return { success: false, result: '', message: `Groq connection failed: ${e.message}` };
      }
    }

    // 2. Google Gemini Free Tier API
    if (provider === 'gemini') {
      const apiKey = state.geminiKey || localStorage.getItem('omniwrite_gemini_key');
      if (!apiKey) {
        return {
          success: false,
          result: '',
          message: 'Google Gemini API Key required. Get a free key at aistudio.google.com',
        };
      }

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${rawModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const textOut = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return { success: true, result: textOut.trim() };
        } else {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            result: '',
            message: errData.error?.message || `Gemini API Error (${response.status})`,
          };
        }
      } catch (e: any) {
        return { success: false, result: '', message: `Gemini connection failed: ${e.message}` };
      }
    }

    // 3. OpenRouter Free API
    if (provider === 'openrouter') {
      const apiKey = state.openrouterKey || localStorage.getItem('omniwrite_openrouter_key');
      if (!apiKey) {
        return {
          success: false,
          result: '',
          message: 'OpenRouter API Key required. Get a free key at openrouter.ai/keys',
        };
      }

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: rawModel,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textOut = data.choices?.[0]?.message?.content || '';
          return { success: true, result: textOut.trim() };
        }
      } catch (e: any) {
        return { success: false, result: '', message: `OpenRouter failed: ${e.message}` };
      }
    }

    // 4. Local Ollama Fallback
    try {
      const response = await fetch(`${DEFAULT_ENDPOINT}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: rawModel,
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, result: (data.response || '').trim() };
      }
    } catch (e: any) {
      return { success: false, result: '', message: `Local Ollama error: ${e.message}` };
    }

    return { success: false, result: '', message: 'Model generation failed. Check API key or Ollama connection.' };
  };

  return (
    <OllamaContext.Provider
      value={{
        state,
        checkConnection,
        selectModel,
        setApiKey,
        deactivate,
        generateText,
      }}
    >
      {children}
    </OllamaContext.Provider>
  );
};

export const useOllama = () => {
  const context = useContext(OllamaContext);
  if (!context) {
    throw new Error('useOllama must be used within an OllamaProvider');
  }
  return context;
};
