// Created by Sekar Nagarajan (2026-11-26 18:30)
/**
 * Same-origin tab-to-tab messaging for session state. Prefers `BroadcastChannel`; falls back to
 * `localStorage` + the `storage` event (fires only in OTHER tabs, never the writer) for older
 * browsers. Neither path ever carries the access token — tabs read it from localStorage.
 */
import type { LogoutReason } from "../auth.store";

export type SessionMessage =
  | { type: "LOGOUT"; reason: LogoutReason }
  | { type: "TOKEN_REFRESHED"; expiresAt: number | null }
  | { type: "ACTIVITY"; at: number }
  | { type: "EXTENDED"; at: number };

export interface SessionTransport {
  post: (message: SessionMessage) => void;
  /** Returns an unsubscribe function. Own posts are never delivered back. */
  onMessage: (handler: (message: SessionMessage) => void) => () => void;
  close: () => void;
}

const CHANNEL_NAME = "ecom-session";
const STORAGE_KEY = "ecom_session_sync";
const REASONS: ReadonlySet<string> = new Set(["manual", "session-expired", "idle", "other-tab"]);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Validate untrusted input (any same-origin script/tab can post here). */
export function parseSessionMessage(value: unknown): SessionMessage | null {
  if (!value || typeof value !== "object") return null;
  const m = value as Record<string, unknown>;
  switch (m.type) {
    case "LOGOUT":
      return typeof m.reason === "string" && REASONS.has(m.reason)
        ? { type: "LOGOUT", reason: m.reason as LogoutReason }
        : null;
    case "TOKEN_REFRESHED": {
      const expiresAt = m.expiresAt;
      if (expiresAt === null) return { type: "TOKEN_REFRESHED", expiresAt: null };
      return isFiniteNumber(expiresAt) ? { type: "TOKEN_REFRESHED", expiresAt } : null;
    }
    case "ACTIVITY": {
      const at = m.at;
      return isFiniteNumber(at) ? { type: "ACTIVITY", at } : null;
    }
    case "EXTENDED": {
      const at = m.at;
      return isFiniteNumber(at) ? { type: "EXTENDED", at } : null;
    }
    default:
      return null;
  }
}

function createBroadcastTransport(): SessionTransport {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  return {
    post: (message) => channel.postMessage(message),
    onMessage: (handler) => {
      const listener = (event: MessageEvent<unknown>) => {
        const message = parseSessionMessage(event.data);
        if (message) handler(message);
      };
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
    close: () => channel.close(),
  };
}

export function createStorageTransport(): SessionTransport {
  return {
    post: (message) => {
      try {
        // Unique payload each time, otherwise an identical value would not fire a `storage` event.
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ n: Math.random(), message }));
      } catch {
        /* storage unavailable — this tab simply won't sync */
      }
    },
    onMessage: (handler) => {
      const listener = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY || !event.newValue) return;
        try {
          const parsed: unknown = JSON.parse(event.newValue);
          const message = parseSessionMessage(
            parsed && typeof parsed === "object" ? (parsed as { message?: unknown }).message : null,
          );
          if (message) handler(message);
        } catch {
          /* malformed payload */
        }
      };
      window.addEventListener("storage", listener);
      return () => window.removeEventListener("storage", listener);
    },
    close: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* nothing to clean */
      }
    },
  };
}

export function createDefaultTransport(): SessionTransport {
  return typeof BroadcastChannel !== "undefined"
    ? createBroadcastTransport()
    : createStorageTransport();
}
