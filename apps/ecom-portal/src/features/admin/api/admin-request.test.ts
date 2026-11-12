// Created by Sekar Nagarajan (2026-11-12 12:20)
/**
 * adminRequest normalises the three /api/v1/admin response shapes and turns every failure mode
 * (HTTP error, `{ success: false }`, non-JSON body, network error) into an AdminApiError.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { AdminApiError, adminRequest, unwrapAdminResponse } from './admin-request';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const mockFetch = (response: Response | Error) => {
  const fn = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)));
  vi.stubGlobal('fetch', fn);
  return fn;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('unwrapAdminResponse', () => {
  it('returns bare arrays as-is (list GETs)', () => {
    expect(unwrapAdminResponse([{ id: '1' }])).toEqual([{ id: '1' }]);
  });
  it('unwraps { success, data } and { data } envelopes (writes, cutoff / mapping GETs)', () => {
    expect(unwrapAdminResponse({ success: true, data: { id: '2' } })).toEqual({ id: '2' });
    expect(unwrapAdminResponse({ data: [1, 2] })).toEqual([1, 2]);
  });
  it('returns bare objects as-is (global-config GET, password-reset result)', () => {
    expect(unwrapAdminResponse({ enableLoginCaptcha: true })).toEqual({ enableLoginCaptcha: true });
  });
});

describe('adminRequest', () => {
  it('sends JSON headers and unwraps the payload', async () => {
    const fetchMock = mockFetch(jsonResponse({ success: true, data: [{ id: 'a' }] }));
    const result = await adminRequest<{ id: string }[]>('/api/v1/admin/banners', { method: 'POST', body: '{}' }, { fallbackMessage: 'Failed' });
    expect(result).toEqual([{ id: 'a' }]);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.method).toBe('POST');
  });

  it('throws the server message for a 404 { success: false, message } (password reset)', async () => {
    mockFetch(jsonResponse({ success: false, message: 'No user found for ghost.' }, { status: 404 }));
    const error = await adminRequest('/api/v1/admin/password-reset', { method: 'POST' }, { fallbackMessage: 'Failed to reset password' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).message).toBe('No user found for ghost.');
    expect((error as AdminApiError).status).toBe(404);
  });

  it('throws even when the status is 200 but success is false', async () => {
    mockFetch(jsonResponse({ success: false, message: 'Nope' }));
    await expect(adminRequest('/x', undefined, { fallbackMessage: 'Failed' })).rejects.toMatchObject({ message: 'Nope', code: 'ERROR' });
  });

  it('prefers error.message / error.code envelopes (cutoff 409)', async () => {
    mockFetch(jsonResponse({ error: { code: 'DUPLICATE', message: 'Duplicate port and terminal' } }, { status: 409 }));
    await expect(adminRequest('/x', undefined, { fallbackMessage: 'Failed' })).rejects.toMatchObject({ code: 'DUPLICATE', message: 'Duplicate port and terminal', status: 409 });
  });

  it('falls back to the caller message when the body has none', async () => {
    mockFetch(jsonResponse({}, { status: 500 }));
    await expect(adminRequest('/x', undefined, { fallbackMessage: 'Failed to load' })).rejects.toMatchObject({ message: 'Failed to load', code: 'HTTP_500' });
  });

  it('rejects non-JSON bodies such as the Vite SPA HTML fallback', async () => {
    mockFetch(new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } }));
    await expect(adminRequest('/x', undefined, { fallbackMessage: 'Failed to load' })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('maps fetch failures to NETWORK_ERROR', async () => {
    mockFetch(new TypeError('Failed to fetch'));
    await expect(adminRequest('/x', undefined, { fallbackMessage: 'Failed' })).rejects.toMatchObject({ code: 'NETWORK_ERROR', message: 'Failed to fetch' });
  });

  it('returns undefined for 204 No Content', async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(adminRequest('/x', { method: 'DELETE' }, { fallbackMessage: 'Failed' })).resolves.toBeUndefined();
  });

  it('applies an optional boundary schema but never blanks the result on drift', async () => {
    mockFetch(jsonResponse({ data: { attemptLimit: 'five' } }));
    const schema = z.object({ attemptLimit: z.number() });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await adminRequest('/x', undefined, { fallbackMessage: 'Failed', parse: schema });
    expect(result).toEqual({ attemptLimit: 'five' });
    warn.mockRestore();
  });
});
