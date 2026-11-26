// Created by Sekar Nagarajan (2026-11-26 17:55)
import { useSyncExternalStore } from "react";

import { sessionManager, type SessionSnapshot } from "./session-manager";

/** Reactive view of the session lifecycle (state + the deadline to count down to). */
export function useSessionStatus(): SessionSnapshot {
  return useSyncExternalStore(
    sessionManager.subscribe,
    sessionManager.getSnapshot,
    sessionManager.getSnapshot,
  );
}
