// Created by Sekar Nagarajan (2026-08-26 15:06)
import { Spin } from "antd";

interface UscLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function UscLoadingCenter({ fill = false }: UscLoadingCenterProps) {
  return (
    <div
      className={[
        "usc-loading-center",
        fill ? "usc-loading-center--fill" : undefined,
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
