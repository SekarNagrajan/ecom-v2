import { type Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

import type { AudioDictationProp } from '../audio-dictation-button';
import type { GrammarImproveProp } from '../grammar-improve-button';
import type { ToneRewriteProp } from '../tone-rewrite-button';

export interface UploadResponse {
  url: string;
  /** Stable backend attachment identifier for downstream URL resolution. */
  attachmentId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export type ToolbarOption =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bulletList'
  | 'orderedList'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'link'
  | 'image'
  | 'file'
  | 'undo'
  | 'redo'
  | 'divider';

export type OutputFormat = 'html' | 'json' | 'markdown';

export type UploadHandler = (
  file: File,
  onProgress?: (percent: number) => void
) => Promise<UploadResponse>;

export type UploadAllowedType =
  | 'any'
  | 'image'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'text'
  | 'csv'
  | 'json'
  | 'archive'
  | 'audio'
  | 'video';

export interface InlineImageDisplayOptions {
  /** Max image width. Number is treated as px. */
  maxWidth?: number | string;
  /** Max image height. Number is treated as px. */
  maxHeight?: number | string;
  /** CSS object-fit for inline images. */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export interface UploadingFile {
  id: string;
  fileName: string;
  /** 0-100 for determinate, -1 for indeterminate */
  progress: number;
}

export interface ChipUploadCallbacks {
  onStart: (id: string, fileName: string) => void;
  onProgress: (id: string, percent: number) => void;
  onComplete: (id: string) => void;
  onError: (id: string) => void;
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  outputFormat?: OutputFormat;

  editorRef?: React.RefObject<Editor | null>;

  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;

  enableLinks?: boolean;
  enableInlineUploads?: boolean;
  enableAttachments?: boolean;
  enableHeadings?: boolean;
  enableLists?: boolean;
  enableTextAlignment?: boolean;
  enableUndo?: boolean;

  /** Controlled list of completed bottom-bar attachments. */
  attachments?: FileAttachmentAttributes[];
  /** Fires when a bottom-zone/file-button attachment upload succeeds. */
  onAttachmentAdd?: (attachment: FileAttachmentAttributes) => void;
  /** Fires when user removes an attachment chip from the bottom bar. */
  onAttachmentRemove?: (attachment: FileAttachmentAttributes) => void;
  /**
   * Modified by Sekar Nagarajan (2026-08-04 11:10)
   * Fires when the user downloads an attachment (inline node or chip).
   * Prefer an authenticated download (Bearer JWT) over opening `url` in a tab.
   */
  onAttachmentDownload?: (attachment: FileAttachmentAttributes) => void;

  toolbarOptions?: ToolbarOption[];
  toolbarPosition?: 'top' | 'bottom';
  showToolbar?: boolean;

  onInlineUpload?: UploadHandler;
  onAttachmentUpload?: UploadHandler;

  /** Tooltip label for the inline upload toolbar button. Defaults to "Upload Inline File". */
  inlineUploadLabel?: string;
  /** Tooltip label for the attachment upload toolbar button. Defaults to "Attach File". */
  attachmentUploadLabel?: string;

  /** Custom renderer for inline images in the editor content */
  renderInlineImage?: (props: InlineImageRenderProps) => ReactNode;
  /** Custom renderer for inline file attachments in the editor content */
  renderInlineFile?: (props: InlineFileRenderProps) => ReactNode;
  /** Custom renderer for the attachment bar area. Falls back to the default chip bar. */
  renderAttachmentBar?: (props: {
    attachments: FileAttachmentAttributes[];
    uploadingFiles: UploadingFile[];
    onRemove?: (attachment: FileAttachmentAttributes) => void;
    readOnly?: boolean;
  }) => ReactNode;
  /** Called when a dropped file is rejected (invalid type/size) */
  onDropRejected?: (file: File, reason: string) => void;

  characterLimit?: number;
  maxFileSize?: number;
  maxInlineUploadSize?: number;

  /** Display constraints applied to inline image nodes and persisted in HTML style. */
  inlineImageDisplay?: InlineImageDisplayOptions;
  /** Convenient preset groups for inline uploads, e.g. ['image', 'pdf']. Ignored when acceptedInlineTypes is provided. */
  inlineAllowedTypes?: UploadAllowedType[];
  /** Convenient preset groups for attachment uploads, e.g. ['pdf', 'document']. Ignored when acceptedFileTypes is provided. */
  attachmentAllowedTypes?: UploadAllowedType[];
  /** MIME types accepted for attachment uploads (bottom attachment bar + attachment button). */
  acceptedFileTypes?: string[];
  /** MIME types accepted for inline uploads (images and inline file attachments). */
  acceptedInlineTypes?: string[];

  showCharacterCount?: boolean;
  showWordCount?: boolean;

  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  minHeight?: string | number;

  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  autoComplete?: string;

  /**
   * Opt-in audio dictation. When provided, a mic button appears in the
   * bottom-right corner of the editor; on transcription completion the text
   * is appended at the end of the document as a new paragraph. shared-ui
   * stays UX-agnostic — all error paths flow through
   * `audioDictation.onError`.
   */
  audioDictation?: AudioDictationProp;
  /** Tooltip for the dictation mic button. shared-ui ships no default copy. */
  dictationTooltip?: string;
  /** Tooltip while recording is in progress. Defaults to `dictationTooltip`. */
  dictationRecordingTooltip?: string;
  /** Tooltip while transcription is in flight. Defaults to `dictationTooltip`. */
  dictationTranscribingTooltip?: string;

  /**
   * Opt-in grammar improvement. When provided, an "Improve Grammar" button
   * appears in the bottom-right corner of the editor (to the left of dictation
   * if both are enabled). Only visible when the editor has non-empty content.
   */
  grammarImprove?: GrammarImproveProp;
  /** Tooltip for the grammar improve button. Defaults to "Improve Grammar". */
  grammarImproveTooltip?: string;

  /**
   * Opt-in tone / rewrite dropdown. When provided, a "Rewrite" button appears
   * next to Grammar / Dictation. Callers ship the action list and the async
   * `rewrite` callback; shared-ui owns the loading state and replaces the
   * editor content with the returned HTML.
   */
  toneRewrite?: ToneRewriteProp;
  /** Tooltip for the tone/rewrite button. Defaults to "Rewrite". */
  toneRewriteTooltip?: string;
}

export interface EditorToolbarProps {
  options?: ToolbarOption[];
  enableInlineUploads?: boolean;
  enableAttachments?: boolean;
  onInlineFileSelect?: (file: File) => void;
  onAttachmentUpload?: UploadHandler;
  maxFileSize?: number;
  acceptedInlineTypes?: string[];
  acceptedFileTypes?: string[];
  onAttachmentAdd?: (attachment: FileAttachmentAttributes) => void;
  chipUploadCallbacks?: ChipUploadCallbacks;
  inlineUploadLabel?: string;
  attachmentUploadLabel?: string;
}

export interface EditorFooterProps {
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  characterLimit?: number;
}

export interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialText?: string;
}

export interface InlineImageRenderProps {
  src: string;
  attachmentId?: string;
  alt?: string;
  title?: string;
  selected: boolean;
  onDelete: () => void;
}

export interface InlineFileRenderProps {
  url: string;
  attachmentId?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  selected: boolean;
  onDelete: () => void;
  onDownload: () => void;
}

export interface FileAttachmentAttributes {
  url: string;
  attachmentId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
