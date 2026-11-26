// Created by Sekar Nagarajan (2026-11-12 12:20)
/**
 * Single HTTP helper for /api/v1/admin/*.
 *
 * The admin endpoints answer in three shapes — bare arrays for list GETs, `{ success, data }` for
 * writes and `{ data }` for the cut-off / module-mapping GETs — and some failures come back as
 * `200 { success: false, message }`. This helper normalises all of that: it throws an
 * `AdminApiError` for `!res.ok`, `success === false`, non-JSON bodies (the Vite SPA fallback returns
 * HTML for unhandled /api routes) and network failures, and unwraps the payload otherwise.
 */
import type { ZodType } from 'zod';

export class AdminApiError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code = 'ERROR', status?: number) {
    super(message);
    this.name = 'AdminApiError';
    this.code = code;
    this.status = status;
  }
}

interface AdminEnvelope {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
  data?: unknown;
}

export interface AdminRequestOptions<T> {
  /** Message used when the server gives none. */
  fallbackMessage: string;
  /** Optional boundary schema; failures only warn in DEV so backend drift never blanks a screen. */
  parse?: ZodType<T>;
}

/** Bare array → itself · `{ data }` → data · anything else → itself. */
export function unwrapAdminResponse<T>(json: unknown): T {
  if (Array.isArray(json)) return json as T;
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export function resolveAdminErrorMessage(json: unknown, fallback: string): string {
  const envelope = (json && typeof json === 'object' ? json : {}) as AdminEnvelope;
  return envelope.error?.message || envelope.message || fallback;
}

export async function adminRequest<T>(
  path: string,
  init: RequestInit = {},
  options: AdminRequestOptions<T>,
): Promise<T> {
  const { fallbackMessage, parse } = options;
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...((init.headers as Record<string, string> | undefined) ?? {}),
      },
    });
  } catch (error: unknown) {
    throw new AdminApiError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR',
    );
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new AdminApiError(
      `${fallbackMessage}: API returned non-JSON (check MSW handlers / mock worker).`,
      'INVALID_RESPONSE',
      res.status,
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new AdminApiError(
      `${fallbackMessage}: response could not be parsed as JSON.`,
      'INVALID_RESPONSE',
      res.status,
    );
  }

  const envelope = (json && typeof json === 'object' ? json : {}) as AdminEnvelope;
  if (!res.ok || envelope.success === false) {
    throw new AdminApiError(
      resolveAdminErrorMessage(json, fallbackMessage),
      envelope.error?.code ?? (res.ok ? 'ERROR' : `HTTP_${res.status}`),
      res.status,
    );
  }

  const result = unwrapAdminResponse<T>(json);
  if (parse) {
    const parsed = parse.safeParse(result);
    if (parsed.success) return parsed.data;
    if (import.meta.env.DEV) {
      console.warn(`[admin] ${path} did not match its schema`, parsed.error.issues);
    }
  }
  return result;
}
