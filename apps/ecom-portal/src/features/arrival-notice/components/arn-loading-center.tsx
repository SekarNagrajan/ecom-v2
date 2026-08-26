// Created by Sekar Nagarajan (2026-08-26 14:50)
import { Spin } from "antd";

interface ArnLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function ArnLoadingCenter({ fill = false }: ArnLoadingCenterProps) {
  return (
    <div
      className={[
        "arn-loading-center",
        fill ? "arn-loading-center--fill" : undefined,
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
