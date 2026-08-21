import type { Editor } from '@tiptap/react';
import { useState } from 'react';

import {
  findUploadPlaceholderPos,
  uploadPlaceholderPluginKey,
} from '../extensions';
import type {
  ChipUploadCallbacks,
  FileAttachmentAttributes,
  InlineImageDisplayOptions,
  UploadHandler,
  UploadingFile,
} from '../types';
import { buildInlineImageStyleString, validateFile } from '../utils';

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'svg',
  'heic',
  'heif',
]);

interface UseEditorFileUploadsOptions {
  enableInlineUploads: boolean;
  enableAttachments: boolean;
  onInlineUpload?: UploadHandler;
  onAttachmentUpload?: UploadHandler;
  onAttachmentAdd?: (attachment: FileAttachmentAttributes) => void;
  onDropRejected?: (file: File, reason: string) => void;
  maxFileSize: number;
  maxInlineUploadSize: number;
  inlineImageDisplay?: InlineImageDisplayOptions;
  acceptedFileTypes?: string[];
  acceptedInlineTypes?: string[];
}

interface UseEditorFileUploadsReturn {
  uploadingFiles: UploadingFile[];
  chipUploadCallbacks: ChipUploadCallbacks;
  hasFileHandlers: boolean;
  canHandleContentDrops: boolean;
  canHandleAttachmentDrops: boolean;
  processChipAttachment: (file: File) => void;
  routeFileFromEditor: (currentEditor: Editor, file: File, pos: number) => void;
}

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot < 0) return '';
  return fileName.slice(lastDot + 1).toLowerCase();
}

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (file.type.length > 0) return false;
  return IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}

function addUploadPlaceholder(editor: Editor, id: string, pos: number) {
  editor.view.dispatch(
    editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
      add: { id, pos },
    })
  );
}

function updateUploadProgress(editor: Editor, id: string, percent: number) {
  editor.view.dispatch(
    editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
      progress: { id, percent },
    })
  );
}

function removeUploadPlaceholder(editor: Editor, id: string) {
  editor.view.dispatch(
    editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
      remove: { id },
    })
  );
}

function resolveInsertPos(
  editor: Editor,
  id: string,
  fallbackPos: number
): number {
  return findUploadPlaceholderPos(editor.state, id) ?? fallbackPos;
}

export function useEditorFileUploads({
  enableInlineUploads,
  enableAttachments,
  onInlineUpload,
  onAttachmentUpload,
  onAttachmentAdd,
  onDropRejected,
  maxFileSize,
  maxInlineUploadSize,
  inlineImageDisplay,
  acceptedFileTypes,
  acceptedInlineTypes,
}: UseEditorFileUploadsOptions): UseEditorFileUploadsReturn {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  // For non-image inline files, prefer the dedicated inline upload handler.
  // Fallback to attachment upload only when inline upload is not provided.
  const inlineFileUploadHandler = onInlineUpload ?? onAttachmentUpload;
  const canHandleInlineImageUploads =
    enableInlineUploads && Boolean(onInlineUpload);
  const canHandleInlineFileUploads =
    enableInlineUploads && Boolean(inlineFileUploadHandler);
  const canHandleContentDrops =
    canHandleInlineImageUploads || canHandleInlineFileUploads;
  const canHandleAttachmentDrops =
    enableAttachments && Boolean(onAttachmentUpload);

  const chipUploadCallbacks: ChipUploadCallbacks = {
    onStart: (id, fileName) => {
      setUploadingFiles((prev) => [...prev, { id, fileName, progress: -1 }]);
    },
    onProgress: (id, percent) => {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: percent } : f))
      );
    },
    onComplete: (id) => {
      setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
    },
    onError: (id) => {
      setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
    },
  };

  const processInlineImageUpload = (
    currentEditor: Editor,
    file: File,
    pos: number
  ) => {
    if (!onInlineUpload) return;

    const validation = validateFile(
      file,
      maxInlineUploadSize,
      acceptedInlineTypes
    );
    if (!validation.valid) {
      onDropRejected?.(file, validation.error ?? 'Invalid file');
      return;
    }

    const uploadId = `fh-inline-image-${Date.now()}-${file.name}`;
    addUploadPlaceholder(currentEditor, uploadId, pos);

    void onInlineUpload(file, (percent) => {
      updateUploadProgress(currentEditor, uploadId, percent);
    })
      .then((response) => {
        const insertPos = resolveInsertPos(currentEditor, uploadId, pos);
        removeUploadPlaceholder(currentEditor, uploadId);
        currentEditor
          .chain()
          .focus()
          .insertContentAt(insertPos, {
            type: 'image',
            attrs: {
              src: response.url,
              attachmentId: response.attachmentId,
              alt: response.fileName || file.name,
              title: response.fileName || file.name,
              style: buildInlineImageStyleString(inlineImageDisplay),
            },
          })
          .run();
      })
      .catch(() => {
        removeUploadPlaceholder(currentEditor, uploadId);
      });
  };

  const processInlineFileAttachment = (
    currentEditor: Editor,
    file: File,
    pos: number
  ) => {
    if (!inlineFileUploadHandler) return;

    const validation = validateFile(
      file,
      maxInlineUploadSize,
      acceptedInlineTypes
    );
    if (!validation.valid) {
      onDropRejected?.(file, validation.error ?? 'Invalid file');
      return;
    }

    const uploadId = `fh-inline-file-${Date.now()}-${file.name}`;
    addUploadPlaceholder(currentEditor, uploadId, pos);

    void inlineFileUploadHandler(file, (percent) => {
      updateUploadProgress(currentEditor, uploadId, percent);
    })
      .then((response) => {
        const insertPos = resolveInsertPos(currentEditor, uploadId, pos);
        removeUploadPlaceholder(currentEditor, uploadId);
        currentEditor
          .chain()
          .focus()
          .insertContentAt(insertPos, {
            type: 'fileAttachment',
            attrs: {
              url: response.url,
              attachmentId: response.attachmentId,
              fileName: response.fileName || file.name,
              fileSize: response.fileSize || file.size,
              mimeType: response.mimeType || file.type,
              uploadedAt: new Date().toISOString(),
            },
          })
          .run();
      })
      .catch(() => {
        removeUploadPlaceholder(currentEditor, uploadId);
      });
  };

  const processChipAttachment = (file: File) => {
    if (!onAttachmentUpload) return;

    const validation = validateFile(file, maxFileSize, acceptedFileTypes);
    if (!validation.valid) {
      onDropRejected?.(file, validation.error ?? 'Invalid file');
      return;
    }

    const uploadId = `fh-attach-${Date.now()}-${file.name}`;
    chipUploadCallbacks.onStart(uploadId, file.name);

    void onAttachmentUpload(file, (percent) => {
      chipUploadCallbacks.onProgress(uploadId, percent);
    })
      .then((response) => {
        chipUploadCallbacks.onComplete(uploadId);
        onAttachmentAdd?.({
          url: response.url,
          attachmentId: response.attachmentId,
          fileName: response.fileName || file.name,
          fileSize: response.fileSize || file.size,
          mimeType: response.mimeType || file.type,
          uploadedAt: new Date().toISOString(),
        });
      })
      .catch(() => {
        chipUploadCallbacks.onError(uploadId);
      });
  };

  const routeFileFromEditor = (
    currentEditor: Editor,
    file: File,
    pos: number
  ) => {
    const imageFile = isImageFile(file);

    if (imageFile && canHandleInlineImageUploads) {
      processInlineImageUpload(currentEditor, file, pos);
      return;
    }

    if (canHandleInlineFileUploads) {
      processInlineFileAttachment(currentEditor, file, pos);
      return;
    }

    onDropRejected?.(file, 'No upload handler configured for this file type');
  };

  return {
    uploadingFiles,
    chipUploadCallbacks,
    hasFileHandlers: canHandleContentDrops || canHandleAttachmentDrops,
    canHandleContentDrops,
    canHandleAttachmentDrops,
    processChipAttachment,
    routeFileFromEditor,
  };
}
