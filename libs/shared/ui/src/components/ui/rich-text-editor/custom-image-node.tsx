import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { theme } from 'antd';

import type { CustomImageOptions } from './extensions/custom-image';
import {
  buildInlineImageReactStyle,
  parseInlineImageStyleToReact,
} from './utils';

export function CustomImageNode({
  node,
  deleteNode,
  selected,
  extension,
}: NodeViewProps) {
  const { token } = theme.useToken();
  const { src, attachmentId, alt, title, style } = node.attrs as {
    src: string;
    attachmentId?: string;
    alt?: string;
    title?: string;
    style?: string;
  };
  const options = extension.options as CustomImageOptions;

  if (options.renderInlineImage) {
    return (
      <NodeViewWrapper as="span" style={{ display: 'inline' }}>
        {options.renderInlineImage({
          src,
          attachmentId,
          alt,
          title,
          selected,
          onDelete: deleteNode,
        })}
      </NodeViewWrapper>
    );
  }

  const imageStyle =
    parseInlineImageStyleToReact(style) ??
    buildInlineImageReactStyle(options.inlineImageDisplay);

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <img
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        draggable={false}
        style={{
          ...imageStyle,
          borderRadius: token.borderRadius,
          outline: selected ? `2px solid ${token.colorPrimary}` : undefined,
        }}
      />
    </NodeViewWrapper>
  );
}
