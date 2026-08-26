// Created by Sekar Nagarajan (2026-08-26 14:26)
import { Spin } from "antd";

interface DoLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function DoLoadingCenter({ fill = false }: DoLoadingCenterProps) {
  return (
    <div
      className={[
        "do-loading-center",
        fill ? "do-loading-center--fill" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label="Loading"
    >
      <Spin size="large" />
    </div>
  );
}
