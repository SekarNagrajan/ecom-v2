// Modified by Sekar Nagarajan (2026-09-07 17:24)
/** Search param value when session dies mid-use (CRM parity). */
export const SESSION_EXPIRED_SEARCH_REASON = "session-expired" as const;

export type SessionExpiredSearchReason =
  typeof SESSION_EXPIRED_SEARCH_REASON;
