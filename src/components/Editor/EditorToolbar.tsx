import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { extractHtmlFromFile } from '../../utils/DocumentExtractor';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Sparkles,
  Copy,
  Download,
  Check,
  Upload,
  Loader2,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenAiTools?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onOpenAiTools }) => {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const extractedHtml = await extractHtmlFromFile(file);
      if (extractedHtml.trim().length > 0) {
        editor.commands.setContent(extractedHtml);
      } else {
        alert('Could not extract document layout. Please ensure the file contains readable text.');
      }
    } catch (err: any) {
      alert(`Error reading file: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyText = () => {
    const text = editor.getText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = () => {
    const text = editor.getText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GramoFix_Document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200 bg-white px-4 py-2 text-slate-700 select-none">
      {/* Hidden File Input for GramoFix Document Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.tex,.latex,.txt,.md,.markdown,.json,.rtf"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* Document Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          title="Upload document file (.pdf, .doc, .docx, .tex, .txt, .md)"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 text-brand-600 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-brand-600" />
          )}
          <span>{uploading ? 'Extracting...' : '📁 Upload File'}</span>
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('bold') ? 'bg-slate-200 font-bold text-brand-600' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('italic') ? 'bg-slate-200 text-brand-600' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('underline') ? 'bg-slate-200 text-brand-600' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 font-bold text-brand-600' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 font-bold text-brand-600' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-slate-200 text-brand-600' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-1.5 hover:bg-slate-100 ${editor.isActive('orderedList') ? 'bg-slate-200 text-brand-600' : ''}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Copy Clean Text */}
        <button
          onClick={handleCopyText}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          title="Copy full text to clipboard"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Export Document */}
        <button
          onClick={handleExportText}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          title="Export document as Markdown file"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export .md</span>
        </button>

        {/* Local AI Assistant */}
        <button
          onClick={onOpenAiTools}
          className="flex items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Local AI</span>
        </button>
      </div>
    </div>
  );
};
