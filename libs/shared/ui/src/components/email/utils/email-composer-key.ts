import type { EmailDraftInput } from '../types';

interface ComposerKeyParams {
  mode: 'new' | 'reply' | 'forward';
  threadId?: string;
  messageId?: string;
  initialDraft?: EmailDraftInput;
}

export function buildComposerFormKey(params: ComposerKeyParams): string {
  return [
    params.mode,
    params.threadId ?? '',
    params.messageId ?? '',
    params.initialDraft?.subject ?? '',
    (params.initialDraft?.to ?? []).join(','),
  ].join('|');
}
