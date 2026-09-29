// Created by Sekar Nagarajan (2026-08-26 14:26)
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

interface DoLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function DoLoadingCenter({ fill = false }: DoLoadingCenterProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className={[
        "do-loading-center",
        fill ? "do-loading-center--fill" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label={t("status.loading")}
    >
      <Spin size="medium" />
    </div>
  );
}
