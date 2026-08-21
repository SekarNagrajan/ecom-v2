import type { ReactNode } from 'react';

import type {
  EmailAttachment,
  EmailMessage,
  EmailThreadMessageRenderProps,
} from '../types';

export interface EmailThreadViewProps {
  isMobileDetail: boolean;
  onCloseMobileDetail: () => void;
  onReply: () => void;
  onForward: (messageId: string) => void;
  onAttachmentClick?: (payload: {
    message: EmailMessage;
    attachment: EmailAttachment;
  }) => void;
  renderThreadMessage?: (props: EmailThreadMessageRenderProps) => ReactNode;
}
