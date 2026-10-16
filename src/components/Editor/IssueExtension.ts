import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Issue } from '../../engine/types';

export interface IssuePluginOptions {
  issues: Issue[];
  onSelectIssue?: (issueId: string, rect?: { top: number; left: number; height: number }) => void;
}

export const issuePluginKey = new PluginKey('issueDecorations');

export const IssueExtension = Extension.create<IssuePluginOptions>({
  name: 'issueExtension',

  addOptions() {
    return {
      issues: [],
      onSelectIssue: undefined,
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: issuePluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            return tr.getMeta(issuePluginKey) || oldState.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement | null;
            if (target && target.dataset && target.dataset.issueId) {
              if (options.onSelectIssue) {
                const rect = target.getBoundingClientRect();
                options.onSelectIssue(target.dataset.issueId, {
                  top: rect.bottom + 6,
                  left: Math.max(16, rect.left),
                  height: rect.height,
                });
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

export function updateIssueDecorations(editor: any, issues: Issue[]) {
  if (!editor || editor.isDestroyed) return;

  const doc = editor.state.doc;
  const decorations: Decoration[] = [];

  for (const issue of issues) {
    const fromPos = issue.from + 1;
    const toPos = issue.to + 1;

    if (fromPos >= 1 && toPos <= doc.content.size) {
      const className = `issue-highlight issue-${issue.type} issue-active-${issue.id}`;
      decorations.push(
        Decoration.inline(fromPos, toPos, {
          class: className,
          'data-issue-id': issue.id,
        })
      );
    }
  }

  const decos = DecorationSet.create(doc, decorations);
  const tr = editor.state.tr.setMeta(issuePluginKey, decos);
  editor.view.dispatch(tr);
}
