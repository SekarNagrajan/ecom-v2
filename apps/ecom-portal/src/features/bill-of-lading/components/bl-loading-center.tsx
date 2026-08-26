// Created by Sekar Nagarajan (2026-08-26 13:04)
import { Spin } from "antd";

interface BlLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function BlLoadingCenter({ fill = false }: BlLoadingCenterProps) {
  return (
    <div
      className={[
        "bl-loading-center",
        fill ? "bl-loading-center--fill" : undefined,
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
