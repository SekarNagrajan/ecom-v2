// Created by Sekar Nagarajan (2026-10-16 22:31)
import { HttpResponse, delay } from 'msw';
import type { Row } from './db';

export { BOOKING_STATUS, SI_STATUS, VGM_STATUS, label } from './status-maps';

export const API = '/api';

/** Small realistic latency so loading states are visible in the demo. */
export const latency = () => delay(Math.floor(200 + Math.random() * 300));

export const lower = (v: unknown) => String(v ?? '').toLowerCase();

/** true when any of the row's listed fields contains the search term. */
export function matches(row: Row, fields: string[], q: string | null) {
  if (!q) return true;
  const needle = lower(q);
  return fields.some(f => lower(row[f]).includes(needle));
}

export function inDateRange(value: unknown, from: string | null, to: string | null) {
  if (!from && !to) return true;
  const t = +new Date(value as string);
  if (!Number.isFinite(t)) return false;
  if (from && t < +new Date(from)) return false;
  if (to && t > +new Date(to) + 86_399_000) return false; // inclusive end of day
  return true;
}

export const byDateDesc = (field: string) => (a: Row, b: Row) => +new Date(b[field]) - +new Date(a[field]);

/** Standard list envelope: { data, meta: { total, page, pageSize, totalPages } } */
export function paginate(items: Row[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? 25)));
  const start = (page - 1) * pageSize;
  return HttpResponse.json({
    data: items.slice(start, start + pageSize),
    meta: { total: items.length, page, pageSize, totalPages: Math.max(1, Math.ceil(items.length / pageSize)) },
  });
}

export const ok = (data: unknown, status = 200) => HttpResponse.json({ data }, { status });
export const notFound = (message = 'Not found') => HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
export const badRequest = (message: string) => HttpResponse.json({ error: { code: 'BAD_REQUEST', message } }, { status: 400 });
