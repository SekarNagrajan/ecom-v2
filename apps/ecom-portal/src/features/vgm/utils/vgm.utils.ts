// Created by Sekar Nagarajan (2026-08-26 12:48)
export function parsePortLabel(value: string) {
  const parts = value.split(" - ");
  if (parts.length < 2) {
    return { code: value, name: value };
  }
  return {
    code: parts[0]?.trim() || value,
    name: parts.slice(1).join(" - ").trim() || value,
  };
}

export function extractVgmErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;
  const record = error as {
    error?: { message?: string };
    message?: string;
  };
  return record.error?.message || record.message || fallback;
}
