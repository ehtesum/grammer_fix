# ✍️ OmniWrite Pro (grammer_fix) — All-in-One Writing & AI Detection Studio

## 💡 What is this in simple words?

Think of **OmniWrite Pro** as a super-powered combination of **Grammarly + Turnitin + Job Resume Scanner + LaTeX Editor**, running right on your desktop:

1. **AI Detector (Turnitin-style)**: Paste text or upload a PDF/Word document. It highlights sentences that look AI-generated in light blue (`#DBEAFE`) and gives you an AI likelihood percentage score.
2. **Grammar & Tone Checker**: Fixes spelling, punctuation, clunky sentences, and wordiness as you type.
3. **Resume / ATS Scanner**: Checks your resume against job descriptions to see if automated hiring filters (ATS) will pass or reject it.
4. **LaTeX Studio**: Built-in editor to write research papers and math equations.
5. **Paraphraser**: Rewrites sentences to sound more academic, casual, or concise.

You can use it completely free with local offline rules, local Ollama models, or cloud AI keys (Groq, Gemini, OpenRouter).

---

## 🧭 The Studio Sections & Tools

| Section / Tab | What it does in simple words |
| :--- | :--- |
| **🛡️ AI Checker** | Upload a PDF or paste text. Highlights AI-like sentences in light blue and recalculates scores in real-time as you edit. Can export official PDF reports. |
| **📝 WriteWise Editor** | Your everyday writing pad with live spell-check, readability metrics (Flesch-Kincaid score), and conciseness suggestions. |
| **📄 Document Hub** | Keeps track of your saved essays, drafts, and past analysis reports. |
| **🎯 Resume / ATS Scanner** | Compares your CV with a job listing and scores your keywords, format, and readability. |
| **🧮 LaTeX Studio** | Side-by-side LaTeX document editor with equation formatting and export. |
| **🔄 Paraphrase Hub** | Suggests alternative phrasing for tricky or repetitive sentences. |

---

## 📁 Source Code Tour (`src/`)

- `src/components/`: Reusable UI elements (editor toolbar, suggestion popups, modals, navigation).
- `src/engine/`: The core logic engines:
  - `AiCheckerEngine.ts`: Calculates AI probability across sentences.
  - `GrammarEngine.ts` & `SpellChecker.ts`: Finds typos and grammatical errors.
  - `AtsEngine.ts`: Analyzes resumes against applicant tracking systems.
  - `ScoreEngine.ts`: Generates readability, clarity, and tone ratings.
- `src/pages/`: The different screens you see in the app (AI Checker, Dashboard, Resume Analyzer, etc.).
- `electron/`: Allows running the application as a standalone desktop window on Windows.

---

## 🚀 How to Run It (Step-by-Step)

### Option 1: Run in Web Browser (Fastest)

1. Open PowerShell and navigate here:
   ```powershell
   cd c:\Users\user\Desktop\projects\grammer_fix
   ```
2. Install dependencies (first time only):
   ```powershell
   npm install
   ```
3. Start the dev server:
   ```powershell
   npm run dev
   ```
4. Open the link displayed in your terminal (usually **[http://localhost:5173](http://localhost:5173)**).

---

### Option 2: Run as a Desktop App (Electron)

If you want it to run in its own dedicated desktop window:
```powershell
npm run electron:dev
```
*(Or `npm run build` to package it into an installer).*

---

## Technical Limitations

- **Rule-Based Syntactic Depth**: Client-side offline spell and grammar checking uses lightweight regex and AST heuristics; complex cross-clause agreement errors require an active local Ollama or cloud LLM endpoint.
- **Large Document Re-parsing**: In-browser real-time score recalculation on documents exceeding 40,000 words can introduce typing latency if debounce intervals are set too aggressively.
- **KaTeX Macro Limitations**: The embedded lightweight LaTeX preview engine does not support advanced custom macro packages requiring full TeX Live compilation runs.

---

## Future Roadmap

- [ ] **Local LanguageTool Server Integration**: Add automatic discovery and lifecycle management for a background LanguageTool Java daemon.
- [ ] **Virtualized Editor Canvas**: Implement virtualized line DOM rendering to maintain smooth 60 FPS typing latency across book-length documents.
- [ ] **WebAssembly TeX Engine**: Embed a WebAssembly-compiled LaTeX compiler to compile arbitrary TeX macro packages purely in-browser.
- [ ] **Semantic Diff & Versioning**: Add side-by-side visual diffing across document revisions with sentence-level change attribution.

