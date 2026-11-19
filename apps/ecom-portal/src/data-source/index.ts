// Created by Sekar Nagarajan (2026-11-12 23:50)
/**
 * Boundary between feature code and the mock fixture bridges.
 *
 * The bridges in `src/mocks/fixture-api/bridges/*` compute data from `mocks/fixture-api/db.ts`,
 * which eagerly loads ~9 MB of fixture JSON. Feature code must only reach them through
 * `loadBridge`, whose dynamic `import()` makes Rollup emit the bridge (and the fixtures behind it)
 * as a separate chunk fetched on first use, instead of inlining them into the entry bundle.
 *
 * Roadmap B1 adds the real-HTTP branch here (`source({ mock, real })`) so that in real mode the
 * bridge chunk is never requested at all.
 */
import { env } from "@solverminds/platform";

/** True when the portal runs against MSW + fixtures (`VITE_API_MODE=mock`). */
export const isMockMode = (): boolean => env.VITE_API_MODE === "mock";

/**
 * Load a fixture bridge lazily. Always call with an inline `() => import("…")` so the bundler can
 * see the module path and split it.
 */
export function loadBridge<T>(loader: () => Promise<T>): Promise<T> {
  return loader();
}
