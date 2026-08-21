import type { ReactNode } from 'react';

import type { AudioDictationProp } from '../ui/audio-dictation-button';

export type EmailMode = 'client' | 'server';
export type EmailTab = 'inbox' | 'draft';
export type EmailComposerMode = 'new' | 'reply' | 'forward';
export type EmailListLoadUi = 'pagination' | 'progressive';
export type EmailProgressiveLoadTrigger =
  | 'infinite-scroll'
  | 'load-more-button';
export type InvalidDefaultThreadBehavior = 'show-error' | 'ignore';

export interface EmailParticipant {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface EmailThreadListItem {
  id: string;
  tab: EmailTab;
  subject: string;
  snippet: string;
  participants: EmailParticipant[];
  lastMessageAtUtc: string;
  hasDraft?: boolean;
  unreadCount?: number;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  subject: string;
  bodyHtml: string;
  sentAtUtc: string;
  attachments?: EmailAttachment[];
}

export interface EmailDraftInput {
  threadId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyHtml: string;
  attachments?: File[];
}

export interface EmailPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface EmailFetchThreadsParams {
  tab: EmailTab;
  search: string;
  page: number;
  pageSize: number;
}

export interface EmailRecipientOption {
  label: string;
  value: string;
}

export interface EmailAttachmentConstraints {
  maxFiles?: number;
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: string[];
}

export interface EmailDraftContext {
  mode: EmailComposerMode;
  threadId?: string;
  messageId?: string;
}

export interface EmailThreadListItemRenderProps {
  thread: EmailThreadListItem;
  isSelected: boolean;
  formattedDate: string;
  onSelect: () => void;
}

export interface EmailThreadMessageRenderProps {
  message: EmailMessage;
  isExpanded: boolean;
  formattedDateTime: string;
  onToggle: () => void;
}

interface EmailCenterBaseProps {
  defaultTab?: EmailTab;
  defaultThreadId?: string;
  selectedThreadId?: string;
  onSelectedThreadIdChange?: (threadId: string | undefined) => void;
  invalidDefaultThreadBehavior?: InvalidDefaultThreadBehavior;

  listLoadUi?: EmailListLoadUi;
  progressiveLoadTrigger?: EmailProgressiveLoadTrigger;
  pageSize?: number;
  searchDebounceMs?: number;

  enableMobileBackClose?: boolean;
  draftAutoSaveDebounceMs?: number;
  attachmentConstraints?: EmailAttachmentConstraints;
  recipientOptions?: EmailRecipientOption[];

  /**
   * Opt-in audio dictation for the composer's message editor. When provided,
   * the consuming app supplies a transcription callback and an error handler;
   * shared-ui stays UX-agnostic and renders no toasts of its own.
   */
  composerAudioDictation?: AudioDictationProp;
  /** Tooltip for the composer dictation mic. */
  composerDictationTooltip?: string;

  onSendNewEmail?: (draft: EmailDraftInput) => Promise<void> | void;
  onSendReply?: (payload: {
    threadId: string;
    draft: EmailDraftInput;
  }) => Promise<void> | void;
  onSendForward?: (payload: {
    messageId: string;
    draft: EmailDraftInput;
  }) => Promise<void> | void;

  onDraftChange?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;
  onDraftAutoSaveRequested?: (
    draft: EmailDraftInput,
    context: EmailDraftContext
  ) => void | Promise<void>;

  onEmailOpen?: (payload: {
    threadId: string;
    thread?: EmailThreadListItem;
  }) => void;
  onSearch?: (value: string) => void;
  onTabChange?: (tab: EmailTab) => void;
  onComposeOpen?: (context: EmailDraftContext) => void;
  onComposeClose?: (context: EmailDraftContext) => void;

  onThreadAttachmentClick?: (payload: {
    message: EmailMessage;
    attachment: EmailAttachment;
  }) => void;

  renderThreadListItem?: (props: EmailThreadListItemRenderProps) => ReactNode;
  renderThreadMessage?: (props: EmailThreadMessageRenderProps) => ReactNode;
}

export interface EmailCenterClientProps extends EmailCenterBaseProps {
  mode: 'client';
  clientThreads: EmailThreadListItem[];
  clientMessagesByThreadId?: Record<string, EmailMessage[]>;
  onFetchThreadMessages?: (threadId: string) => Promise<EmailMessage[]>;
}

export interface EmailCenterServerProps extends EmailCenterBaseProps {
  mode: 'server';
  onFetchThreads: (
    params: EmailFetchThreadsParams
  ) => Promise<EmailPaginatedResult<EmailThreadListItem>>;
  onFetchThreadMessages: (threadId: string) => Promise<EmailMessage[]>;
}

export type AppEmailCenterProps =
  | EmailCenterClientProps
  | EmailCenterServerProps;

export interface EmailQueryState {
  tab?: EmailTab;
  threadId?: string;
  search?: string;
  page?: number;
}
