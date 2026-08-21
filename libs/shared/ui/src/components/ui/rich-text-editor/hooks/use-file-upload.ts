import type { Editor } from '@tiptap/react';
import { useState } from 'react';

import { useToast } from '../../../../hooks/use-toast';
import { uploadPlaceholderPluginKey } from '../extensions';
import type { ChipUploadCallbacks, UploadResponse } from '../types';
import { validateFile } from '../utils';

interface UseFileUploadOptions {
  editor: Editor | null;
  onUpload: (
    file: File,
    onProgress?: (percent: number) => void
  ) => Promise<UploadResponse>;
  maxSize: number;
  acceptedTypes?: string[];
  onSuccess: (response: UploadResponse, file: File) => void;
  successMessage: string;
  errorMessage: string;
  /**
   * When true, upload progress is shown via ProseMirror inline placeholders.
   * When false, progress is reported through chipCallbacks instead.
   */
  useInlinePlaceholder?: boolean;
  chipCallbacks?: ChipUploadCallbacks;
}

export function useFileUpload({
  editor,
  onUpload,
  maxSize,
  acceptedTypes,
  onSuccess,
  successMessage,
  errorMessage,
  useInlinePlaceholder = true,
  chipCallbacks,
}: UseFileUploadOptions) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const trackStart = (id: string, fileName: string) => {
    if (useInlinePlaceholder) {
      if (!editor) return;
      const { state, dispatch } = editor.view;
      dispatch(
        state.tr.setMeta(uploadPlaceholderPluginKey, {
          add: { id, pos: state.selection.from },
        })
      );
    } else {
      chipCallbacks?.onStart(id, fileName);
    }
  };

  const trackProgress = (id: string, percent: number) => {
    setProgress(percent);
    if (useInlinePlaceholder) {
      if (!editor) return;
      editor.view.dispatch(
        editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
          progress: { id, percent },
        })
      );
    } else {
      chipCallbacks?.onProgress(id, percent);
    }
  };

  const trackEnd = (id: string) => {
    if (useInlinePlaceholder) {
      if (!editor) return;
      editor.view.dispatch(
        editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
          remove: { id },
        })
      );
    } else {
      chipCallbacks?.onComplete(id);
    }
  };

  const trackError = (id: string) => {
    if (useInlinePlaceholder) {
      if (!editor) return;
      editor.view.dispatch(
        editor.view.state.tr.setMeta(uploadPlaceholderPluginKey, {
          remove: { id },
        })
      );
    } else {
      chipCallbacks?.onError(id);
    }
  };

  const upload = async (file: File) => {
    if (!editor) return;

    const validation = validateFile(file, maxSize, acceptedTypes);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);
    setProgress(null);
    const id = `upload-${Date.now()}`;

    try {
      trackStart(id, file.name);
      const response = await onUpload(file, (percent) =>
        trackProgress(id, percent)
      );
      trackEnd(id);
      onSuccess(response, file);
      toast.success(successMessage);
    } catch (error) {
      trackError(id);
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return { upload, uploading, progress };
}
