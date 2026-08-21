import type { EmailMessage } from '../types';

export function getForwardMessageId(
  expandedMessageIds: string[],
  messages: EmailMessage[]
): string | undefined {
  if (!messages.length) {
    return undefined;
  }

  if (!expandedMessageIds.length) {
    return messages[0]?.id;
  }

  const expanded = messages.find((message) =>
    expandedMessageIds.includes(message.id)
  );

  return expanded?.id ?? messages[0]?.id;
}
