// Modified by Sekar Nagarajan (2026-09-29 12:35)
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

interface ArnLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function ArnLoadingCenter({ fill = false }: ArnLoadingCenterProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className={[
        "arn-loading-center",
        fill ? "arn-loading-center--fill" : undefined,
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
