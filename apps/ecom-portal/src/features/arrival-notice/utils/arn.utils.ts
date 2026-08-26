// Created by Sekar Nagarajan (2026-08-26 14:50)
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

export function extractArnErrorMessage(
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
