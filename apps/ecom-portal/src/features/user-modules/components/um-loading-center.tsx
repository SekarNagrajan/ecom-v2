// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { Spin } from "antd";

interface UmLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function UmLoadingCenter({ fill = false }: UmLoadingCenterProps) {
  return (
    <div
      className={[
        "um-loading-center",
        fill ? "um-loading-center--fill" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label="Loading"
    >
      <Spin size="medium" />
    </div>
  );
}
