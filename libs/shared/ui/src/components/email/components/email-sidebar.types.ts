import type { ReactNode } from 'react';

import type { EmailThreadListItemRenderProps } from '../types';

export interface EmailSidebarProps {
  onNewEmail: () => void;
  onThreadSelect: (threadId: string) => void;
  renderThreadListItem?: (props: EmailThreadListItemRenderProps) => ReactNode;
}
