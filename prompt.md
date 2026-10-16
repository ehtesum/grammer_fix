# Build Prompt — Offline Grammarly-Style Writing Assistant

Build a polished desktop application prototype called **WriteWise** — an **100% offline Grammarly-style writing assistant**.

The application must look and feel like a modern professional writing assistant, inspired by the general UX patterns of Grammarly, but **do not copy Grammarly's logo, branding, proprietary assets, or exact visual design**.

The goal is to create a convincing portfolio-quality prototype demonstrating:

* NLP
* Grammar and spelling correction
* Real-time text analysis
* Local AI inference
* Sentence rewriting
* Readability analysis
* Modern desktop UI
* Offline-first architecture

## 1. CRITICAL REQUIREMENT — COMPLETELY OFFLINE

The application must work with **no internet connection**.

Do NOT send user text to any external API.

Do NOT depend on:

* OpenAI API
* Gemini API
* Claude API
* Grammarly API
* Any cloud NLP API
* Remote backend

All analysis must happen locally.

If an AI model is required, use a locally installed model through a local inference runtime such as:

* Ollama
* llama.cpp
* another appropriate local inference engine

Design the application so the grammar engine and AI engine are independent modules.

---

# 2. TECH STACK

Use a practical desktop stack.

Preferred:

* Electron
* React
* TypeScript
* Vite
* Tailwind CSS

Use a rich text editor such as:

* TipTap
* ProseMirror
* Lexical

For grammar/spelling:

* LanguageTool running locally if practical
* Hunspell/local dictionaries
* Custom rule engine

For AI rewriting:

* Local LLM through Ollama or another local runtime

For local storage:

* SQLite or IndexedDB

The application must still launch and demonstrate its UI even if no local LLM is installed.

Therefore, implement graceful fallback/demo behavior for AI features.

---

# 3. APPLICATION LAYOUT

Create a professional desktop writing environment.

Main layout:

```text
┌───────────────────────────────────────────────────────────────┐
│ WriteWise        Documents   AI Tools              ⚙ Settings │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────┐ ┌─────────────────┐ │
│  │                                      │ │ Writing Score   │ │
│  │                                      │ │                 │ │
│  │        DOCUMENT EDITOR               │ │      87         │ │
│  │                                      │ │                 │ │
│  │  This is a example sentence.         │ │ ✓ Correctness   │ │
│  │          ───────────                 │ │ ✓ Spelling      │ │
│  │                                      │ │ ⚠ Clarity       │ │
│  │  She go to university every day.    │ │ ⚠ Conciseness   │ │
│  │      ─────                           │ │                 │ │
│  │                                      │ │ Suggestions     │ │
│  │                                      │ │                 │ │
│  └──────────────────────────────────────┘ │ ┌─────────────┐ │
│                                           │ │ Grammar     │ │
│                                           │ │             │ │
│                                           │ │ She go      │ │
│                                           │ │ → She goes  │ │
│                                           │ │             │ │
│                                           │ │ [Accept]    │ │
│                                           │ │ [Ignore]    │ │
│                                           │ └─────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ 126 words     734 characters     8 sentences     English      │
└───────────────────────────────────────────────────────────────┘
```

Make the interface clean, spacious and professional.

Use:

* White/light neutral background
* Subtle borders
* Rounded cards
* Soft shadows
* Clear typography
* Good spacing
* Minimal visual clutter
* Smooth hover states
* Smooth transitions
* Professional icons

Do not make it look like a generic admin dashboard.

It should feel like a real writing application.

---

# 4. LEFT / MAIN EDITOR

The central area is the primary writing editor.

Support:

* Typing
* Pasting
* Selecting text
* Cursor movement
* Rich text formatting
* Undo/redo
* Bold
* Italic
* Underline
* Headings
* Bullet lists
* Numbered lists

Show grammar problems directly inside the text.

Example:

```text
This is a example of writing.
        ───────────
```

Clicking the highlighted text should open the relevant suggestion.

Different issue types should have visually distinct indicators.

Categories:

* Grammar
* Spelling
* Punctuation
* Clarity
* Conciseness
* Vocabulary

---

# 5. REAL-TIME GRAMMAR CHECKING

Analyze the document while the user types.

Do not analyze every keystroke.

Debounce analysis to approximately 300–800 ms.

Detect examples such as:

### Article errors

```text
a apple
→ an apple
```

### Subject-verb agreement

```text
She go to school.
→ She goes to school.
```

### Verb tense

```text
Yesterday I go to the store.
→ Yesterday I went to the store.
```

### Pluralization

```text
two book
→ two books
```

### Common spelling errors

```text
recieve
→ receive
```

### Punctuation

```text
Hello how are you
→ Hello, how are you?
```

The architecture must allow additional grammar rules to be added later.

---

# 6. SUGGESTION PANEL

When the user clicks an issue, show a suggestion card.

Example:

```text
Grammar

She go to university every day.

Suggested correction

She goes to university every day.

[Accept]   [Ignore]
```

Buttons:

* Accept
* Ignore
* Add to dictionary

When Accept is clicked:

1. Replace the incorrect text.
2. Update the editor.
3. Remove the issue.
4. Recalculate the writing score.

When Ignore is clicked:

1. Hide the suggestion.
2. Do not modify the text.

---

# 7. WRITING SCORE

Create a prominent writing score.

Example:

```text
87

Good writing
```

Break it down:

```text
Correctness     92
Clarity         84
Engagement      86
Delivery        89
```

The score should be calculated locally.

Do not simply display a random number.

Create a deterministic scoring algorithm based on:

* Number of grammar errors
* Number of spelling errors
* Sentence complexity
* Readability
* Repeated words
* Passive voice
* Sentence length
* Vocabulary diversity

---

# 8. READABILITY

Create a readability section.

Display:

```text
Readability

Flesch Reading Ease
68

Reading level
College

Average sentence
18 words

Average word
5.2 characters
```

Implement at least:

* Flesch Reading Ease
* Average sentence length
* Average word length
* Sentence count
* Word count

---

# 9. AI REWRITE

Add an AI toolbar.

When the user selects a sentence or paragraph, show:

```text
✨ Improve
✨ Rewrite
✨ Make concise
✨ Make formal
✨ Make friendly
✨ Simplify
```

Example:

Input:

```text
The system is very good and it works very fast.
```

Improve:

```text
The system performs efficiently and delivers fast results.
```

Make concise:

```text
The system performs efficiently.
```

Make formal:

```text
The system demonstrates strong performance and efficiency.
```

Make simple:

```text
The system works well and quickly.
```

Use a local LLM when available.

If no local LLM is available, display a clear message:

```text
Local AI model not detected.

Install a supported local model to enable AI rewriting.

Grammar checking and spelling correction still work offline.
```

Do NOT fake an AI API call.

---

# 10. TONE DETECTION

Add a tone panel.

Analyze the document locally.

Display approximate scores:

```text
Tone

Professional       █████████░  86%
Friendly           ███████░░░  72%
Confident          ████████░░  80%
Formal             █████████░  88%
```

Possible tones:

* Professional
* Friendly
* Formal
* Casual
* Confident
* Neutral

Clearly label this as an estimated analysis.

---

# 11. VOCABULARY

Detect repetitive or weak vocabulary.

Example:

```text
Vocabulary suggestion

"very good"

Consider:

excellent
effective
strong
high-quality
```

Allow the user to click a replacement.

Add synonym functionality.

---

# 12. CONCISENESS

Detect unnecessarily long phrases.

Examples:

```text
due to the fact that
→ because

at this point in time
→ now

a large number of
→ many
```

Show:

```text
Conciseness suggestion

You can make this sentence shorter.

[Apply]
[Ignore]
```

---

# 13. DOCUMENT MANAGEMENT

Create a Documents screen.

Users can:

* Create document
* Rename document
* Delete document
* Open document
* Search documents

Automatically save documents locally.

Example:

```text
My Documents

Research Proposal
Updated 2 minutes ago

Job Application
Updated yesterday

Project Report
Updated Aug 20
```

No cloud synchronization.

---

# 14. PERSONAL DICTIONARY

Create Settings → Personal Dictionary.

Allow:

```text
Add word

[ Ehtesum ]

[Add]
```

Words added here should no longer trigger spelling warnings.

Allow deleting custom words.

Store this locally.

---

# 15. OFFLINE STATUS

Make offline operation visible.

Top-right:

```text
● Offline
```

Clicking it opens:

```text
Privacy & Offline Mode

✓ No cloud connection
✓ Text processed locally
✓ Documents stored locally
✓ No text uploaded
✓ AI runs locally
```

This should be a major selling point of the application.

---

# 16. SETTINGS

Create a polished Settings screen.

Sections:

### General

* Language
* Auto-save
* Check while typing
* Suggestion sensitivity

### Writing

* Grammar
* Spelling
* Punctuation
* Clarity
* Conciseness
* Vocabulary

Each can be enabled/disabled.

### AI

Show:

```text
Local AI Engine

Status: Not detected

Runtime:
Ollama / llama.cpp

Model:
Not installed
```

Include a button:

```text
Check Local AI
```

Do not automatically download anything.

---

# 17. PERFORMANCE

The editor must remain responsive.

Use:

* Debounced analysis
* Incremental analysis where practical
* Background processing
* Async operations
* Cached results

Do not freeze the UI while analyzing a large document.

Test with at least a 2,000-word document.

---

# 18. PRIVACY

Create a Privacy page explaining:

```text
Your writing stays on your computer.

WriteWise does not upload:
- Documents
- Sentences
- Grammar data
- Personal dictionary
- AI prompts
```

Everything should remain local.

---

# 19. DEMO DOCUMENT

Include a sample document when the application is first opened.

Use deliberately incorrect text:

```text
This is a example document for demonstrating the WriteWise
writing assistant. The system analyze your writing in real time
and give you suggestions for improving grammar, spelling and
clarity.

Yesterday I go to the university and meet with my professor.
We discussed about the project and he give me some useful advices.
```

The application should immediately detect multiple issues.

This makes the prototype visually impressive when demonstrated.

---

# 20. ERROR CATEGORIES

Create a proper internal issue model.

For example:

```typescript
type IssueType =
  | "grammar"
  | "spelling"
  | "punctuation"
  | "clarity"
  | "conciseness"
  | "vocabulary";
```

Each issue should contain:

* ID
* Type
* Start position
* End position
* Original text
* Suggested replacement
* Explanation
* Severity

Example:

```text
{
  type: "grammar",
  original: "She go",
  replacement: "She goes",
  explanation: "The subject 'She' requires the singular verb 'goes'.",
  severity: "error"
}
```

This should make the system extensible.

---

# 21. ARCHITECTURE

Separate the application into clear modules:

```text
UI
│
├── Editor
├── SuggestionPanel
├── ScorePanel
├── ReadabilityPanel
├── TonePanel
└── Settings
        │
        ▼
Application Layer
        │
        ├── DocumentManager
        ├── AnalysisManager
        └── AIManager
                │
                ├── GrammarEngine
                ├── SpellChecker
                ├── ReadabilityEngine
                ├── ToneEngine
                └── LocalLLM
                        │
                        ▼
                 Local Storage
```

Keep the grammar engine independent from the UI.

---

# 22. IMPORTANT UX DETAILS

Add:

* Keyboard shortcuts
* Ctrl/Cmd + S
* Ctrl/Cmd + Z
* Ctrl/Cmd + Shift + Z
* Smooth suggestion animations
* Hover explanations
* Loading indicators
* Empty states
* Error states
* Tooltips
* Confirmation for destructive actions

When there are no issues:

```text
✓ Looks good

No writing issues detected.
```

When issues exist:

```text
3 suggestions

1 Grammar
1 Spelling
1 Clarity
```

---

# 23. RESPONSIVE DESKTOP DESIGN

The application should work well at:

* 1280×720
* 1440×900
* 1920×1080

The editor should remain the visual focus.

Do not overcrowd the screen.

---

# 24. VISUAL QUALITY

The prototype should look like something that could realistically become a commercial product.

Avoid:

* Generic Bootstrap appearance
* Excessive gradients
* Huge buttons
* Excessive colors
* Developer-looking UI
* Placeholder boxes
* Fake dashboards

Use subtle visual hierarchy.

The most important element should always be the writing.

---

# 25. IMPLEMENTATION ORDER

Build in this order:

### Phase 1

Create the Electron + React application.

### Phase 2

Build the complete UI and navigation.

### Phase 3

Implement the rich text editor.

### Phase 4

Implement local spelling and grammar analysis.

### Phase 5

Implement inline issue highlighting.

### Phase 6

Implement suggestion cards and Accept/Ignore.

### Phase 7

Implement writing score.

### Phase 8

Implement readability analysis.

### Phase 9

Implement local AI integration.

### Phase 10

Implement rewriting tools.

### Phase 11

Implement document storage.

### Phase 12

Implement settings and personal dictionary.

### Phase 13

Polish animations, accessibility and performance.

---

# 26. IMPORTANT — DO NOT STOP AT A MOCKUP

This must be a **functional prototype**, not just a visual mockup.

The following must actually work:

* Typing
* Editing
* Saving
* Loading documents
* Detecting spelling issues
* Detecting grammar issues
* Showing inline issues
* Clicking issues
* Accepting corrections
* Ignoring corrections
* Calculating statistics
* Calculating readability
* Calculating writing score
* Personal dictionary
* Local document storage

AI rewriting can gracefully degrade if a local LLM is unavailable.

---

# 27. FINAL DEMONSTRATION FLOW

Make sure this complete flow works:

1. Launch WriteWise.
2. Demo document opens.
3. Application shows "Offline".
4. Incorrect sentences contain highlighted issues.
5. User clicks an issue.
6. Suggestion card appears.
7. User clicks Accept.
8. Text is corrected.
9. Score updates.
10. User selects a paragraph.
11. AI toolbar appears.
12. User chooses "Make concise".
13. Local AI is called if available.
14. Result appears.
15. User accepts the rewrite.
16. Document is automatically saved.
17. Close and reopen the application.
18. Document remains available.

Build this end-to-end experience first, then polish the remaining features.

# 28. QUALITY CHECK

Before considering the project complete, verify:

* `npm install` works
* Development mode works
* Production build works
* Electron launches
* No external API is required
* Application works without internet
* No console errors
* No broken buttons
* No fake loading states
* No placeholder functionality for core grammar features
* Documents persist after restart
* Editor remains responsive with large text

At the end, provide:

1. Project structure
2. Technologies used
3. How to run it
4. How to enable optional local AI
5. How the grammar engine works
6. How offline privacy is guaranteed
7. Known limitations
8. Recommended next improvements

Start building the application now. Prioritize a **working end-to-end prototype** over adding a large number of unfinished features.
