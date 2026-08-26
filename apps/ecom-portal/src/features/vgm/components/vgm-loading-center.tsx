// Created by Sekar Nagarajan (2026-08-26 12:48)
import { Spin } from "antd";

interface VgmLoadingCenterProps {
  fill?: boolean;
}

/** Centered spinner-only loading state (agenct.md #20). */
export function VgmLoadingCenter({ fill = false }: VgmLoadingCenterProps) {
  return (
    <div
      className={[
        "vgm-loading-center",
        fill ? "vgm-loading-center--fill" : undefined,
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
