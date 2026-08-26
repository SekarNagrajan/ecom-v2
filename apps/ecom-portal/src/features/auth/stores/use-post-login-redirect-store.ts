// Modified by Sekar Nagarajan (2026-08-25 16:55)
import { create } from "zustand";

/**
 * Client UI store: remember which module the guest selected so login can resume there.
 * Parity enhancement over JSP (which lands on dashboard/booking only).
 */
interface PostLoginRedirectState {
  intendedPath: string | null;
  setIntendedPath: (path: string | null) => void;
  /** Read and clear the pending path in one step. */
  consumeIntendedPath: () => string | null;
  clearIntendedPath: () => void;
}

export const usePostLoginRedirectStore = create<PostLoginRedirectState>(
  (set, get) => ({
    intendedPath: null,
    setIntendedPath: (path) => set({ intendedPath: path }),
    consumeIntendedPath: () => {
      const path = get().intendedPath;
      set({ intendedPath: null });
      return path;
    },
    clearIntendedPath: () => set({ intendedPath: null }),
  })
);
