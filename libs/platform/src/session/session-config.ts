// Created by Sekar Nagarajan (2026-11-26 16:35)
import { env } from "../env";

/** Session timing. Defaults mirror legacy Struts: 30 min idle, warning at 25 min. */
export interface SessionConfig {
  /** Inactivity window after which the session ends. */
  idleTimeoutMs: number;
  /** How long before the idle deadline the "about to expire" warning appears. */
  warnBeforeMs: number;
  /** Silent-refresh the access token this long before it expires. */
  refreshLeadMs: number;
}

export const sessionConfig: SessionConfig = {
  idleTimeoutMs: env.VITE_SESSION_IDLE_MS,
  // Never let the warning window exceed the idle window.
  warnBeforeMs: Math.min(env.VITE_SESSION_WARN_MS, env.VITE_SESSION_IDLE_MS),
  refreshLeadMs: 60_000,
};
