// Created by Sekar Nagarajan (2026-11-26 20:50)
import type { SessionMeta } from "@solverminds/auth";

import type { SessionTiming } from "../types/auth.types";

/** Pull the server-provided session timing out of a login / me response for `useAuthStore.login`. */
export function sessionMetaOf(response: SessionTiming): SessionMeta {
  return { expiresAt: response.expiresAt, sessionExpiresAt: response.sessionExpiresAt };
}
