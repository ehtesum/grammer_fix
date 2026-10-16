# ANTIGRAVITY MASTER BUILD PROMPT — OMNIWRITE PRO

Build a polished, professional **desktop application prototype** called **OmniWrite Pro**.

OmniWrite Pro is a **100% offline, privacy-first AI writing and productivity suite** combining:

1. ✍️ WriteWise — Grammar & Writing Assistant
2. 🔄 Paraphrase — Local AI Paraphrasing
3. 🔍 Text Inspector — AI-Likelihood & Writing Analysis
4. ∑ LaTeX Studio — Offline LaTeX & Math Workspace
5. 📊 Resume Analyzer — ATS-Style Resume Optimization
6. 📁 Document Hub — Local Document Management

The application should feel like **one coherent professional product**, not six unrelated mini-apps.

The design should be inspired by modern productivity suites such as Canva, Adobe Creative Cloud, Notion, and professional writing applications, while using **OmniWrite's own branding and visual identity**.

---

# 1. NON-NEGOTIABLE REQUIREMENT — 100% OFFLINE

OmniWrite Pro must work without an internet connection.

No user text or document may be sent to a cloud service.

DO NOT use:

* OpenAI API
* Claude API
* Gemini API
* Grammarly API
* QuillBot API
* Any cloud LLM
* Remote NLP services
* Cloud databases
* Remote analytics
* Telemetry services

All core processing must happen locally.

The application should be usable even when:

* Wi-Fi is disabled
* Ethernet is disconnected
* The computer has no internet connection

---

# 2. LOCAL AI — ONE GLOBAL OLLAMA BUTTON

The application uses **Ollama** for optional local AI.

Default endpoint:

```text id="e6qz4k"
http://127.0.0.1:11434
```

There must be **ONE global Ollama control in the top-right corner**.

Do not create separate Ollama controls inside every tool.

Global header:

```text id="jv5y1e"
┌──────────────────────────────────────────────────────────────┐
│ OmniWrite Pro                    🤖 Activate Ollama     ⚙    │
└──────────────────────────────────────────────────────────────┘
```

When connected:

```text id="m5qqy4"
┌──────────────────────────────────────────────────────────────┐
│ OmniWrite Pro                    🟢 Ollama Active        ⚙   │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. OLLAMA ACTIVATION FLOW

Clicking **Activate Ollama** opens a compact popover.

Initial state:

```text id="7by2kd"
┌─────────────────────────────────────┐
│ 🤖 Local AI                         │
│                                     │
│ ● Ollama not connected              │
│                                     │
│ Local AI enables:                   │
│                                     │
│ • Advanced paraphrasing             │
│ • Rewriting                         │
│ • Natural style rewriting           │
│ • Advanced text analysis            │
│                                     │
│        [ Activate Ollama ]           │
└─────────────────────────────────────┘
```

When clicked:

1. Connect to `127.0.0.1:11434`.
2. Verify Ollama is responding.
3. Retrieve installed local models.
4. Display available models.
5. Allow the user to select one.
6. Store the selected model locally.
7. Change global status to **Ollama Active**.

Never download a model automatically.

---

# 4. OLLAMA CONNECTED STATE

Show:

```text id="u4x9np"
┌─────────────────────────────────────┐
│ 🤖 Local AI                         │
│                                     │
│ 🟢 Connected                       │
│                                     │
│ Model                               │
│ ┌─────────────────────────────────┐ │
│ │ llama3.2                    ▼   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Runtime: Ollama                     │
│ Inference: Local                    │
│                                     │
│ ✓ No cloud API                      │
│ ✓ Local inference                   │
│ ✓ Text stays on device              │
│                                     │
│        [ Deactivate Ollama ]        │
└─────────────────────────────────────┘
```

The model list must be obtained dynamically from Ollama.

Do not hardcode a model as the only option.

---

# 5. OLLAMA UNAVAILABLE STATE

If Ollama is not installed or not running:

```text id="1s2x0g"
Ollama not detected

OmniWrite Pro could not connect to
the local Ollama service.

AI-powered features are unavailable.

Grammar, spelling, readability,
LaTeX and resume analysis continue
to work offline.

[ Retry Connection ]
```

Do not fake AI responses.

Do not show a fake "connected" status.

---

# 6. GLOBAL AI STATE

Create a central state:

```typescript id="n2o5vu"
interface OllamaState {
  connected: boolean;
  activeModel: string | null;
  availableModels: string[];
}
```

All modules access the same global state.

Behavior:

```text id="l0k3rf"
Ollama OFF
     │
     ├── Grammar works
     ├── Spelling works
     ├── Readability works
     ├── Resume analysis works
     ├── LaTeX works
     └── Basic paraphrasing/fallback works

Ollama ON
     │
     ├── Advanced paraphrasing
     ├── AI rewriting
     ├── Advanced style analysis
     └── Local LLM features
```

---

# 7. TECHNOLOGY STACK

Use:

* Electron
* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* TipTap / ProseMirror
* KaTeX
* IndexedDB or SQLite
* Ollama

Use a clean modular architecture.

---

# 8. APPLICATION NAVIGATION

The application has these main routes:

```text id="x4b6jp"
Dashboard
WriteWise
Paraphrase
Text Inspector
LaTeX Studio
Resume Analyzer
Document Hub
Settings
```

Every workspace must have a consistent global header:

```text id="9qf7xz"
← Dashboard

OmniWrite Pro

                    🤖 Ollama Active
                    ⚙ Settings
```

The user can always return to the dashboard.

---

# 9. DASHBOARD

The application launches into a modern **Tile-Based Dashboard Hub**.

Use a spacious, professional layout.

```text id="j6p4v8"
┌────────────────────────────────────────────────────────────────────┐
│ OmniWrite Pro                         🤖 Ollama: OFF          ⚙    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Welcome back                                                       │
│ Create, analyze and improve your documents — privately.            │
│                                                                    │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐ │
│ │ ✍ WriteWise      │ │ 🔄 Paraphrase    │ │ 🔍 Text Inspector  │ │
│ │                  │ │                  │ │                    │ │
│ │ Grammar, spelling │ │ Rewrite text     │ │ Analyze writing    │ │
│ │ and clarity       │ │ using local AI   │ │ characteristics    │ │
│ │                  │ │                  │ │                    │ │
│ │ [ Open ]         │ │ [ Open ]         │ │ [ Open ]           │ │
│ └──────────────────┘ └──────────────────┘ └────────────────────┘ │
│                                                                    │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐ │
│ │ ∑ LaTeX Studio   │ │ 📊 Resume        │ │ 📁 Document Hub    │ │
│ │                  │ │    Analyzer      │ │                    │ │
│ │ Write equations  │ │ Resume scoring   │ │ Local documents    │ │
│ │ and preview      │ │ and optimization │ │ and autosave       │ │
│ │                  │ │                  │ │                    │ │
│ │ [ Open ]         │ │ [ Open ]         │ │ [ Open ]           │ │
│ └──────────────────┘ └──────────────────┘ └────────────────────┘ │
│                                                                    │
│ Recent Documents                                                   │
│                                                                    │
│ Research Proposal                                    Today         │
│ Software Engineer CV                                 Yesterday     │
│ Mathematics Notes                                    Aug 27        │
└────────────────────────────────────────────────────────────────────┘
```

Tiles should include:

* Icon
* Title
* Description
* Open button
* Hover animation
* Subtle elevation
* Clear visual hierarchy

Do not make this look like an admin dashboard.

---

# 10. DESIGN LANGUAGE

Create a polished commercial-quality UI.

Use:

* Clean typography
* Generous spacing
* Rounded cards
* Subtle borders
* Soft shadows
* Minimal clutter
* Professional icons
* Smooth transitions
* Clear hierarchy

Support:

* Light mode
* Dark mode
* System theme

Avoid:

* Excessive gradients
* Giant buttons
* Neon colors
* Generic Bootstrap styling
* Fake dashboard widgets
* Excessive animations

The writing itself should remain the visual focus.

---

# 11. MODULE A — WRITEWISE

Build a Grammarly-style local writing assistant under the OmniWrite brand.

Call it:

**WriteWise**

Do not use Grammarly branding in the application.

---

## 11.1 Rich Text Editor

Use TipTap / ProseMirror.

Support:

* Typing
* Paste
* Bold
* Italic
* Underline
* Headings
* Bullet lists
* Numbered lists
* Undo
* Redo
* Find
* Replace
* Selection

---

## 11.2 Real-Time Analysis

Analyze text locally after a debounce of approximately:

```text id="h7ks0m"
300–800 ms
```

Do not analyze on every keystroke.

Detect:

* Grammar
* Spelling
* Punctuation
* Common word misuse
* Clarity
* Conciseness
* Vocabulary issues

---

# 12. GRAMMAR ENGINE

Implement a modular local grammar engine.

Examples:

```text id="kj6b3z"
She go to school.
→ She goes to school.
```

```text id="xj9r6v"
This is a example.
→ This is an example.
```

```text id="g1n8qn"
Yesterday I go there.
→ Yesterday I went there.
```

```text id="w9j3qy"
two book
→ two books
```

---

# 13. SPELLING ENGINE

Support a local dictionary / spell checker.

Example:

```text id="j8h4ad"
recieve
→ receive
```

Support:

* Local dictionary
* Personal dictionary
* Ignore word
* Add word

---

# 14. PUNCTUATION

Detect common punctuation problems.

Example:

```text id="m1n0ez"
Hello how are you
→ Hello, how are you?
```

---

# 15. INLINE ISSUE HIGHLIGHTING

Highlight issues directly inside the editor.

Categories:

```text id="gqj8n3"
Grammar
Spelling
Punctuation
Clarity
Conciseness
Vocabulary
```

Clicking an issue opens a suggestion popup.

Example:

```text id="k3h9y4"
┌───────────────────────────────────┐
│ Grammar                            │
│                                   │
│ She go to university every day.  │
│                                   │
│ Suggested correction              │
│                                   │
│ She goes to university every day │
│                                   │
│ [ Accept ]           [ Ignore ]   │
└───────────────────────────────────┘
```

Accept must actually modify the editor.

Ignore must remove the current suggestion.

---

# 16. WRITING SCORE

Create a local Writing Score.

Example:

```text id="7v4r0z"
Writing Score

87 / 100

Correctness       92
Clarity           84
Readability       79
Vocabulary        88
Conciseness       91
```

Score must be calculated from actual document characteristics.

Use:

* Grammar errors
* Spelling errors
* Punctuation errors
* Sentence complexity
* Readability
* Repetition
* Vocabulary diversity
* Sentence length
* Error density

Never generate a random score.

---

# 17. READABILITY

Calculate locally:

* Flesch Reading Ease
* Average sentence length
* Average word length
* Word count
* Sentence count
* Paragraph count
* Reading time

Example:

```text id="q6v2xb"
Readability

68

Good

17 words / sentence

Reading time
2 min
```

---

# 18. TONE ANALYSIS

Create local heuristic-based tone estimation.

Categories:

* Professional
* Formal
* Friendly
* Casual
* Confident
* Neutral

Example:

```text id="b2k6u8"
Tone

Professional      86%
Formal            81%
Confident         77%
Friendly          64%
```

Label results as estimates.

---

# 19. MODULE B — PARAPHRASE

Create a dedicated paraphrasing workspace.

Layout:

```text id="6h4s0x"
┌───────────────────────────────────────────────────────────────┐
│ Paraphrase                                                   │
├─────────────────────────────┬─────────────────────────────────┤
│ Original                    │ Result                          │
│                             │                                 │
│ Paste your text here...     │ Rewritten text appears here...  │
│                             │                                 │
├─────────────────────────────┴─────────────────────────────────┤
│                                                               │
│ Mode: [ Standard ▼ ]                                          │
│                                                               │
│ Synonym Density                                               │
│ Low ───────────●────────── High                              │
│                                                               │
│ Frozen Words                                                   │
│ [ machine learning ] [ LSTM ] [+]                            │
│                                                               │
│                    [ Paraphrase ]                            │
└───────────────────────────────────────────────────────────────┘
```

---

# 20. PARAPHRASING MODES

Implement:

### Standard

Balanced rephrasing.

### Fluency

Improve flow and grammar.

### Formal

Professional language.

### Academic

Scholarly phrasing.

### Creative

More expressive vocabulary and structure.

### Expand

Add explanatory detail without changing the core meaning.

### Shorten

Make the text more concise.

If Ollama is active, use the selected local model.

If Ollama is inactive, use a deterministic rule-based fallback for supported transformations.

---

# 21. SYNONYM DENSITY

Provide:

```text id="6t0r2a"
Low
Medium
High
```

The setting must actually affect output.

Do not merely change the label.

---

# 22. FREEZE WORDS

Allow users to protect terms:

```text id="e5m8u3"
machine learning
LSTM
TensorFlow
OmniWrite
```

Frozen terms must remain unchanged.

---

# 23. PARAPHRASE VARIANTS

After generation, allow:

**Generate alternatives**

Example:

```text id="b8x5q7"
1. The system processes sensor data in real time.

2. Sensor information is processed by the system
   in real time.

3. The system performs real-time sensor processing.
```

Allow the user to select a variant.

---

# 24. MODULE C — TEXT INSPECTOR

Create:

**AI-Likelihood & Writing Analysis**

Do not present this as a definitive AI detector.

Display:

```text id="p5f8j0"
AI-Likelihood Estimate

62%

Moderate signal
```

Clearly explain:

```text id="1n6b4c"
This score estimates stylistic characteristics sometimes
associated with machine-generated text. It is not proof
of AI authorship.
```

---

# 25. TEXT ANALYSIS METRICS

Calculate locally:

* Perplexity when a suitable local model is available
* Sentence length variance
* Burstiness
* Vocabulary diversity
* Type-token ratio
* Repetition
* Repeated phrases
* Sentence structure variation
* Paragraph uniformity
* Transition frequency

Display:

```text id="s8y1df"
Perplexity             41
Sentence variation     73
Vocabulary diversity   68
Repetition             21
Structural uniformity  79
```

If a local model is unavailable, explain which metrics cannot be calculated.

Do not invent values.

---

# 26. SENTENCE-LEVEL INSPECTION

Allow users to click individual sentences.

Show:

```text id="6v7x3s"
Sentence Analysis

Length
24 words

Vocabulary diversity
Low

Structural variation
Low

Repetition
Medium
```

Highlight sentences with unusual characteristics.

---

# 27. NATURAL STYLE REWRITE

Do not promise to bypass external AI detectors.

Call this feature:

**Natural Style Rewrite**

Options:

* More natural
* More conversational
* More varied
* Less repetitive
* More concise
* More personal

The local model can modify:

* Sentence length
* Sentence structure
* Repetition
* Transitions
* Vocabulary
* Paragraph rhythm

Show a before/after comparison.

---

# 28. MODULE D — LATEX STUDIO

Create a professional LaTeX workspace.

Layout:

```text id="6d0k3p"
┌──────────────────────────────┬─────────────────────────────┐
│ LaTeX Source                 │ Live Preview                │
│                              │                             │
│ \[                           │                             │
│ E = mc^2                     │          E = mc²             │
│ \]                           │                             │
│                              │                             │
│ \int_0^\infty e^{-x} dx      │                             │
└──────────────────────────────┴─────────────────────────────┘
```

Use KaTeX for local rendering.

---

# 29. LATEX SYMBOL PALETTE

Create categories:

* Greek
* Operators
* Relations
* Calculus
* Matrices
* Fractions
* Arrows
* Sets
* Logic

Examples:

```text id="t4a7v9"
α   \alpha
β   \beta
∞   \infty
∑   \sum
∫   \int
√   \sqrt{}
```

Clicking a symbol inserts the LaTeX code.

---

# 30. LATEX EXPORT

Support:

* HTML
* SVG
* PNG

For PDF:

Use a locally installed LaTeX compiler if available.

If unavailable:

```text id="9w0f4a"
PDF compiler unavailable.

HTML, SVG and PNG export remain available.

Install a local LaTeX distribution to enable
full PDF compilation.
```

Never fake PDF compilation.

---

# 31. MODULE E — RESUME ANALYZER

Create an offline resume analysis tool.

Call it:

**Resume Analyzer**

Do not claim to reproduce any specific ATS vendor's proprietary algorithm.

Use:

**OmniWrite Resume Compatibility Score**

Allow:

* Paste resume
* Import local resume text
* Paste job description
* Analyze

---

# 32. RESUME SCORE

Example:

```text id="p3k7m2"
Resume Compatibility

82 / 100

Keyword Match       78
Action Verbs        91
Quantification      74
Structure           88
Clarity             85
```

Score based on measurable local heuristics.

---

# 33. RESUME SECTIONS

Detect:

* Summary
* Experience
* Education
* Skills
* Projects
* Certifications
* Publications

Identify missing or poorly structured sections.

---

# 34. ACTION VERBS

Identify weak verbs:

```text id="s7c2e1"
worked
helped
did
made
used
```

Suggest stronger alternatives where appropriate:

```text id="x8f5n2"
implemented
developed
designed
optimized
engineered
automated
deployed
```

Do not blindly replace verbs.

---

# 35. QUANTIFICATION

Detect achievements lacking measurable evidence.

Example:

```text id="j5r1p0"
Developed a document search system.
```

Suggestion:

```text id="v8m2q6"
Consider adding truthful measurable impact.

Example:
Developed a document search system indexing
10,000+ documents.
```

Never invent numbers.

Clearly tell the user to replace example numbers with real values.

---

# 36. JOB DESCRIPTION MATCHING

Compare resume and job description.

Analyze:

* Keyword overlap
* Missing skills
* Technologies
* Experience requirements
* Important phrases
* Seniority signals

Example:

```text id="u4k7w9"
Missing keywords

Kubernetes
CI/CD
Docker
AWS
```

---

# 37. MODULE F — DOCUMENT HUB

Create a local document manager.

Users can:

* Create
* Open
* Rename
* Duplicate
* Delete
* Search
* Sort
* Autosave

Example:

```text id="r7n2h4"
Documents

Research Proposal
Modified 2 minutes ago

Software Engineer CV
Modified yesterday

Mathematics Notes
Modified Aug 27
```

Use IndexedDB or SQLite.

No cloud sync.

---

# 38. GLOBAL SEARCH

Create a local global search.

Search:

* Document titles
* Document content
* Recent documents

Everything is processed locally.

---

# 39. SETTINGS

Create:

## General

* Theme
* Language
* Autosave
* Check while typing

## Writing

* Grammar
* Spelling
* Punctuation
* Clarity
* Conciseness
* Vocabulary

## Dictionary

* Personal words
* Ignored words

## AI

Show Ollama status only as an informational section.

The primary Ollama control remains the global top-right button.

---

# 40. PRIVACY CENTER

Create a dedicated privacy page.

Display:

```text id="d4n7q8"
Privacy Center

🟢 Offline-first

Your documents stay on this device.

✓ No cloud AI
✓ No document uploads
✓ No remote analytics
✓ Local storage
✓ Local grammar analysis
✓ Local AI inference
```

Clearly explain that Ollama runs locally.

---

# 41. DATA STORAGE

Store locally:

* Documents
* Settings
* Personal dictionary
* Ignored suggestions
* Selected Ollama model
* Recent documents
* Theme preference

Use IndexedDB or SQLite.

---

# 42. APPLICATION ARCHITECTURE

Use:

```text id="q8s4z1"
src/

├── components/
│
├── pages/
│   ├── Dashboard/
│   ├── WriteWise/
│   ├── Paraphrase/
│   ├── Inspector/
│   ├── LatexStudio/
│   ├── ResumeAnalyzer/
│   ├── Documents/
│   └── Settings/
│
├── engines/
│   ├── grammar/
│   ├── spelling/
│   ├── readability/
│   ├── tone/
│   ├── paraphrase/
│   ├── textAnalysis/
│   └── resume/
│
├── ai/
│   ├── LocalAIProvider.ts
│   ├── OllamaProvider.ts
│   ├── FallbackProvider.ts
│   └── PromptManager.ts
│
├── storage/
│
├── state/
│
├── types/
│
└── utils/
```

---

# 43. LOCAL AI INTERFACE

Create:

```typescript id="4b8n2k"
interface LocalAIProvider {
  isAvailable(): Promise<boolean>;

  listModels(): Promise<string[]>;

  generate(
    prompt: string,
    options?: GenerationOptions
  ): Promise<string>;
}
```

Implement:

```text id="8h4x0p"
OllamaProvider
FallbackProvider
```

The UI must never directly communicate with Ollama.

---

# 44. WRITING ISSUE MODEL

Create:

```typescript id="2p7c6a"
interface WritingIssue {
  id: string;

  type:
    | "grammar"
    | "spelling"
    | "punctuation"
    | "clarity"
    | "conciseness"
    | "vocabulary";

  start: number;
  end: number;

  original: string;
  replacement?: string;

  explanation: string;

  severity:
    | "info"
    | "warning"
    | "error";
}
```

Make the architecture extensible.

---

# 45. FALLBACK BEHAVIOR

Without Ollama:

### Fully functional

* Grammar
* Spelling
* Punctuation
* Readability
* Writing score
* Tone heuristics
* Resume analysis
* Keyword matching
* LaTeX rendering
* Document management
* Basic paraphrasing

### Requires local AI for advanced behavior

* Advanced paraphrasing
* Advanced rewriting
* Natural Style Rewrite
* Advanced semantic analysis

The UI must clearly communicate this.

---

# 46. SAMPLE DOCUMENTS

Include realistic demo data.

## Grammar Demo

```text id="k7r2q9"
This is a example document. The system analyze
the text and give useful suggestions.

Yesterday I go to the university and meet my professor.
We discussed about the project and he give me useful advice.
```

## Resume Demo

Include a deliberately imperfect software engineering resume.

## LaTeX Demo

```latex id="e3w8n2"
\[
E = mc^2
\]

\[
\int_0^\infty e^{-x} dx = 1
\]

\[
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\]
```

## Paraphrase Demo

Include a paragraph that produces visibly different Standard, Formal, Academic, and Shorten results.

---

# 47. UX POLISH

Implement:

* Smooth transitions
* Hover states
* Focus states
* Toast notifications
* Loading indicators
* Empty states
* Error states
* Autosave indicator
* Unsaved changes indicator
* Tooltips

Keyboard shortcuts:

```text id="p0x8v2"
Ctrl/Cmd + S
Ctrl/Cmd + Z
Ctrl/Cmd + Shift + Z
Ctrl/Cmd + F
```

---

# 48. ACCESSIBILITY

Support:

* Keyboard navigation
* Visible focus states
* Proper semantic buttons
* ARIA labels
* Tooltips
* Good contrast

---

# 49. PERFORMANCE

The editor must remain responsive for:

* 500 words
* 2,000 words
* 5,000 words
* 10,000 words

Use:

* Debouncing
* Async processing
* Background workers where useful
* Caching
* Incremental analysis

Do not block the Electron renderer.

---

# 50. OFFLINE TESTING

Test the application with internet disconnected.

Verify that:

* Application launches
* Dashboard works
* Documents open
* Documents save
* Grammar works
* Spelling works
* Readability works
* LaTeX rendering works
* Resume analysis works
* Navigation works
* Ollama works when locally available

No cloud dependency should be required.

---

# 51. COMPLETE DEMONSTRATION FLOW

The final application must support this complete demonstration.

### Step 1

Launch OmniWrite Pro.

Dashboard appears.

### Step 2

Top-right shows:

```text
🤖 Activate Ollama
```

### Step 3

Click Activate Ollama.

Detect local Ollama.

Select installed model.

Status changes to:

```text
🟢 Ollama Active
```

### Step 4

Open WriteWise.

Demo document contains grammar errors.

Click an error.

Suggestion appears.

Click Accept.

Text changes.

Score updates.

### Step 5

Open Paraphrase.

Paste a paragraph.

Select:

```text
Academic
```

Generate locally through Ollama.

Show result.

Change synonym density.

Generate another result.

### Step 6

Open Text Inspector.

Analyze text.

Show:

* AI-likelihood estimate
* Perplexity if available
* Burstiness
* Vocabulary diversity
* Sentence variation
* Repetition

### Step 7

Open LaTeX Studio.

Type:

```latex
E = mc^2
```

Preview updates immediately.

Use symbol palette.

Export SVG/PNG.

### Step 8

Open Resume Analyzer.

Load demo resume.

Paste job description.

Generate:

```text
OmniWrite Resume Compatibility Score
```

Show:

* Missing keywords
* Weak action verbs
* Quantification opportunities
* Section problems

### Step 9

Open Document Hub.

Create a document.

Type text.

Close application.

Reopen.

Document remains available.

---

# 52. NO FAKE FUNCTIONALITY

Do NOT create:

* Fake AI responses
* Random scores
* Fake progress bars
* Fake offline status
* Fake PDF export
* Fake model connection
* Fake grammar corrections

If something cannot be implemented reliably, display a truthful limitation.

Core features must actually work.

---

# 53. DEVELOPMENT STRATEGY

Build incrementally.

## Phase 1

Application shell:

* Electron
* React
* Navigation
* Dashboard
* Theme
* Global Ollama button

## Phase 2

WriteWise:

* Editor
* Grammar
* Spelling
* Suggestions
* Readability
* Score

## Phase 3

Document Hub:

* Local storage
* Autosave
* Search

## Phase 4

Paraphrase:

* Modes
* Frozen words
* Synonym density
* Ollama integration
* Fallback

## Phase 5

Text Inspector:

* Statistical metrics
* Local model integration
* Sentence analysis

## Phase 6

LaTeX Studio:

* Editor
* KaTeX
* Symbol palette
* Export

## Phase 7

Resume Analyzer:

* Resume parsing
* Job description comparison
* Compatibility score

## Phase 8

Final polish:

* Performance
* Accessibility
* Dark mode
* Error handling
* Testing
* Packaging

Keep the application runnable after every phase.

---

# 54. FINAL QUALITY STANDARD

The finished application should look and behave like a serious portfolio project.

It should demonstrate:

* Desktop application engineering
* React architecture
* TypeScript
* Electron
* NLP
* Local AI inference
* Ollama integration
* Rule-based NLP
* Document processing
* Mathematical rendering
* Resume analysis
* Local persistence
* Privacy-first architecture
* Professional UI/UX

The product's central message should be:

> **Your writing. Your documents. Your AI. Your device.**

Build the application now.

Prioritize **working functionality and polished UX** over implementing a huge number of shallow features.
