// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

interface BlLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function BlLoadingCenter({ fill = false }: BlLoadingCenterProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className={[
        "bl-loading-center",
        fill ? "bl-loading-center--fill" : undefined,
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
