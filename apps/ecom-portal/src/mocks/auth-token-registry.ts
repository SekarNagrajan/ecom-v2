// Created by Sekar Nagarajan (2026-10-16 23:35)
import type { UserProfile } from "@solverminds/auth";

/**
 * Session-only token → user registry shared by the mock auth handlers.
 * Every mock login registers its token here; GET /api/auth/me resolves the bearer token from it.
 * (Moved out of auth-admin.mock-data.ts, whose hand-written users were replaced by the fixtures.)
 */
const TOKEN_USER_MAP = new Map<string, UserProfile>();

export function registerMockToken(token: string, user: UserProfile): void {
  TOKEN_USER_MAP.set(token, user);
}

export function resolveMockToken(token: string | null | undefined): UserProfile | undefined {
  return token ? TOKEN_USER_MAP.get(token) : undefined;
}

/** User registered for the request's `Authorization: Bearer <token>` header, if any. */
export function bearerUser(request: Request): UserProfile | undefined {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return resolveMockToken(token);
}

export function bearerToken(request: Request): string | undefined {
  return request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || undefined;
}
