// Modified by Sekar Nagarajan (2026-10-16 23:40)
/** `YYYY-MM-DD HH:mm` in local time — the display format the user-module screens expect. '' for non-dates. */
export function formatYmdHm(value: unknown): string {
  if (value == null || value === '') return '';
  const d = new Date(value as string);
  if (Number.isNaN(+d)) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `YYYY-MM-DD` (local) — for date-only DTO fields. */
export const formatYmd = (value: unknown) => formatYmdHm(value).slice(0, 10);
