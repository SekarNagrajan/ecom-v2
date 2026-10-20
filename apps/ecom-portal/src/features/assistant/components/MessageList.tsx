// Modified by Sekar Nagarajan (2026-10-20 18:10)
import { AppButton } from "@solverminds/shared-ui";
import { Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { useAssistantController } from "../hooks/use-assistant-controller";
import { AssistantWelcome } from "./AssistantWelcome";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

type Controller = ReturnType<typeof useAssistantController>;

/** Distance (px) from the bottom within which auto-scroll stays engaged. */
const NEAR_BOTTOM_PX = 80;

export function MessageList({ controller: c }: { controller: Controller }) {
  const { t } = useTranslation("assistant");
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const last = c.messages[c.messages.length - 1];
  const lastAssistantId = [...c.messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  // Follow the stream only while the user is already near the bottom, so
  // scrolling up to re-read is never fought by incoming tokens.
  useEffect(() => {
    if (atBottom) {
      endRef.current?.scrollIntoView({ block: "end" });
    }
  }, [c.messages.length, last?.text.length, atBottom]);

  if (!c.messages.length) {
    return <AssistantWelcome onPick={c.send} />;
  }

  // Assistant placeholder is added immediately on send, so “last === user”
  // almost never holds. Prefer empty streaming assistant → MessageBubble chip.
  const showTyping =
    c.streaming &&
    last?.role === "user" &&
    !c.messages.some(
      (m) =>
        m.role === "assistant" &&
        m.status === "streaming" &&
        !m.text &&
        m.tools.length === 0 &&
        m.cards.length === 0,
    );

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX,
    );
  }

  function scrollToBottom() {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    setAtBottom(true);
  }

  return (
    <div className="assistant-messages-shell">
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="assistant-messages custom-scroll"
        role="log"
        aria-live="polite"
        aria-label={t("a11y.conversation")}
      >
        {c.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onRetry={c.retry}
            onRegenerate={
              m.id === lastAssistantId &&
              m.status === "complete" &&
              c.canRegenerate
                ? c.retry
                : undefined
            }
          />
        ))}
        {showTyping ? <TypingIndicator /> : null}
        <div ref={endRef} />
      </div>
      {!atBottom ? (
        <Tooltip title={t("a11y.scrollToBottom")}>
          <AppButton
            shape="circle"
            className="assistant-scroll-bottom"
            icon={<AppIcon icon={Icons.arrowDown} size={16} />}
            onClick={scrollToBottom}
            aria-label={t("a11y.scrollToBottom")}
          />
        </Tooltip>
      ) : null}
    </div>
  );
}
