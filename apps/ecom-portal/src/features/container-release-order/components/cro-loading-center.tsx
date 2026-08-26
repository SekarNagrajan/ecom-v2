// Created by Sekar Nagarajan (2026-08-26 14:57)
import { Spin } from "antd";

interface CroLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function CroLoadingCenter({ fill = false }: CroLoadingCenterProps) {
  return (
    <div
      className={[
        "cro-loading-center",
        fill ? "cro-loading-center--fill" : undefined,
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
