import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { ReactNode } from 'react';

import { CustomImageNode } from '../custom-image-node';
import type {
  InlineImageDisplayOptions,
  InlineImageRenderProps,
} from '../types';

export interface CustomImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
  inlineImageDisplay?: InlineImageDisplayOptions;
  renderInlineImage?: (props: InlineImageRenderProps) => ReactNode;
}

export const CustomImage = Image.extend<CustomImageOptions>({
  addOptions() {
    return {
      inline: true,
      allowBase64: false,
      HTMLAttributes: {},
      inlineImageDisplay: undefined,
      renderInlineImage: undefined,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      attachmentId: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-attachment-id') ||
          element.getAttribute('attachmentId'),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.attachmentId
            ? { 'data-attachment-id': String(attributes.attachmentId) }
            : {},
      },
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('style'),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.style ? { style: String(attributes.style) } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomImageNode);
  },
});
