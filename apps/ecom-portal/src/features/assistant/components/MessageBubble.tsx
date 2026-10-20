// Modified by Sekar Nagarajan (2026-10-20 18:10)
import { AppButton } from "@solverminds/shared-ui";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ChatMessage } from "../types/assistant.types";
import { AssistantStatusChip } from "./AssistantStatusChip";
import { ActionCard } from "./cards/ActionCard";
import { CitationChips } from "./cards/CitationChips";
import { MessageActions } from "./MessageActions";
import { MessageMarkdown } from "./MessageMarkdown";
import { ToolStatusRow } from "./ToolStatusRow";

function isWaitingForContent(m: ChatMessage): boolean {
  return (
    m.role === "assistant" &&
    (m.status === "streaming" || m.status === "complete") &&
    !m.text &&
    m.tools.length === 0 &&
    m.cards.length === 0 &&
    !m.error
  );
}

export function MessageBubble({
  message: m,
  onRetry,
  onRegenerate,
}: {
  message: ChatMessage;
  onRetry: () => void;
  onRegenerate?: () => void;
}) {
  const { t, i18n } = useTranslation("assistant");
  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(m.createdAt);

  if (m.role === "user") {
    return (
      <div className="assistant-row assistant-row--user">
        <div className="assistant-bubble-stack assistant-bubble-stack--user">
          <div className="assistant-bubble assistant-bubble--user">
            {m.text}
          </div>
          <span className="assistant-time">{time}</span>
        </div>
      </div>
    );
  }

  const isError = m.status === "error";

  // Empty streaming placeholder — show status chip instead of a blank bubble.
  if (isWaitingForContent(m) && m.status === "streaming") {
    return (
      <div className="assistant-row">
        <span className="assistant-avatar" aria-hidden>
          <AppIcon icon={Icons.wechatChat} size={15} />
        </span>
        <AssistantStatusChip />
      </div>
    );
  }

  return (
    <div className="assistant-row">
      <span className="assistant-avatar" aria-hidden>
        <AppIcon icon={Icons.wechatChat} size={15} />
      </span>
      <div
        className={[
          "assistant-bubble",
          "assistant-bubble--assistant",
          isError ? "assistant-bubble--error" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {m.tools.map((x) => (
          <ToolStatusRow key={x.callId} run={x} />
        ))}
        {m.text ? (
          <div className={m.status === "streaming" ? "assistant-caret" : undefined}>
            <MessageMarkdown text={m.text} />
          </div>
        ) : null}
        {m.cards.map((card) => (
          <ActionCard key={card.callId} card={card} />
        ))}
        {m.citations.length ? <CitationChips citations={m.citations} /> : null}
        {isError ? (
          <>
            <div>
              {t(`errors.${m.error?.code ?? "INTERNAL"}`, {
                defaultValue: t("errors.INTERNAL"),
              })}
            </div>
            {m.error?.retryable ? (
              <AppButton
                size="small"
                icon={<AppIcon icon={Icons.refreshCw} size={14} />}
                onClick={onRetry}
              >
                {t("actions.retry")}
              </AppButton>
            ) : null}
          </>
        ) : null}
        {m.status === "stopped" ? (
          <div className="assistant-bubble__stopped">{t("stopped")}</div>
        ) : null}
        {m.status === "complete" ? (
          <MessageActions message={m} onRegenerate={onRegenerate} />
        ) : null}
      </div>
    </div>
  );
}
