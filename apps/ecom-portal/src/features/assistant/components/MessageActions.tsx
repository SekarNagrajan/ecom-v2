// Modified by Sekar Nagarajan (2026-10-20 15:23)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAssistantFeedbackMutation } from "../api/assistant.queries";
import { useAssistantStore } from "../store/assistant.store";
import type { ChatMessage } from "../types/assistant.types";

export function MessageActions({
  message,
  onRegenerate,
}: {
  message: ChatMessage;
  onRegenerate?: () => void;
}) {
  const { t, i18n } = useTranslation("assistant");
  const toast = useToast();
  const conversationId = useAssistantStore((s) => s.conversationId);
  const patchMessage = useAssistantStore((s) => s.patchMessage);
  const feedbackMutation = useAssistantFeedbackMutation();

  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(message.createdAt);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success(t("toasts.copied"));
    } catch {
      toast.error(t("errors.INTERNAL"));
    }
  }

  function rate(rating: "up" | "down") {
    if (!conversationId) return;
    patchMessage(message.id, (m) => ({ ...m, feedback: rating }));
    feedbackMutation.mutate({ conversation_id: conversationId, rating });
  }

  return (
    <div className="assistant-actions">
      <span className="assistant-actions__time">{time}</span>
      <Tooltip title={t("actions.copy")}>
        <AppButton
          type="text"
          size="small"
          shape="circle"
          icon={<AppIcon icon={Icons.copy} size={14} />}
          onClick={() => void copy()}
          aria-label={t("actions.copy")}
        />
      </Tooltip>
      <Tooltip title={t("actions.helpful")}>
        <AppButton
          type="text"
          size="small"
          shape="circle"
          className={message.feedback === "up" ? "assistant-actions__on" : undefined}
          icon={<AppIcon icon={Icons.thumbsUp} size={14} />}
          onClick={() => rate("up")}
          aria-label={t("actions.helpful")}
        />
      </Tooltip>
      <Tooltip title={t("actions.notHelpful")}>
        <AppButton
          type="text"
          size="small"
          shape="circle"
          className={
            message.feedback === "down" ? "assistant-actions__on" : undefined
          }
          icon={<AppIcon icon={Icons.thumbsDown} size={14} />}
          onClick={() => rate("down")}
          aria-label={t("actions.notHelpful")}
        />
      </Tooltip>
      {onRegenerate ? (
        <Tooltip title={t("actions.regenerate")}>
          <AppButton
            type="text"
            size="small"
            shape="circle"
            icon={<AppIcon icon={Icons.refreshCw} size={14} />}
            onClick={onRegenerate}
            aria-label={t("actions.regenerate")}
          />
        </Tooltip>
      ) : null}
    </div>
  );
}
