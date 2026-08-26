// Created by Sekar Nagarajan (2026-08-26 16:30)
import { Spin } from "antd";

interface AdminLoadingCenterProps {
  /** Use taller viewport fill within the admin content pane. */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function AdminLoadingCenter({ fill = false }: AdminLoadingCenterProps) {
  return (
    <div
      className={[
        "admin-loading-center",
        fill ? "admin-loading-center--fill" : undefined,
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
