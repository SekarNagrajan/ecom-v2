import { PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import type { Editor } from '@tiptap/react';
import { Tooltip, Upload } from 'antd';

import { AppButton } from '../../button';
import { useFileUpload } from '../hooks/use-file-upload';
import type {
  ChipUploadCallbacks,
  FileAttachmentAttributes,
  UploadResponse,
} from '../types';

interface InlineUploadButtonProps {
  acceptedInlineTypes?: string[];
  onSelect: (file: File) => void;
  label?: string;
}

function getInlineUploadAccept(
  acceptedInlineTypes?: string[]
): string | undefined {
  if (!acceptedInlineTypes || acceptedInlineTypes.length === 0) {
    return undefined;
  }
  return acceptedInlineTypes.join(',');
}

export function InlineUploadButton({
  acceptedInlineTypes,
  onSelect,
  label,
}: InlineUploadButtonProps) {
  const accept = getInlineUploadAccept(acceptedInlineTypes);
  const buttonLabel = label ?? 'Upload Inline File';

  return (
    <Upload
      accept={accept}
      showUploadList={false}
      beforeUpload={(file) => {
        onSelect(file);
        return false;
      }}
    >
      <Tooltip title={buttonLabel}>
        <AppButton
          type="text"
          icon={<UploadOutlined />}
          size="small"
          aria-label={buttonLabel}
        />
      </Tooltip>
    </Upload>
  );
}

interface FileUploadButtonProps {
  editor: Editor;
  onUpload: (
    file: File,
    onProgress?: (percent: number) => void
  ) => Promise<UploadResponse>;
  maxSize?: number;
  acceptedTypes?: string[];
  onAttachmentAdd?: (attachment: FileAttachmentAttributes) => void;
  chipUploadCallbacks?: ChipUploadCallbacks;
  label?: string;
}

export function FileUploadButton({
  editor,
  onUpload,
  maxSize,
  acceptedTypes,
  onAttachmentAdd,
  chipUploadCallbacks,
  label,
}: FileUploadButtonProps) {
  const { upload, uploading } = useFileUpload({
    editor,
    onUpload,
    maxSize: maxSize ?? 10 * 1024 * 1024,
    acceptedTypes,
    useInlinePlaceholder: false,
    chipCallbacks: chipUploadCallbacks,
    onSuccess: (response, file) => {
      onAttachmentAdd?.({
        url: response.url,
        attachmentId: response.attachmentId,
        fileName: response.fileName || file.name,
        fileSize: response.fileSize || file.size,
        mimeType: response.mimeType || file.type,
        uploadedAt: new Date().toISOString(),
      });
    },
    successMessage: 'File attached successfully',
    errorMessage: 'Failed to attach file',
  });

  const acceptString = acceptedTypes?.join(',');
  const buttonLabel = label ?? 'Attach File';

  return (
    <Upload
      accept={acceptString}
      showUploadList={false}
      beforeUpload={(file) => {
        upload(file);
        return false;
      }}
    >
      <Tooltip title={buttonLabel}>
        <AppButton
          type="text"
          icon={<PaperClipOutlined />}
          loading={uploading}
          size="small"
          aria-label={buttonLabel}
        />
      </Tooltip>
    </Upload>
  );
}
