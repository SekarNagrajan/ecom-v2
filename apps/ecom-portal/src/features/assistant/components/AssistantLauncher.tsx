// Modified by Sekar Nagarajan (2026-10-20 16:20)
import { AppButton } from "@solverminds/shared-ui";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAssistantStore } from "../store/assistant.store";

/** Header entry next to fullscreen — toggles the assistant drawer. */
export function AssistantLauncher() {
  const { t } = useTranslation("assistant");
  const open = useAssistantStore((s) => s.open);
  const setOpen = useAssistantStore((s) => s.setOpen);

  return (
    <Tooltip title={t("launcher.tooltip")}>
      <AppButton
        type="text"
        shape="circle"
        className={[
          "app-header-action",
          "assistant-launcher",
          open ? "assistant-launcher--active" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        icon={<AppIcon icon={Icons.wechatChat} size={16} />}
        onClick={() => setOpen(!open)}
        aria-label={t("launcher.tooltip")}
        aria-pressed={open}
        aria-haspopup="dialog"
        data-testid="assistant-launcher"
      />
    </Tooltip>
  );
}
