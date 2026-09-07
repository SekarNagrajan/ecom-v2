// Modified by Sekar Nagarajan (2026-09-07 17:24)
/**
 * Production safety net for "Failed to fetch dynamically imported module"
 * after a deploy while a tab stays open. Debounced via sessionStorage to
 * avoid reload loops on real outages. Skipped in DEV (Vite HMR owns that).
 */
const RELOAD_FLAG_KEY = "ecom:chunk-reload-attempt-ts";
const RELOAD_DEBOUNCE_MS = 10_000;

function shouldAttemptReload(): boolean {
  try {
    const last = window.sessionStorage.getItem(RELOAD_FLAG_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > RELOAD_DEBOUNCE_MS;
  } catch {
    return true;
  }
}

function markReloadAttempt(): void {
  try {
    window.sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
  } catch {
    // non-fatal
  }
}

function reloadOncePerWindow(): void {
  if (!shouldAttemptReload()) return;
  markReloadAttempt();
  window.location.reload();
}

export function installPreloadErrorHandler(): void {
  if (import.meta.env.DEV) return;
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", () => {
    reloadOncePerWindow();
  });
}
