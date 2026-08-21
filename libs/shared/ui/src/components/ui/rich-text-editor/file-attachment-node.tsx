import {
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { theme, Typography } from 'antd';
import { DateTime } from 'luxon';

import { AppButton } from '../button';
import type { FileAttachmentOptions } from './extensions/file-attachment';
import type { FileAttachmentAttributes } from './types';
import { formatFileSize } from './utils';

const { Text } = Typography;

export function FileAttachmentNode({
  node,
  deleteNode,
  selected,
  extension,
}: NodeViewProps) {
  const { token } = theme.useToken();
  const { url, attachmentId, fileName, fileSize, mimeType, uploadedAt } =
    node.attrs as FileAttachmentAttributes;
  const options = extension.options as FileAttachmentOptions;

  // Modified by Sekar Nagarajan (2026-08-04 11:10)
  // Prefer a host-provided download handler (e.g. one that attaches an auth
  // token) so protected download URLs don't 403 on a raw browser navigation.
  // Fall back to `window.open` for public/blob URLs when none is supplied.
  const handleDownload = () => {
    const attrs = {
      url,
      attachmentId,
      fileName,
      fileSize,
      mimeType,
      uploadedAt,
    } as FileAttachmentAttributes;

    if (options.onDownloadFile) {
      options.onDownloadFile(attrs);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (options.renderInlineFile) {
    return (
      <NodeViewWrapper as="span" style={{ display: 'inline' }}>
        {options.renderInlineFile({
          url,
          attachmentId,
          fileName,
          fileSize,
          mimeType,
          selected,
          onDelete: deleteNode,
          onDownload: handleDownload,
        })}
      </NodeViewWrapper>
    );
  }

  const formattedSize = fileSize ? formatFileSize(fileSize) : '';
  const formattedDate = uploadedAt
    ? DateTime.fromISO(uploadedAt).toLocaleString(DateTime.DATETIME_SHORT)
    : '';

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: token.marginXS,
          padding: `${token.paddingXXS}px ${token.paddingXS}px`,
          backgroundColor: token.colorBgContainer,
          border: `${token.lineWidth}px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          verticalAlign: 'middle',
          outline: selected
            ? `${token.lineWidthBold}px solid ${token.colorPrimary}`
            : undefined,
        }}
      >
        <FileOutlined
          style={{
            fontSize: token.fontSizeSM,
            color: token.colorPrimary,
          }}
        />

        <span style={{ minWidth: 0 }}>
          <Text
            strong
            style={{
              display: 'inline',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 220,
            }}
          >
            {fileName}
          </Text>
          <Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              marginInlineStart: token.marginXS,
            }}
          >
            {[formattedSize, mimeType, formattedDate]
              .filter(Boolean)
              .join(' • ')}
          </Text>
        </span>

        <span style={{ display: 'inline-flex', gap: token.marginXXS }}>
          <AppButton
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            aria-label="Download file"
          />
          <AppButton
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={deleteNode}
            aria-label="Remove file"
          />
        </span>
      </span>
    </NodeViewWrapper>
  );
}
