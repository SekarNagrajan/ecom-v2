// Created by Sekar Nagarajan (2026-11-26 20:30)
import { sessionConfig } from '@solverminds/platform';
import { http, HttpResponse } from 'msw';
import { bearerToken, refreshMockSession, revokeMockSession, tokenState, touchSession } from './auth-token-registry';

/**
 * Mock server side of the session lifecycle (see auth-token-registry.ts):
 * - a guard in front of every /api route that answers 401 TOKEN_EXPIRED for an expired/revoked
 *   bearer token (this is what drives the client's silent refresh + replay) and otherwise records
 *   activity for the idle clock;
 * - POST /api/auth/refresh and POST /api/auth/logout.
 * Must be registered FIRST in handlers.ts so the guard sees requests before the feature handlers.
 */

/** Auth endpoints that must work without a currently-valid access token. */
const GUARD_EXEMPT = /^\/api\/auth\/(login|admin-login|refresh|logout|activate|forgot-password)$/;

const unauthorized = (code: 'TOKEN_EXPIRED' | 'SESSION_EXPIRED', message: string) =>
  HttpResponse.json({ status: 'ERROR', message, error: { code, message } }, { status: 401 });

export const authSessionHandlers = [
  http.all('/api/*', ({ request }) => {
    const { pathname } = new URL(request.url);
    if (GUARD_EXEMPT.test(pathname)) return undefined;
    const token = bearerToken(request);
    if (!token) return undefined;

    const state = tokenState(token);
    if (state === 'expired' || state === 'revoked') {
      return unauthorized('TOKEN_EXPIRED', 'Access token expired. Refresh the session or sign in again.');
    }
    touchSession(token);
    return undefined; // fall through to the feature handlers
  }),

  // POST /api/auth/refresh — rotate the access token while the session is within its idle + absolute
  // limits. The real endpoint reads an HttpOnly cookie; the mock identifies the session by the last bearer.
  http.post('/api/auth/refresh', ({ request }) => {
    const token = bearerToken(request);
    const refreshed = token ? refreshMockSession(token, sessionConfig.idleTimeoutMs) : null;
    if (!refreshed) return unauthorized('SESSION_EXPIRED', 'Session expired. Please sign in again.');
    return HttpResponse.json({
      data: {
        token: refreshed.token,
        expiresAt: refreshed.expiresAt,
        sessionExpiresAt: refreshed.sessionExpiresAt,
      },
    });
  }),

  // POST /api/auth/logout — revoke the session server-side
  http.post('/api/auth/logout', ({ request }) => {
    const token = bearerToken(request);
    if (token) revokeMockSession(token);
    return new HttpResponse(null, { status: 204 });
  }),
];
