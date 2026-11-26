// Modified by Sekar Nagarajan (2026-11-26 20:30)
import type { UserProfile } from '@solverminds/auth';
import { env } from '@solverminds/platform';

/**
 * Session-only token → user registry shared by the mock auth handlers.
 * Every mock login registers its token here; GET /api/auth/me resolves the bearer token from it.
 * (Moved out of auth-admin.mock-data.ts, whose hand-written users were replaced by the fixtures.)
 *
 * It also simulates the server side of the session lifecycle so the whole expiry flow can be
 * exercised without a backend: access-token lifetime (VITE_MOCK_TOKEN_TTL_MS), rotating refresh,
 * server-side idle enforcement, an absolute session cap and logout revocation.
 *
 * Mock simplifications (the real backend uses an HttpOnly refresh cookie + rotation/reuse detection):
 * - the refresh "credential" is the previous bearer token, which is accepted even when expired;
 * - superseded tokens stay valid for as long as the session's current token is (no reuse detection),
 *   so two tabs refreshing at once cannot knock each other out.
 */
const TOKEN_USER_MAP = new Map<string, UserProfile>();

export function registerMockToken(token: string, user: UserProfile): void {
  TOKEN_USER_MAP.set(token, user);
}

export function resolveMockToken(token: string | null | undefined): UserProfile | undefined {
  return token ? TOKEN_USER_MAP.get(token) : undefined;
}

/** User registered for the request's `Authorization: Bearer <token>` header, if any. */
export function bearerUser(request: Request): UserProfile | undefined {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  return resolveMockToken(token);
}

export function bearerToken(request: Request): string | undefined {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || undefined;
}

// ---------------------------------------------------------------------------
// Session lifecycle (server side)
// ---------------------------------------------------------------------------

/** Absolute session cap, regardless of activity. */
export const MOCK_SESSION_MAX_MS = 12 * 60 * 60_000;

interface MockSession {
  lastSeenAt: number;
  rotations: number;
  currentToken: string;
  expiresAt: number;
  sessionExpiresAt: number;
  revoked: boolean;
}

/** Keyed by the login token; refreshed tokens are `<login token>~<n>`. */
const SESSIONS = new Map<string, MockSession>();

/** Login token behind any (possibly rotated) token. */
export const canonicalToken = (token: string): string => token.replace(/~\d+$/, '');

export type MockTokenState = 'unknown' | 'valid' | 'expired' | 'revoked';

export interface MockSessionTiming {
  /** ISO timestamps, as the real login / refresh / me responses return them. */
  expiresAt: string;
  sessionExpiresAt: string;
}

const timingOf = (s: MockSession): MockSessionTiming => ({
  expiresAt: new Date(s.expiresAt).toISOString(),
  sessionExpiresAt: new Date(s.sessionExpiresAt).toISOString(),
});

/** Start (or restart) the server session for a freshly issued login token. */
export function issueSession(token: string, now = Date.now()): MockSessionTiming {
  const session: MockSession = {
    lastSeenAt: now,
    rotations: 0,
    currentToken: token,
    expiresAt: now + env.VITE_MOCK_TOKEN_TTL_MS,
    sessionExpiresAt: now + MOCK_SESSION_MAX_MS,
    revoked: false,
  };
  SESSIONS.set(canonicalToken(token), session);
  return timingOf(session);
}

/** Login payload (`{ token, user, ... }`) plus the session timing the client schedules against. */
export function withSession<T extends { token: string }>(payload: T): T & MockSessionTiming {
  return { ...payload, ...issueSession(payload.token) };
}

/** Timing for a token's session, or `{}` when the server has no record (e.g. after a page reload). */
export function sessionTimingFor(token: string | undefined): Partial<MockSessionTiming> {
  const session = token ? SESSIONS.get(canonicalToken(token)) : undefined;
  return session && !session.revoked ? timingOf(session) : {};
}

export function tokenState(token: string, now = Date.now()): MockTokenState {
  const session = SESSIONS.get(canonicalToken(token));
  if (!session) return 'unknown';
  if (session.revoked) return 'revoked';
  return now >= session.expiresAt ? 'expired' : 'valid';
}

/** Record API activity — the server's idle clock. */
export function touchSession(token: string, now = Date.now()): void {
  const session = SESSIONS.get(canonicalToken(token));
  if (session && !session.revoked) session.lastSeenAt = now;
}

/**
 * Rotate the access token. Returns null when the session cannot be renewed: unknown/revoked,
 * past the absolute cap, or idle longer than `idleTimeoutMs` (the session is then revoked).
 */
export function refreshMockSession(
  token: string,
  idleTimeoutMs: number,
  now = Date.now(),
): ({ token: string } & MockSessionTiming) | null {
  const session = SESSIONS.get(canonicalToken(token));
  if (!session || session.revoked) return null;
  if (now >= session.sessionExpiresAt || now - session.lastSeenAt >= idleTimeoutMs) {
    session.revoked = true;
    return null;
  }
  const user = resolveMockToken(token) ?? resolveMockToken(session.currentToken);
  if (!user) return null;

  session.rotations += 1;
  const next = `${canonicalToken(token)}~${session.rotations}`;
  registerMockToken(next, user);
  session.currentToken = next;
  session.expiresAt = now + env.VITE_MOCK_TOKEN_TTL_MS;
  session.lastSeenAt = now;
  return { token: next, ...timingOf(session) };
}

export function revokeMockSession(token: string): void {
  const session = SESSIONS.get(canonicalToken(token));
  if (session) session.revoked = true;
}

/** Test hook. */
export function resetMockSessions(): void {
  SESSIONS.clear();
}
