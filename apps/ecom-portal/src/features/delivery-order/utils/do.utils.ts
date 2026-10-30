// Modified by Sekar Nagarajan (2026-10-19 17:45)
export function parsePortLabel(value: string): { code: string; name: string } {
  const parts = value.split(" - ");
  if (parts.length < 2) {
    return { code: value, name: value };
  }
  return {
    code: parts[0]?.trim() || value,
    name: parts.slice(1).join(" - ").trim() || value,
  };
}

export function extractDoErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: { message?: string } }).error?.message ===
      "string"
  ) {
    return (error as { error: { message: string } }).error.message;
  }
  return fallback;
}

const DAY_MS = 86_400_000;
/** Days-left threshold (inclusive) at which a delivery order counts as expiring. */
const EXPIRING_WITHIN_DAYS = 3;

export type DoValidityState = "valid" | "expiring" | "expired" | "unknown";

export interface DoValidity {
  state: DoValidityState;
  /** Calendar days from today to the validity date; negative once expired. */
  daysLeft: number | null;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Classify the DO validity date against today, counting local calendar days. */
export function getDoValidity(
  validityDate?: string | null,
  now: Date = new Date(),
): DoValidity {
  const end = parseDate(validityDate);
  if (!end) return { state: "unknown", daysLeft: null };
  const daysLeft = Math.round(
    (startOfLocalDay(end) - startOfLocalDay(now)) / DAY_MS,
  );
  if (daysLeft < 0) return { state: "expired", daysLeft };
  if (daysLeft <= EXPIRING_WITHIN_DAYS) return { state: "expiring", daysLeft };
  return { state: "valid", daysLeft };
}

/** Share (0–100) of the window between `start` and `end` that has elapsed. */
export function validityProgressPercent(
  start?: string | null,
  end?: string | null,
  now: Date = new Date(),
): number {
  const endDate = parseDate(end);
  if (!endDate) return 0;
  if (now.getTime() >= endDate.getTime()) return 100;
  const startDate = parseDate(start);
  if (!startDate || startDate.getTime() >= endDate.getTime()) return 0;
  const ratio =
    (now.getTime() - startDate.getTime()) /
    (endDate.getTime() - startDate.getTime());
  return Math.round(Math.min(100, Math.max(0, ratio * 100)));
}

/** Online print is allowed once the B/L is released; legacy rows without the flag stay printable. */
export function canPrintDoOnline(row: { ecomprintstatus?: string | null }): boolean {
  return row.ecomprintstatus !== "0";
}
