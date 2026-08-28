// Created by Sekar Nagarajan (2026-08-28 10:32)

export function cargoFieldError(
  errors: Record<string, unknown>,
  path: string,
): string | undefined {
  const parts = path.split(".");
  let cur: unknown = errors;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur && typeof cur === "object" && "message" in cur) {
    return String((cur as { message?: unknown }).message ?? "");
  }
  return undefined;
}
