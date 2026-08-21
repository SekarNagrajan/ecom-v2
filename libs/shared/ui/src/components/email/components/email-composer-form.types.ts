import type { AudioDictationProp } from '../../ui/audio-dictation-button';
import type {
  EmailAttachmentConstraints,
  EmailDraftContext,
  EmailDraftInput,
  EmailRecipientOption,
} from '../types';

export interface EmailComposerFormProps {
  context: EmailDraftContext;
  initialDraft?: EmailDraftInput;
  recipientOptions: EmailRecipientOption[];
  attachmentConstraints: Required<EmailAttachmentConstraints>;
  draftAutoSaveDebounceMs: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (draft: EmailDraftInput) => Promise<void> | void;
  onDraftChange?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;
  onDraftAutoSaveRequested?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;
  /**
   * Opt-in audio dictation for the message body. When provided, a mic floats
   * in the bottom-right corner of the rich text editor; on transcription
   * completion the text is appended as a new paragraph. shared-ui stays
   * UX-agnostic — all error paths flow through `audioDictation.onError`.
   */
  audioDictation?: AudioDictationProp;
  /** Tooltip for the dictation mic. shared-ui ships no default copy. */
  dictationTooltip?: string;
}
