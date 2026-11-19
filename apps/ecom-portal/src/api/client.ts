// Created by Sekar Nagarajan (2026-10-16 22:31)
/**
 * Typed client for the fixture-api REST contract.
 *
 * In mock mode the routes are served by src/mocks/fixture-api (MSW) from the SQL-extracted fixtures;
 * in real mode the same paths are requested from VITE_API_URL, so nothing here changes when the
 * backend exposes the contract. Feature modules keep their own <feature>.api.ts; reach for this
 * client on screens that read the extracted sample directly (see mock-data/README.md).
 */
import { env } from '@solverminds/platform';

const BASE = env.VITE_API_MODE === 'mock' ? '/api' : env.VITE_API_URL.replace(/\/$/, '');
const TOKEN_KEY = 'ecom_auth_token'; // same key the platform apiClient reads

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** A row as the fixture handlers return it: the EJB column names, no client-side renaming. */
export type FixtureRow = Record<string, unknown>;
type Query = Record<string, string | number | boolean | null | undefined>;

export interface ListResponse<T = FixtureRow> { data: T[]; meta: { total: number; page: number; pageSize: number; totalPages: number } }
export interface ItemResponse<T = FixtureRow> { data: T }

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  let token: string | null = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
  if (!res.ok) throw new ApiError(res.status, json.error?.code ?? 'ERROR', json.error?.message ?? res.statusText);
  return json as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

const enc = encodeURIComponent;

// Type aliases (not interfaces) so they satisfy the Query index signature.
export type ListQuery = { custCode?: string; status?: string; q?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number };
export type DateRangeQuery = { fromDate?: string; toDate?: string };

export const fixtureApi = {
  bookings: {
    list: (q: ListQuery = {}) => api.get<ListResponse>('/bookings', q),
    get: (ebookno: string) => api.get<ItemResponse>(`/bookings/${enc(ebookno)}`),
    create: (payload: FixtureRow) => api.post<ItemResponse>('/bookings', payload),
    update: (ebookno: string, payload: FixtureRow) => api.put<ItemResponse>(`/bookings/${enc(ebookno)}`, payload),
    cancel: (ebookno: string, reason?: string, remarks?: string) => api.post<ItemResponse>(`/bookings/${enc(ebookno)}/cancel`, { reason, remarks }),
    templates: (custCode?: string) => api.get<ItemResponse<FixtureRow[]>>('/bookings/templates', { custCode }),
    deleteTemplate: (ebookno: string) => api.delete<ItemResponse>(`/bookings/${enc(ebookno)}`),
  },
  shippingInstructions: {
    list: (q: ListQuery = {}) => api.get<ListResponse>('/shipping-instructions', q),
    prefill: (bookNo: string) => api.get<ItemResponse>(`/shipping-instructions/prefill/${enc(bookNo)}`),
    get: (eSINo: string) => api.get<ItemResponse>(`/shipping-instructions/${enc(eSINo)}`),
    create: (payload: FixtureRow) => api.post<ItemResponse>('/shipping-instructions', payload),
    update: (eSINo: string, payload: FixtureRow) => api.put<ItemResponse>(`/shipping-instructions/${enc(eSINo)}`, payload),
    cancel: (eSINo: string) => api.post<ItemResponse>(`/shipping-instructions/${enc(eSINo)}/cancel`),
  },
  billsOfLading: {
    list: (q: ListQuery = {}) => api.get<ListResponse>('/bills-of-lading', q),
    get: (blno: string) => api.get<ItemResponse>(`/bills-of-lading/${enc(blno)}`),
    amend: (blno: string, payload: FixtureRow = {}) => api.post<ItemResponse>(`/bills-of-lading/${enc(blno)}/amend`, payload),
    accept: (blno: string) => api.post<ItemResponse>(`/bills-of-lading/${enc(blno)}/accept`),
  },
  vgm: {
    get: (ref: { bookNo?: string; blNo?: string }) => api.get<ItemResponse>('/vgm', ref),
    submit: (payload: FixtureRow) => api.post<ItemResponse<FixtureRow[]>>('/vgm', payload),
  },
  schedules: {
    portPair: (pol: string, pod: string, range: DateRangeQuery = {}) => api.get<ItemResponse<FixtureRow[]>>('/schedules/port-pair', { pol, pod, ...range }),
    byPort: (port: string, range: DateRangeQuery = {}) => api.get<ItemResponse<FixtureRow[]>>('/schedules/by-port', { port, ...range }),
    byVessel: (vessel: string, range: DateRangeQuery = {}) => api.get<ItemResponse<FixtureRow[]>>('/schedules/by-vessel', { vessel, ...range }),
  },
  masters: {
    lookup: (name: string, q?: string, limit = 50) => api.get<ItemResponse<FixtureRow[]>>(`/masters/${enc(name)}`, { q, limit }),
    states: (country?: string, q?: string) => api.get<ItemResponse<FixtureRow[]>>('/masters/states', { country, q }),
    port: (portcode: string) => api.get<ItemResponse>(`/masters/ports/${enc(portcode)}`),
    config: () => api.get<ItemResponse>('/config'),
  },
  dashboard: (custCode?: string) => api.get<ItemResponse>('/dashboard', { custCode }),
  payments: {
    list: (q: ListQuery = {}) => api.get<ListResponse>('/payments', q),
    get: (requestId: string) => api.get<ItemResponse>(`/payments/${enc(requestId)}`),
    create: (payload: FixtureRow) => api.post<ItemResponse>('/payments', payload),
  },
  portal: {
    demoUsers: () => api.get<ItemResponse<FixtureRow[]>>('/auth/demo-users'),
    demoProfile: (login: string) => api.get<ItemResponse>(`/auth/demo-users/${enc(login)}`),
    menus: () => api.get<ItemResponse<FixtureRow[]>>('/menus'),
    notifications: (custCode?: string) => api.get<ItemResponse<FixtureRow[]>>('/notifications', { custCode }),
    markNotificationRead: (msgid: string | number) => api.post<ItemResponse>(`/notifications/${enc(String(msgid))}/read`),
    advisories: () => api.get<ItemResponse<FixtureRow[]>>('/advisories'),
    notices: (year?: string) => api.get<ItemResponse<FixtureRow[]>>('/notices', { year }),
    message: (module: string, criteria: string) => api.get<ItemResponse>(`/messages/${enc(module)}/${enc(criteria)}`),
  },
  /** Demo controls (mock mode only). */
  control: {
    reset: () => api.post<ItemResponse<{ reset: boolean }>>('/_mock/reset'),
    status: () => api.get<ItemResponse<Record<string, number>>>('/_mock/status'),
  },
};
