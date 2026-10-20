// Modified by Sekar Nagarajan (2026-10-20 18:10)
import { AppButton } from "@solverminds/shared-ui";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ensureBlocks } from "../store/assistant.store";
import type { ChatMessage } from "../types/assistant.types";
import { AssistantStatusChip } from "./AssistantStatusChip";
import { ActionCard } from "./cards/ActionCard";
import { CitationChips } from "./cards/CitationChips";
import { MessageActions } from "./MessageActions";
import { MessageMarkdown } from "./MessageMarkdown";
import { ToolStatusGroup } from "./ToolStatusGroup";
import { ToolStatusRow } from "./ToolStatusRow";

function isWaitingForContent(m: ChatMessage): boolean {
  return (
    m.role === "assistant" &&
    (m.status === "streaming" || m.status === "complete") &&
    ensureBlocks(m).length === 0 &&
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

  const blocks = ensureBlocks(m);
  // Caret belongs to the last text block only, while that block is streaming.
  const lastTextBlockId = [...blocks]
    .reverse()
    .find((b) => b.type === "text")?.id;

  // Once the message is no longer streaming, collapse all successful tool rows
  // into a single expandable summary (rendered at the first such block); failed
  // and still-running rows keep rendering individually.
  const isStreaming = m.status === "streaming";
  const successfulRuns = m.tools.filter((r) => r.status === "done");
  const firstDoneToolBlockId =
    !isStreaming && successfulRuns.length
      ? blocks.find(
          (b) =>
            b.type === "tool" &&
            m.tools.find((r) => r.callId === b.callId)?.status === "done",
        )?.id
      : undefined;

  return (
    <div className="assistant-row">
      <span className="assistant-avatar" aria-hidden>
        <AppIcon icon={Icons.wechatChat} size={15} />
      </span>
      <div
        className={[
          "assistant-content",
          isError ? "assistant-content--error" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {blocks.map((block) => {
          switch (block.type) {
            case "text":
              return (
                <div
                  key={block.id}
                  className={[
                    "assistant-block",
                    m.status === "streaming" && block.id === lastTextBlockId
                      ? "assistant-caret"
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <MessageMarkdown text={block.text} />
                </div>
              );
            case "tool": {
              const run = m.tools.find((t) => t.callId === block.callId);
              if (!run) return null;
              // Successful rows collapse into one group once streaming ends.
              if (!isStreaming && run.status === "done") {
                if (block.id !== firstDoneToolBlockId) return null;
                return (
                  <div key={block.id} className="assistant-block">
                    <ToolStatusGroup runs={successfulRuns} />
                  </div>
                );
              }
              return (
                <div key={block.id} className="assistant-block">
                  <ToolStatusRow run={run} />
                </div>
              );
            }
            case "card":
              return (
                <div key={block.id} className="assistant-block">
                  <ActionCard card={block.card} />
                </div>
              );
            default: {
              const _exhaustive: never = block;
              void _exhaustive;
              return null;
            }
          }
        })}
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
        <div className="assistant-meta">
          <span className="assistant-time">{time}</span>
          {m.status === "complete" ? (
            <MessageActions message={m} onRegenerate={onRegenerate} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
