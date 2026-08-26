// Created by Sekar Nagarajan (2026-08-26 12:38)
import { Spin } from "antd";

interface SiLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function SiLoadingCenter({ fill = false }: SiLoadingCenterProps) {
  return (
    <div
      className={[
        "si-loading-center",
        fill ? "si-loading-center--fill" : undefined,
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
