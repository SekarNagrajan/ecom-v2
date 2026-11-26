// Created by Sekar Nagarajan (2026-11-26 21:00)
// @vitest-environment jsdom
/**
 * The mock server side of the session lifecycle: token expiry → 401, rotating refresh, server-side
 * idle + absolute limits, logout revocation, and the timing returned by login / me.
 * Only `Date` is faked, so MSW's real latency/fetch machinery keeps working.
 */
import type { UserProfile } from '@solverminds/auth';
import { sessionConfig } from '@solverminds/platform';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { authAdminHandlers } from './auth-admin.handlers';
import { authSessionHandlers } from './auth-session.handlers';
import { MOCK_SESSION_MAX_MS, issueSession, registerMockToken, resetMockSessions } from './auth-token-registry';
import { authHandlers } from './auth.handlers';
import { resetDb } from './fixture-api/db';

const MIN = 60_000;
const TOKEN_TTL = 15 * MIN; // VITE_MOCK_TOKEN_TTL_MS default

const server = setupServer(...authSessionHandlers, ...authAdminHandlers, ...authHandlers);
const BASE = location.origin;

const user = {
  id: 'u1',
  name: 'T',
  email: 't@x.com',
  company: 'C',
  role: 'CUSTOMER',
  capabilities: [],
  loginType: 'U',
} as UserProfile;

const call = async (method: string, path: string, token?: string, body?: unknown) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? (JSON.parse(text) as Record<string, any>) : {} };
};
const me = (token: string) => call('GET', '/api/auth/me', token);
const refresh = (token: string) => call('POST', '/api/auth/refresh', token);
const jump = (ms: number) => vi.setSystemTime(Date.now() + ms);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-01-01T09:00:00Z'));
  resetDb();
  resetMockSessions();
  registerMockToken('tok', user);
  issueSession('tok');
});
afterEach(() => {
  vi.useRealTimers();
});

describe('mock session server', () => {
  it('serves a valid token and reports the session timing on /me', async () => {
    const res = await me('tok');
    expect(res.status).toBe(200);
    expect(Date.parse(res.body.data.expiresAt)).toBe(Date.now() + TOKEN_TTL);
    expect(Date.parse(res.body.data.sessionExpiresAt)).toBe(Date.now() + MOCK_SESSION_MAX_MS);
  });

  it('answers 401 TOKEN_EXPIRED once the access token has expired', async () => {
    jump(TOKEN_TTL + 1000);
    const res = await me('tok');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('refresh rotates the token and restarts its lifetime; the old token keeps working with it', async () => {
    jump(TOKEN_TTL + 1000);
    const res = await refresh('tok'); // an expired bearer is the refresh credential
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('tok~1');
    expect(Date.parse(res.body.data.expiresAt)).toBe(Date.now() + TOKEN_TTL);

    expect((await me('tok~1')).status).toBe(200);
    expect((await me('tok')).status).toBe(200); // two tabs refreshing at once cannot lock each other out
    const again = await refresh('tok~1');
    expect(again.body.data.token).toBe('tok~2');
  });

  it("refuses to refresh after the server's idle timeout (no API activity)", async () => {
    jump(sessionConfig.idleTimeoutMs + MIN);
    const res = await refresh('tok');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
    expect((await me('tok')).status).toBe(401); // revoked, not just expired
  });

  it('API activity keeps the session refreshable', async () => {
    jump(14 * MIN);
    expect((await me('tok')).status).toBe(200); // touches the idle clock
    jump(2 * MIN); // token now expired, but only 2 min idle
    expect((await refresh('tok')).status).toBe(200);
  });

  it('refuses to refresh past the absolute session cap even when active', async () => {
    // Stay active in <idle-timeout steps, refreshing as needed, until the cap passes.
    let token = 'tok';
    for (let elapsed = 0; elapsed < MOCK_SESSION_MAX_MS - 20 * MIN; elapsed += 14 * MIN) {
      jump(14 * MIN);
      const r = await refresh(token);
      expect(r.status).toBe(200);
      token = r.body.data.token;
    }
    jump(30 * MIN);
    const capped = await refresh(token);
    expect(capped.status).toBe(401);
    expect(capped.body.error.code).toBe('SESSION_EXPIRED');
  });

  it('logout revokes the session: 204, then both /me and refresh are rejected', async () => {
    expect((await call('POST', '/api/auth/logout', 'tok')).status).toBe(204);
    expect((await me('tok')).status).toBe(401);
    expect((await refresh('tok')).status).toBe(401);
  });

  it('does not interfere with guests or tokens the server has no session for', async () => {
    expect((await call('GET', '/api/auth/me')).status).toBe(401); // guest: the normal 'no token' answer
    registerMockToken('static-token', user); // e.g. a pre-reload demo token
    expect((await me('static-token')).status).toBe(200);
  });

  it('customer login returns the timing the client schedules against', async () => {
    const res = await call('POST', '/api/auth/login', undefined, { userName: 'test', password: 'test' });
    expect(res.status).toBe(200);
    expect(Date.parse(res.body.data.expiresAt)).toBeGreaterThan(Date.now());
    expect(Date.parse(res.body.data.sessionExpiresAt)).toBeGreaterThan(Date.parse(res.body.data.expiresAt));
    // …and that token expires like any other
    jump(TOKEN_TTL + 1000);
    expect((await me(res.body.data.token)).status).toBe(401);
  });
});
