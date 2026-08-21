import type { EmailAttachment, EmailMessage } from '../types';

export interface EmailThreadMessageDefaultProps {
  message: EmailMessage;
  isExpanded: boolean;
  isCollapsible?: boolean;
  formattedDateTime: string;
  onToggle: () => void;
  onAttachmentClick?: (payload: {
    message: EmailMessage;
    attachment: EmailAttachment;
  }) => void;
}
