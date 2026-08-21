import { sanitizeHtml } from '../../../utils/html-sanitizer';
import type {
  EmailAttachmentConstraints,
  EmailDraftContext,
  EmailDraftInput,
  EmailMessage,
} from '../types';

type ComposeFormValues = {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
};

function normalizeEmailArray(values: string[]): string[] {
  const normalized = values.map((value) => value.trim()).filter(Boolean);

  return Array.from(new Set(normalized));
}

export function toDraftInput(
  values: ComposeFormValues,
  files: File[],
  context: EmailDraftContext
): EmailDraftInput {
  return {
    threadId: context.threadId,
    to: normalizeEmailArray(values.to),
    cc: normalizeEmailArray(values.cc),
    bcc: normalizeEmailArray(values.bcc),
    subject: values.subject.trim(),
    bodyHtml: sanitizeHtml(values.bodyHtml),
    attachments: files,
  };
}

export function buildReplyQuoteHtml(params: {
  formattedDateTime: string;
  senderNameOrEmail: string;
  originalBodyHtml: string;
}): string {
  const quotedBody = sanitizeHtml(params.originalBodyHtml);

  return [
    '<p></p>',
    `<p>On ${params.formattedDateTime}, ${params.senderNameOrEmail} wrote:</p>`,
    `<blockquote>${quotedBody}</blockquote>`,
  ].join('');
}

export function getEmailComposerTitle(context: EmailDraftContext): string {
  if (context.mode === 'reply') {
    return 'Reply';
  }

  if (context.mode === 'forward') {
    return 'Forward';
  }

  return 'New Email';
}

export function buildReplySubject(subject: string): string {
  const trimmed = subject.trim();

  if (!trimmed) {
    return 'Re:';
  }

  if (trimmed.toLowerCase().startsWith('re:')) {
    return trimmed;
  }

  return `Re: ${trimmed}`;
}

export function buildForwardSubject(subject: string): string {
  const trimmed = subject.trim();

  if (!trimmed) {
    return 'Fwd:';
  }

  if (trimmed.toLowerCase().startsWith('fwd:')) {
    return trimmed;
  }

  return `Fwd: ${trimmed}`;
}

export function getLatestMessage(
  messages: EmailMessage[]
): EmailMessage | undefined {
  if (!messages.length) {
    return undefined;
  }

  return messages[messages.length - 1];
}

export function resolveAttachmentConstraints(
  constraints: EmailAttachmentConstraints | undefined,
  defaults: Required<EmailAttachmentConstraints>
): Required<EmailAttachmentConstraints> {
  return {
    maxFiles: constraints?.maxFiles ?? defaults.maxFiles,
    maxFileSizeBytes:
      constraints?.maxFileSizeBytes ?? defaults.maxFileSizeBytes,
    acceptedMimeTypes:
      constraints?.acceptedMimeTypes ?? defaults.acceptedMimeTypes,
  };
}
