import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Sigma, Code, Eye, Download, Copy, Check, Sparkles, Plus } from 'lucide-react';

export const LatexStudioPage: React.FC = () => {
  const [latexCode, setLatexCode] = useState<string>(
    `\\[\nE = mc^2\n\\]\n\n\\[\n\\int_0^\\infty e^{-x} dx = 1\n\\]\n\n\\[\nA = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}\n\\]`
  );
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setError(null);
      // Clean and render math formulas
      const html = katex.renderToString(latexCode, {
        displayMode: true,
        throwOnError: false,
      });
      setRenderedHtml(html);
    } catch (e: any) {
      setError(e.message);
    }
  }, [latexCode]);

  const insertSymbol = (symbolCode: string) => {
    setLatexCode((prev) => prev + ' ' + symbolCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHtml = () => {
    const fullContent = `<!DOCTYPE html><html><head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></head><body>${renderedHtml}</body></html>`;
    const blob = new Blob([fullContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'latex_equation.html';
    a.click();
  };

  const symbolGroups = [
    { name: 'Greek', symbols: [{ label: 'α', code: '\\alpha' }, { label: 'β', code: '\\beta' }, { label: 'θ', code: '\\theta' }, { label: 'π', code: '\\pi' }, { label: 'Σ', code: '\\Sigma' }, { label: 'Ω', code: '\\Omega' }] },
    { name: 'Calculus', symbols: [{ label: '∫', code: '\\int_0^\\infty' }, { label: '∑', code: '\\sum_{i=1}^n' }, { label: 'lim', code: '\\lim_{x \\to \\infty}' }, { label: '∂', code: '\\partial' }, { label: '∇', code: '\\nabla' }] },
    { name: 'Operators', symbols: [{ label: '√', code: '\\sqrt{x}' }, { label: '÷', code: '\\div' }, { label: '±', code: '\\pm' }, { label: '∞', code: '\\infty' }, { label: 'frac', code: '\\frac{a}{b}' }] },
    { name: 'Matrices', symbols: [{ label: '[Matrix]', code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' }] },
  ];

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Sigma className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">LaTeX Studio & Live Math Preview</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Offline KaTeX equation rendering, LaTeX math editor & instant symbol palette.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleExportHtml}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export HTML</span>
            </button>
          </div>
        </div>

        {/* Symbol Palette Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Symbol Palette</span>
          <div className="flex flex-wrap items-center gap-4">
            {symbolGroups.map((group) => (
              <div key={group.name} className="flex items-center gap-1.5 border-r border-slate-200 pr-4 last:border-0 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">{group.name}:</span>
                {group.symbols.map((sym) => (
                  <button
                    key={sym.label}
                    onClick={() => insertSymbol(sym.code)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-colors dark:border-slate-700 dark:bg-slate-800"
                  >
                    {sym.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-side Code Editor vs Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Code className="h-4 w-4 text-emerald-600" />
                <span>LaTeX Code</span>
              </div>
            </div>
            <textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="flex-1 min-h-[300px] font-mono text-xs leading-relaxed bg-slate-50/50 rounded-xl border border-slate-200 p-4 focus:outline-none focus:border-emerald-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Live Rendered Canvas */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span>Live Rendered Preview</span>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] flex items-center justify-center p-6 bg-slate-50/30 rounded-xl border border-slate-100 overflow-x-auto dark:bg-slate-950 dark:border-slate-800">
              <div
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
                className="text-lg leading-loose"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
