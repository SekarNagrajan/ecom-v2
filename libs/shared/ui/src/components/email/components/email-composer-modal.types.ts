import type { AudioDictationProp } from '../../ui/audio-dictation-button';
import type {
  EmailAttachmentConstraints,
  EmailDraftContext,
  EmailDraftInput,
  EmailRecipientOption,
} from '../types';

export interface EmailComposerModalProps {
  recipientOptions: EmailRecipientOption[];
  attachmentConstraints: Required<EmailAttachmentConstraints>;
  onSubmit: (draft: EmailDraftInput) => Promise<void> | void;
  onDraftChange?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;
  onDraftAutoSaveRequested?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;
  /** Opt-in audio dictation forwarded to the composer's message editor. */
  audioDictation?: AudioDictationProp;
  /** Tooltip for the dictation mic. shared-ui ships no default copy. */
  dictationTooltip?: string;
}
