export type AIRewriteMode = 'improve' | 'rewrite' | 'concise' | 'formal' | 'friendly' | 'simplify';

export interface LocalAIStatus {
  available: boolean;
  modelName?: string;
  runtime?: string;
  message: string;
}

export class LocalLLMEngine {
  private endpoint: string;

  constructor(endpoint: string = 'http://127.0.0.1:11434') {
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  public setEndpoint(endpoint: string) {
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  public async checkStatus(): Promise<LocalAIStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const modelName = models.length > 0 ? models[0].name : 'llama3 / mistral';

        return {
          available: true,
          modelName,
          runtime: 'Ollama (Local)',
          message: `Connected to local AI model (${modelName})`,
        };
      }
    } catch {
      // Endpoint unreachable
    }

    return {
      available: false,
      message: 'Local AI model not detected. Install a supported local model (e.g., Ollama running at localhost:11434) to enable AI rewriting. Grammar checking and spelling correction work 100% offline without AI.',
    };
  }

  public async rewrite(text: string, mode: AIRewriteMode): Promise<{ success: boolean; result: string; message?: string }> {
    const status = await this.checkStatus();
    if (!status.available) {
      return {
        success: false,
        result: text,
        message: status.message,
      };
    }

    const prompts: Record<AIRewriteMode, string> = {
      improve: `Improve the clarity, grammar, and style of this text. Return ONLY the rewritten text without explanations:\n"${text}"`,
      rewrite: `Rephrase this text smoothly while keeping the same meaning. Return ONLY the rewritten text:\n"${text}"`,
      concise: `Make this text more concise and direct. Remove wordiness. Return ONLY the rewritten text:\n"${text}"`,
      formal: `Rewrite this text in a professional, formal tone suitable for business or academics. Return ONLY the rewritten text:\n"${text}"`,
      friendly: `Rewrite this text in a warm, friendly, and engaging tone. Return ONLY the rewritten text:\n"${text}"`,
      simplify: `Simplify the vocabulary and sentence structure of this text so it is easy to read. Return ONLY the rewritten text:\n"${text}"`,
    };

    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.modelName || 'llama3',
          prompt: prompts[mode],
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const output = (data.response || '').trim().replace(/^"/, '').replace(/"$/, '');
        return { success: true, result: output || text };
      }
    } catch (e: any) {
      return { success: false, result: text, message: `Local LLM request failed: ${e.message}` };
    }

    return { success: false, result: text, message: 'Could not communicate with local LLM server.' };
  }
}

export const localLLM = new LocalLLMEngine();
