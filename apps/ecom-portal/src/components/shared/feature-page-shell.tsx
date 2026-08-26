// Modified by Sekar Nagarajan (2026-08-24 17:15)
import type { ReactNode } from 'react';

interface FeaturePageShellProps {
  children: ReactNode;
}

/** Standard responsive wrapper for authenticated feature routes. */
export function FeaturePageShell({ children }: FeaturePageShellProps) {
  return <div className="feature-page-shell">{children}</div>;
}
