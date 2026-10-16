import React, { useState } from 'react';
import { DocumentData } from '../../engine/types';
import { FileText, Plus, Search, Trash2, Clock, ArrowRight, FolderKanban } from 'lucide-react';

interface DocumentHubPageProps {
  documents: DocumentData[];
  onOpenDocument: (doc: DocumentData) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentHubPage: React.FC<DocumentHubPageProps> = ({
  documents,
  onOpenDocument,
  onCreateDocument,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50 p-6 overflow-y-auto select-none dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
                <FolderKanban className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Document Hub</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Local document manager with background autosave & IndexedDB persistence.
            </p>
          </div>

          <button
            onClick={onCreateDocument}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Document</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search local documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-brand-500 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${doc.title}"?`)) onDeleteDocument(doc.id);
                    }}
                    className="text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed dark:text-slate-400">
                  {doc.content || 'Empty document...'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
                <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform dark:text-brand-400">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
