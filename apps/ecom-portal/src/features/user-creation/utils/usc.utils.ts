// Created by Sekar Nagarajan (2026-08-26 15:06)
import type { SubUser } from "../types/user-creation.types";

export function filterSubUsers(rows: SubUser[], searchTerm: string): SubUser[] {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (u) =>
      u.loginName.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
  );
}

export function extractUscErrorMessage(
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

export function getSubUserFullName(user: SubUser): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
