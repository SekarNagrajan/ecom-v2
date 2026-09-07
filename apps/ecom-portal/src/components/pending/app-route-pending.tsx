// Modified by Sekar Nagarajan (2026-09-07 17:24)
import type { ReactNode } from "react";

import { AppPendingFallback } from "./app-pending";

interface AppRoutePendingFallbackProps {
  message?: string;
}

function AppRoutePendingContainer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        minHeight: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function AppRoutePendingFallback({
  message = "Loading page...",
}: AppRoutePendingFallbackProps) {
  return (
    <AppRoutePendingContainer>
      <AppPendingFallback message={message} />
    </AppRoutePendingContainer>
  );
}
