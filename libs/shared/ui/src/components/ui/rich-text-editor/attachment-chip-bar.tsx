import {
  CloseOutlined,
  LoadingOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { theme, Typography } from 'antd';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { AppButton } from '../button';
import type { FileAttachmentAttributes, UploadingFile } from './types';
import { formatFileSize } from './utils';

const { Text } = Typography;

interface AttachmentChipBarProps {
  attachments: FileAttachmentAttributes[];
  uploadingFiles: UploadingFile[];
  onRemove?: (attachment: FileAttachmentAttributes) => void;
  // Modified by Sekar Nagarajan (2026-08-04 11:10)
  onDownload?: (attachment: FileAttachmentAttributes) => void;
  readOnly?: boolean;
}

function UploadingChip({ file }: { file: UploadingFile }) {
  const { token } = theme.useToken();
  const isDeterminate = file.progress >= 0 && file.progress <= 100;

  return (
    <div className="attachment-chip attachment-chip--uploading">
      <LoadingOutlined
        style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}
      />
      <Text
        className="attachment-chip-name"
        type="secondary"
        style={{ fontSize: token.fontSizeSM }}
      >
        {file.fileName}
      </Text>
      <Text
        type="secondary"
        style={{ fontSize: token.fontSizeSM, flexShrink: 0 }}
      >
        {isDeterminate ? `${file.progress}%` : '...'}
      </Text>
    </div>
  );
}

function CompletedChip({
  attachment,
  onRemove,
  onDownload,
  readOnly,
}: {
  attachment: FileAttachmentAttributes;
  onRemove?: (attachment: FileAttachmentAttributes) => void;
  onDownload?: (attachment: FileAttachmentAttributes) => void;
  readOnly?: boolean;
}) {
  const { token } = theme.useToken();

  // Modified by Sekar Nagarajan (2026-08-04 11:10)
  // When a host-provided download handler exists (e.g. authenticated blob
  // download), intercept the anchor click instead of navigating the browser
  // to a protected URL (which drops the Bearer token and 403s).
  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (onDownload) {
      event.preventDefault();
      onDownload(attachment);
    }
  };

  return (
    <div className="attachment-chip">
      <PaperClipOutlined
        style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}
      />
      <a
        href={attachment.url}
        target={onDownload ? undefined : '_blank'}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="attachment-chip-name"
        title={`${attachment.fileName} (${formatFileSize(
          attachment.fileSize
        )})`}
        style={{ fontSize: token.fontSizeSM }}
      >
        {attachment.fileName}
      </a>
      {!readOnly && onRemove && (
        <AppButton
          type="text"
          size="small"
          className="attachment-chip-remove"
          icon={<CloseOutlined style={{ fontSize: 10 }} />}
          onClick={() => onRemove(attachment)}
          aria-label={`Remove ${attachment.fileName}`}
        />
      )}
    </div>
  );
}

export function AttachmentChipBar({
  attachments,
  uploadingFiles,
  onRemove,
  onDownload,
  readOnly,
}: AttachmentChipBarProps) {
  if (attachments.length === 0 && uploadingFiles.length === 0) {
    return null;
  }

  return (
    <div
      className="attachment-chip-bar"
      role="list"
      aria-label="File attachments"
    >
      {attachments.map((attachment) => (
        <CompletedChip
          key={attachment.url}
          attachment={attachment}
          onRemove={onRemove}
          onDownload={onDownload}
          readOnly={readOnly}
        />
      ))}
      {uploadingFiles.map((file) => (
        <UploadingChip key={file.id} file={file} />
      ))}
    </div>
  );
}
