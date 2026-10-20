// Modified by Sekar Nagarajan (2026-10-20 18:07)
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ToolRunState } from "../types/assistant.types";

export function ToolStatusRow({ run }: { run: ToolRunState }) {
  const { t } = useTranslation("assistant");
  const label = t(`tools.${run.tool}.${run.status}`, {
    defaultValue:
      run.status === "running"
        ? t("lookingUp")
        : run.status === "done"
          ? t("lookingUpDone")
          : t("errors.TOOL_FAILED"),
  });

  const isRunning = run.status === "running";
  const isFailed = run.status === "failed";

  return (
    <div
      className={[
        "assistant-tool-row",
        isRunning ? "assistant-tool-row--running" : undefined,
        isFailed ? "assistant-tool-row--failed" : undefined,
        run.status === "done" ? "assistant-tool-row--done" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {isRunning ? (
        <span className="assistant-tool-row__spinner" aria-hidden />
      ) : (
        <AppIcon
          icon={run.status === "done" ? Icons.check : Icons.alert}
          size={14}
        />
      )}
      <span className="assistant-tool-row__label">{label}</span>
      {isRunning ? (
        <span className="assistant-tool-row__track" aria-hidden>
          <span className="assistant-tool-row__bar" />
        </span>
      ) : null}
    </div>
  );
}
