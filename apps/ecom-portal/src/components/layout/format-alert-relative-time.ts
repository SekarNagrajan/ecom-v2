// Created by Sekar Nagarajan (2026-11-16 14:30) — notification relative timestamps (2b)
import dayjs, { type Dayjs } from "dayjs";

/**
 * Spec §6.4 relative time for the bell popover.
 * Uses the caller's "now" (already zoned if needed).
 */
export function formatAlertRelativeTime(
  iso: string | undefined,
  now: Dayjs = dayjs(),
  options?: { datePattern?: string; timePattern?: string },
): string {
  if (!iso) return "";
  const then = dayjs(iso);
  if (!then.isValid()) return "";

  const datePattern = options?.datePattern ?? "D MMM";
  const timePattern = options?.timePattern ?? "HH:mm";
  const minutes = Math.max(0, now.diff(then, "minute"));

  if (minutes < 60) {
    const m = Math.max(1, minutes);
    return `${m}m ago`;
  }

  if (then.isSame(now, "day")) {
    const hours = Math.max(1, now.diff(then, "hour"));
    return `${hours}h ago`;
  }

  if (then.isSame(now.subtract(1, "day"), "day")) {
    return `Yesterday, ${then.format(timePattern)}`;
  }

  return `${then.format(datePattern)}, ${then.format(timePattern)}`;
}
