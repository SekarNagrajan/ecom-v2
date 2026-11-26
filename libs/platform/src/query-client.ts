// Modified by Sekar Nagarajan (2026-11-26 17:10)
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { notifySessionExpired } from "./session/auth-recovery";
import { getStoredToken } from "./session/token-storage";

/** Duck-typed 401 check covering axios errors and the portal's fetch `ApiError`. */
function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: unknown; response?: { status?: unknown } };
  return e.status === 401 || e.response?.status === 401;
}

// Safety net: a 401 that still reaches a query/mutation after the clients' own refresh+retry
// means the session is gone. Debounced inside notifySessionExpired.
const onGlobalError = (error: unknown) => {
  if (isUnauthorizedError(error) && getStoredToken()) notifySessionExpired();
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onGlobalError }),
  mutationCache: new MutationCache({ onError: onGlobalError }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh time
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
