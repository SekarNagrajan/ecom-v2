// Created by Sekar Nagarajan (2026-10-16 22:31)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** dd-MMM-yyyy HH:mm, the format the hand-written list mocks use. '' when the value is not a date. */
export function formatListDate(value: unknown): string {
  if (value == null || value === '') return '';
  const d = new Date(value as string);
  if (Number.isNaN(+d)) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 8601 string or null, for DTOs whose dates the screens parse themselves. */
export function toIsoOrNull(value: unknown): string | null {
  if (value == null || value === '') return null;
  const d = new Date(value as string);
  return Number.isNaN(+d) ? null : d.toISOString();
}
