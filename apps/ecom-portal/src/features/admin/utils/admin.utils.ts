// Created by Sekar Nagarajan (2026-11-12 12:40)
/** Pure helpers shared by the Control Panel sections. */

/**
 * Await a mutation whose errors are already surfaced by its hook's onError toast, so callers
 * that only need the promise to settle (close a drawer, reset a form) don't get an unhandled
 * rejection.
 */
export async function settleMutation(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch {
    /* surfaced by the mutation's onError toast */
  }
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
