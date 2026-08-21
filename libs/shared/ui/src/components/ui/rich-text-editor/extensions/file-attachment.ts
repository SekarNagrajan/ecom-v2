import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { ReactNode } from 'react';

import { FileAttachmentNode } from '../file-attachment-node';
import type { FileAttachmentAttributes, InlineFileRenderProps } from '../types';

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, unknown>;
  renderInlineFile?: (props: InlineFileRenderProps) => ReactNode;
  // Modified by Sekar Nagarajan (2026-08-04 11:10)
  onDownloadFile?: (attrs: FileAttachmentAttributes) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      /**
       * Set a file attachment
       */
      setFileAttachment: (attributes: FileAttachmentAttributes) => ReturnType;
    };
  }
}

/**
 * Custom Tiptap extension for file attachments
 */
export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      renderInlineFile: undefined,
      onDownloadFile: undefined,
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('href') ||
          element.getAttribute('data-url') ||
          element.getAttribute('url'),
        renderHTML: (attributes) => ({
          href: attributes.url,
          'data-url': attributes.url,
        }),
      },
      attachmentId: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-attachment-id') ||
          element.getAttribute('attachmentId'),
        renderHTML: (attributes) =>
          attributes.attachmentId
            ? { 'data-attachment-id': attributes.attachmentId }
            : {},
      },
      fileName: {
        default: null,
        parseHTML: (element) => {
          const rawText = element.textContent?.replace(/^📎\s*/, '').trim();
          return (
            element.getAttribute('data-file-name') ||
            element.getAttribute('fileName') ||
            rawText
          );
        },
        renderHTML: (attributes) => ({
          'data-file-name': attributes.fileName,
          title: attributes.fileName,
        }),
      },
      fileSize: {
        default: null,
        parseHTML: (element) => {
          const raw =
            element.getAttribute('data-file-size') ||
            element.getAttribute('fileSize');
          if (!raw) return null;
          const parsed = Number(raw);
          return Number.isFinite(parsed) ? parsed : null;
        },
        renderHTML: (attributes) => ({
          'data-file-size': attributes.fileSize,
        }),
      },
      mimeType: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-mime-type') ||
          element.getAttribute('mimeType'),
        renderHTML: (attributes) => ({
          'data-mime-type': attributes.mimeType,
        }),
      },
      uploadedAt: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-uploaded-at') ||
          element.getAttribute('uploadedAt'),
        renderHTML: (attributes) => ({
          'data-uploaded-at': attributes.uploadedAt,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-file-attachment]',
      },
      {
        tag: 'div[data-file-attachment]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const fileName =
      (node.attrs as FileAttachmentAttributes).fileName || 'Attachment';

    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-file-attachment': '',
        class: 'rte-inline-file-link',
        target: '_blank',
        rel: 'noopener noreferrer',
        style:
          'display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border:1px solid color-mix(in srgb, var(--ant-color-link, #1677ff) 38%, transparent);border-radius:999px;background:color-mix(in srgb, var(--ant-color-link, #1677ff) 14%, transparent);color:var(--ant-color-link, #1677ff);text-decoration:none;font-size:12px;font-weight:500;line-height:1.6;vertical-align:middle;white-space:nowrap;',
      }),
      `📎 ${fileName}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNode);
  },

  addCommands() {
    return {
      setFileAttachment:
        (attributes: FileAttachmentAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
