// Modified by Sekar Nagarajan (2026-09-29 16:45)
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

interface SiLoadingCenterProps {
  /** Use taller viewport fill (full-page routes). */
  fill?: boolean;
}

/** Centered spinner-only loading state (no tip text). */
export function SiLoadingCenter({ fill = false }: SiLoadingCenterProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  return (
    <div
      className={[
        "si-loading-center",
        fill ? "si-loading-center--fill" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label={t("a11y.loading")}
    >
      <Spin size="medium" />
    </div>
  );
}
