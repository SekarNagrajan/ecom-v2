// Modified by Sekar Nagarajan (2026-11-11 15:25)
import type { SubUser } from "../types/user-creation.types";

export type UscStatusFilter =
  | "all"
  | "accepted"
  | "invited"
  | "for_approval"
  | "deactivated";

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

/** Matches a row to a status filter pill (exclusive buckets except `all`). */
export function matchesUscStatusFilter(
  user: SubUser,
  filter: UscStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "deactivated") return !user.isActive;
  if (!user.isActive) return false;
  if (filter === "invited") return user.inviteStatus === "PENDING";
  if (filter === "accepted") {
    return (
      user.inviteStatus === "ACCEPTED" || user.inviteStatus === "NONE"
    );
  }
  // for_approval — reserved; no fixture status yet
  return false;
}

export function filterSubUsersByStatus(
  rows: SubUser[],
  filter: UscStatusFilter,
): SubUser[] {
  if (filter === "all") return rows;
  return rows.filter((u) => matchesUscStatusFilter(u, filter));
}

export function countSubUsersByStatus(rows: SubUser[]): Record<UscStatusFilter, number> {
  return {
    all: rows.length,
    accepted: rows.filter((u) => matchesUscStatusFilter(u, "accepted")).length,
    invited: rows.filter((u) => matchesUscStatusFilter(u, "invited")).length,
    for_approval: rows.filter((u) => matchesUscStatusFilter(u, "for_approval"))
      .length,
    deactivated: rows.filter((u) => matchesUscStatusFilter(u, "deactivated"))
      .length,
  };
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
