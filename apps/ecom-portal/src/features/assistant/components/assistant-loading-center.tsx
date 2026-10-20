// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

export function AssistantLoadingCenter() {
  const { t } = useTranslation("assistant");
  return (
    <div
      className="assistant-loading-center"
      role="status"
      aria-label={t("a11y.loading")}
    >
      <Spin size="default" />
    </div>
  );
}
