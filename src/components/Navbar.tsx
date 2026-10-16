import React, { useState } from 'react';
import { Feather, FileText, Settings, ShieldCheck, Plus, Check, FileSpreadsheet } from 'lucide-react';
import { DocumentData } from '../engine/types';

interface NavbarProps {
  currentDocument: DocumentData | null;
  activeView: 'editor' | 'documents' | 'settings';
  atsScoreOverall: number;
  onSelectView: (view: 'editor' | 'documents' | 'settings') => void;
  onRenameDocument: (newTitle: string) => void;
  onCreateNewDocument: () => void;
  onOpenPrivacyModal: () => void;
  onOpenAtsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDocument,
  activeView,
  atsScoreOverall,
  onSelectView,
  onRenameDocument,
  onCreateNewDocument,
  onOpenPrivacyModal,
  onOpenAtsModal,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentDocument?.title || 'Untitled Document');

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && currentDocument && titleInput !== currentDocument.title) {
      onRenameDocument(titleInput.trim());
    }
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-2xs select-none">
      {/* Brand & Document Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
            <Feather className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">WriteWise</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Inline Document Title */}
        {activeView === 'editor' && currentDocument && (
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  onBlur={handleTitleSubmit}
                  autoFocus
                  className="rounded border border-brand-500 px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none"
                />
                <button onClick={handleTitleSubmit} className="text-emerald-600 hover:text-emerald-700">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTitleInput(currentDocument.title);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>{currentDocument.title}</span>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Controls */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => onSelectView('editor')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
            activeView === 'editor' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Feather className="h-3.5 w-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => onSelectView('documents')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors ${
            activeView === 'documents' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Documents</span>
        </button>

        {/* ATS Score Checker Taskbar Button */}
        <button
          onClick={onOpenAtsModal}
          className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors border border-indigo-200 ml-1"
          title="Open ATS Resume Optimizer & Score Checker"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
          <span>ATS Score: {atsScoreOverall}</span>
        </button>

        <button
          onClick={onCreateNewDocument}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-brand-600 hover:bg-brand-50 font-bold transition-colors ml-1"
          title="New Document"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Top Right Controls & Privacy Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPrivacyModal}
          className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Offline</span>
        </button>

        <button
          onClick={() => onSelectView('settings')}
          className={`rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${
            activeView === 'settings' ? 'bg-slate-100 text-slate-900' : ''
          }`}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
