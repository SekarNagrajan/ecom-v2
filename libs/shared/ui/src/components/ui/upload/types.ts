import type { ReactNode } from 'react';

export interface AppFileUploadProps {
  accept?: string;
  buttonLabel?: string;
  /** Tighter padding/icon size for the dropzone, e.g. inside a small modal. */
  compact?: boolean;
  description?: ReactNode;
  disabled?: boolean;
  error?: string | null;
  helperText?: ReactNode;
  /** Dropzone-mode only: overrides the default inbox icon shown in the icon badge. */
  icon?: ReactNode;
  /** Dropzone-mode only: arranges the icon beside the text instead of stacked above it. Defaults to 'vertical'. */
  layout?: 'vertical' | 'horizontal';
  maxSizeBytes?: number;
  mode?: 'button' | 'dropzone';
  multiple?: boolean;
  onFileSelect: (file: File) => void | Promise<void>;
  onValidationError?: (message: string) => void;
  /**
   * Dropzone-mode only: renders an explicit "browse" button below the
   * description. Purely decorative -- the whole dropzone already opens the
   * file picker on click, so this just makes that affordance visible.
   */
  selectButtonLabel?: string;
  showFeedback?: boolean;
  title?: ReactNode;
}
