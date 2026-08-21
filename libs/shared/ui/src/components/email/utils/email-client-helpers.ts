import { DateTime } from 'luxon';

import type { EmailTab, EmailThreadListItem } from '../types';

function toMillis(value: string): number {
  const dt = DateTime.fromISO(value);
  if (!dt.isValid) {
    return 0;
  }

  return dt.toMillis();
}

function matchesSearch(thread: EmailThreadListItem, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  if (thread.subject.toLowerCase().includes(normalizedSearch)) {
    return true;
  }

  if (thread.snippet.toLowerCase().includes(normalizedSearch)) {
    return true;
  }

  for (const participant of thread.participants) {
    if (participant.email.toLowerCase().includes(normalizedSearch)) {
      return true;
    }

    if (
      participant.name &&
      participant.name.toLowerCase().includes(normalizedSearch)
    ) {
      return true;
    }
  }

  return false;
}

export function filterAndSortClientThreads(
  threads: EmailThreadListItem[],
  tab: EmailTab,
  search: string
): EmailThreadListItem[] {
  return threads
    .filter((thread) => thread.tab === tab)
    .filter((thread) => matchesSearch(thread, search))
    .sort(
      (first, second) =>
        toMillis(second.lastMessageAtUtc) - toMillis(first.lastMessageAtUtc)
    );
}
