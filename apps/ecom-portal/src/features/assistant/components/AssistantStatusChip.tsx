// Modified by Sekar Nagarajan (2026-10-20 18:10)
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const STATUS_KEYS = [
  "status.thinking",
  "status.preparing",
  "status.working",
] as const;

/** Shared thinking / preparing chip used while waiting for the first token. */
export function AssistantStatusChip() {
  const { t } = useTranslation("assistant");
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_KEYS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="assistant-status-chip"
      role="status"
      aria-live="polite"
      aria-label={t("a11y.typing")}
    >
      <span className="assistant-status-chip__pulse" aria-hidden />
      <span className="assistant-status-chip__copy">
        <span className="assistant-status-chip__label" key={statusIndex}>
          {t(STATUS_KEYS[statusIndex], {
            defaultValue:
              statusIndex === 0
                ? "Thinking…"
                : statusIndex === 1
                  ? "Preparing…"
                  : "Working on it…",
          })}
        </span>
        <span className="assistant-status-chip__dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </span>
    </div>
  );
}
