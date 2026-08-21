import type { EmailQueryState, EmailTab } from '../types';

function readValue(
  query: URLSearchParams | Record<string, string | undefined>,
  key: string
): string | undefined {
  if (query instanceof URLSearchParams) {
    const value = query.get(key);
    return value ?? undefined;
  }

  return query[key];
}

function normalizeTab(value: string | undefined): EmailTab | undefined {
  if (value === 'inbox' || value === 'draft') {
    return value;
  }

  return undefined;
}

export function parseEmailQueryState(
  query: URLSearchParams | Record<string, string | undefined>
): EmailQueryState {
  const tab = normalizeTab(readValue(query, 'tab'));
  const threadId = readValue(query, 'threadId');
  const search = readValue(query, 'search');
  const pageValue = readValue(query, 'page');
  const page = pageValue ? Number(pageValue) : undefined;

  return {
    tab,
    threadId,
    search,
    page: Number.isFinite(page) && page ? page : undefined,
  };
}

export function buildEmailQueryState(
  state: EmailQueryState
): Record<string, string> {
  const query: Record<string, string> = {};

  if (state.tab) {
    query.tab = state.tab;
  }

  if (state.threadId) {
    query.threadId = state.threadId;
  }

  if (state.search) {
    query.search = state.search;
  }

  if (state.page && state.page > 0) {
    query.page = String(state.page);
  }

  return query;
}
