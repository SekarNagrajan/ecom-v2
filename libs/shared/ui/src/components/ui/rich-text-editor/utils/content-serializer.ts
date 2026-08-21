import type { Editor } from '@tiptap/react';
import TurndownService from 'turndown';

import type { OutputFormat } from '../types';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export function serializeContent(
  editor: Editor,
  format: OutputFormat = 'html'
): string {
  switch (format) {
    case 'html':
      return editor.getHTML();

    case 'json':
      return JSON.stringify(editor.getJSON());

    case 'markdown':
      return turndownService.turndown(editor.getHTML());

    default:
      return editor.getHTML();
  }
}
