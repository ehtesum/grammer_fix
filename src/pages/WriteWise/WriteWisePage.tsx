import React, { useState } from 'react';
import { WriteWiseEditor } from '../../components/Editor/WriteWiseEditor';
import { RightSidebar } from '../../components/Sidebar/RightSidebar';
import { DocumentData, Issue, ReadabilityMetrics, ToneMetrics, UserSettings, WritingScore } from '../../engine/types';

interface WriteWisePageProps {
  currentDocument: DocumentData | null;
  customDictionary: string[];
  settings: UserSettings;
  issues: Issue[];
  score: WritingScore;
  readability: ReadabilityMetrics;
  tone: ToneMetrics;
  activeIssueId: string | null;
  onAnalysisUpdate: (data: { issues: Issue[]; readability: ReadabilityMetrics; tone: ToneMetrics; score: WritingScore }) => void;
  onContentChange: (newContent: string) => void;
  onSelectIssueId: (id: string | null) => void;
  onAcceptIssue: (issue: Issue) => void;
  onAcceptAllIssues: () => void;
  onIgnoreIssue: (issue: Issue) => void;
  onAddToDictionary: (word: string) => void;
}

export const WriteWisePage: React.FC<WriteWisePageProps> = ({
  currentDocument,
  customDictionary,
  settings,
  issues,
  score,
  readability,
  tone,
  activeIssueId,
  onAnalysisUpdate,
  onContentChange,
  onSelectIssueId,
  onAcceptIssue,
  onAcceptAllIssues,
  onIgnoreIssue,
  onAddToDictionary,
}) => {
  if (!currentDocument) return null;

  return (
    <div className="flex flex-1 p-4 gap-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <WriteWiseEditor
        initialContent={currentDocument.content}
        customDictionary={customDictionary}
        enabledRules={settings.enabledRules}
        onAnalysisUpdate={onAnalysisUpdate}
        onContentChange={onContentChange}
        onSelectIssueId={onSelectIssueId}
        activeIssueId={activeIssueId}
        onAcceptIssue={onAcceptIssue}
        onIgnoreIssue={onIgnoreIssue}
        onAddToDictionary={onAddToDictionary}
      />

      <RightSidebar
        issues={issues}
        score={score}
        readability={readability}
        tone={tone}
        activeIssueId={activeIssueId}
        onAcceptIssue={onAcceptIssue}
        onAcceptAllIssues={onAcceptAllIssues}
        onIgnoreIssue={onIgnoreIssue}
        onAddToDictionary={onAddToDictionary}
        onSelectIssueId={onSelectIssueId}
      />
    </div>
  );
};
