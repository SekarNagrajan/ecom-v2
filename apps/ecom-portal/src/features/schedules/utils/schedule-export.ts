/**
 * Client-side CSV export for schedule search results (demo/mock parity with Share).
 */
import type { ScheduleItem } from '../types/schedules.types';

const CSV_HEADERS = [
  'Service Code',
  'Service Name',
  'Vessel',
  'Voyage',
  'Bound',
  'POL',
  'POL Name',
  'POL Terminal',
  'POD',
  'POD Name',
  'POD Terminal',
  'ETD',
  'ETA',
  'Transit Days',
  'Direct',
  'Transshipments',
  'Distance Km',
  'Booking Allowed',
] as const;

function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/** Build a CSV string from the current sailing list. */
export function buildSchedulesCsv(items: ScheduleItem[]): string {
  const rows = items.map((s) =>
    [
      s.serviceCode,
      s.serviceName,
      s.vesselName,
      s.voyage,
      s.bound,
      s.polPortId,
      s.polPortName,
      s.polTerminal,
      s.podPortId,
      s.podPortName,
      s.podTerminal,
      s.etd,
      s.eta,
      s.transitTimeDays,
      s.isDirect ? 'Y' : 'N',
      s.transshipmentCount,
      s.distanceKm,
      s.bookingAllowed ? 'Y' : 'N',
    ]
      .map(csvCell)
      .join(','),
  );
  return [`\uFEFF${CSV_HEADERS.join(',')}`, ...rows].join('\r\n');
}

/** Trigger a browser download of the schedule results as CSV. */
export function downloadSchedulesCsv(items: ScheduleItem[], filename?: string): void {
  const blob = new Blob([buildSchedulesCsv(items)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename ?? `schedules-${stamp}.csv`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
