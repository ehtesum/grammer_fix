import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { IssueExtension, updateIssueDecorations } from './IssueExtension';
import { EditorToolbar } from './EditorToolbar';
import { AIToolbar } from './AIToolbar';
import { InlineSuggestionPopup } from './InlineSuggestionPopup';
import { Issue, ReadabilityMetrics, ToneMetrics, WritingScore } from '../../engine/types';
import { analyzeGrammar } from '../../engine/GrammarEngine';
import { analyzeSpelling } from '../../engine/SpellChecker';
import { analyzeConciseness } from '../../engine/ConcisenessEngine';
import { analyzeVocabulary } from '../../engine/VocabularyEngine';
import { analyzeReadability } from '../../engine/ReadabilityEngine';
import { analyzeTone } from '../../engine/ToneEngine';
import { calculateWritingScore } from '../../engine/ScoreEngine';

interface WriteWiseEditorProps {
  initialContent: string;
  customDictionary: string[];
  enabledRules: Record<string, boolean>;
  onAnalysisUpdate: (data: {
    issues: Issue[];
    readability: ReadabilityMetrics;
    tone: ToneMetrics;
    score: WritingScore;
  }) => void;
  onContentChange: (newContent: string) => void;
  onSelectIssueId: (id: string | null) => void;
  activeIssueId: string | null;
  onAcceptIssue: (issue: Issue) => void;
  onIgnoreIssue: (issue: Issue) => void;
  onAddToDictionary: (word: string) => void;
}

export const WriteWiseEditor: React.FC<WriteWiseEditorProps> = ({
  initialContent,
  customDictionary,
  enabledRules,
  onAnalysisUpdate,
  onContentChange,
  onSelectIssueId,
  activeIssueId,
  onAcceptIssue,
  onIgnoreIssue,
  onAddToDictionary,
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [currentIssues, setCurrentIssues] = useState<Issue[]>([]);
  const [popupData, setPopupData] = useState<{ issue: Issue; position: { top: number; left: number } } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core Document Analysis Function
  const runAnalysis = useCallback(
    (text: string, currentEditor: any) => {
      let issues: Issue[] = [];

      if (enabledRules.grammar) {
        issues = issues.concat(analyzeGrammar(text));
      }
      if (enabledRules.spelling) {
        issues = issues.concat(analyzeSpelling(text, customDictionary));
      }
      if (enabledRules.conciseness) {
        issues = issues.concat(analyzeConciseness(text));
      }
      if (enabledRules.vocabulary) {
        issues = issues.concat(analyzeVocabulary(text));
      }

      // Deduplicate issues by position
      const uniqueIssues: Issue[] = [];
      const seen = new Set<string>();
      for (const iss of issues) {
        const key = `${iss.from}-${iss.to}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueIssues.push(iss);
        }
      }

      setCurrentIssues(uniqueIssues);

      const readability = analyzeReadability(text);
      const tone = analyzeTone(text);
      const score = calculateWritingScore(uniqueIssues, readability);

      onAnalysisUpdate({
        issues: uniqueIssues,
        readability,
        tone,
        score,
      });

      if (currentEditor) {
        updateIssueDecorations(currentEditor, uniqueIssues);
      }
    },
    [customDictionary, enabledRules, onAnalysisUpdate]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      IssueExtension.configure({
        issues: [],
        onSelectIssue: (id, rect) => {
          onSelectIssueId(id);
          const found = currentIssues.find((i) => i.id === id);
          if (found && rect) {
            setPopupData({
              issue: found,
              position: { top: rect.top, left: rect.left },
            });
          }
        },
      }),
    ],
    content: initialContent ? `<p>${initialContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` : '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] text-base leading-relaxed p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onContentChange(text);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        runAnalysis(text, editor);
      }, 350);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text.trim().length > 3) {
        setSelectedText(text.trim());
      } else {
        setSelectedText('');
        setShowAiToolbar(false);
      }
    },
  });

  const handleApplyIssueDirectly = useCallback(
    (issue: Issue) => {
      if (editor) {
        const fromPos = issue.from + 1;
        const toPos = issue.to + 1;
        // Verify ProseMirror position and replace using active TipTap transaction
        if (fromPos >= 1 && toPos <= editor.state.doc.content.size) {
          editor.chain().focus().setTextSelection({ from: fromPos, to: toPos }).insertContent(issue.replacement).run();
        }
      }
      onAcceptIssue(issue);
    },
    [editor, onAcceptIssue]
  );

  // Keep popup updated if active issue changes from sidebar
  useEffect(() => {
    if (!activeIssueId) {
      setPopupData(null);
    }
  }, [activeIssueId]);

  // Re-run analysis if rules or dictionary change
  useEffect(() => {
    if (editor) {
      runAnalysis(editor.getText(), editor);
    }
  }, [editor, customDictionary, enabledRules, runAnalysis]);

  // Update content only when changing documents externally (different doc ID or empty text)
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getText() !== initialContent && initialContent.length === 0) {
      editor.commands.setContent(
        initialContent ? `<p>${initialContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` : ''
      );
      runAnalysis(initialContent, editor);
    }
  }, [initialContent, editor]);

  return (
    <div className="relative flex flex-1 flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <EditorToolbar editor={editor} onOpenAiTools={() => setShowAiToolbar(true)} />

      <div className="relative flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />

        {/* Floating Grammarly-style Suggestion Popup */}
        {popupData && (
          <InlineSuggestionPopup
            issue={popupData.issue}
            position={popupData.position}
            onAccept={(issue) => {
              handleApplyIssueDirectly(issue);
              setPopupData(null);
            }}
            onIgnore={(issue) => {
              onIgnoreIssue(issue);
              setPopupData(null);
            }}
            onAddToDictionary={(word) => {
              onAddToDictionary(word);
              setPopupData(null);
            }}
            onClose={() => setPopupData(null)}
          />
        )}

        {/* Floating AI Toolbar Trigger */}
        {selectedText && !showAiToolbar && (
          <div className="sticky bottom-4 left-1/2 -translate-x-1/2 flex justify-center z-20 pointer-events-auto">
            <button
              onClick={() => setShowAiToolbar(true)}
              className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            >
              <span>✨ Ask Local AI to Rewrite Selection</span>
            </button>
          </div>
        )}

        {/* Floating AI Toolbar Overlay */}
        {showAiToolbar && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <AIToolbar
              selectedText={selectedText || editor?.getText() || ''}
              onApplyRewrite={(newText) => {
                if (editor) {
                  if (selectedText) {
                    editor.commands.insertContent(newText);
                  } else {
                    editor.commands.setContent(`<p>${newText.replace(/\n\n/g, '</p><p>')}</p>`);
                  }
                }
              }}
              onClose={() => setShowAiToolbar(false)}
            />
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-500 font-medium select-none">
        <div className="flex items-center gap-4">
          <span>{editor?.getText().split(/\s+/).filter(Boolean).length || 0} words</span>
          <span>{editor?.getText().length || 0} characters</span>
          <span>{editor?.getText().split(/[.!?]+/).filter(Boolean).length || 0} sentences</span>
          <span className="hidden md:inline-block text-slate-300">|</span>
          <span className="hidden md:inline-block">⏱️ {Math.max(1, Math.ceil((editor?.getText().split(/\s+/).filter(Boolean).length || 0) / 200))} min read</span>
          <span className="hidden md:inline-block">🗣️ {Math.max(1, Math.ceil((editor?.getText().split(/\s+/).filter(Boolean).length || 0) / 130))} min speech</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Local NLP Active</span>
        </div>
      </div>
    </div>
  );
};
