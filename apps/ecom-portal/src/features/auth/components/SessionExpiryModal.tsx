// Modified by Sekar Nagarajan (2026-11-26 18:35)
import { sessionManager, useSessionStatus } from "@solverminds/auth";
import { AppModal } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { SessionExpiryModalStyles } from "./session-expiry-modal-styles";

const { Title, Paragraph, Text } = Typography;

function secondsUntil(deadlineAt: number | null, nowMs: number): number {
  return deadlineAt === null ? 0 : Math.max(Math.ceil((deadlineAt - nowMs) / 1000), 0);
}

/** Wall-clock time re-read once a second while `active` (stable within a second for React). */
function useSecondTicker(active: boolean): number {
  return useSyncExternalStore(
    (onTick) => {
      if (!active) return () => undefined;
      const id = window.setInterval(onTick, 1000);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / 1000) * 1000,
    () => 0,
  );
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * "Your session is about to expire" warning with a live countdown. Shown only while the session
 * manager is in its warning window; the countdown is derived from the real deadline (not a
 * decrementing counter) so it stays correct after the tab was throttled or the machine slept.
 * Mounted once at the app root so it also covers the admin consoles outside `/app`.
 */
export function SessionExpiryModal() {
  const { t } = useTranslation("auth");
  const { state, deadlineAt } = useSessionStatus();
  const open = state === "warning";
  const nowMs = useSecondTicker(open);
  const secondsLeft = secondsUntil(deadlineAt, nowMs);
  const [extending, setExtending] = useState(false);

  const handleStay = async () => {
    setExtending(true);
    try {
      await sessionManager.extend();
    } finally {
      setExtending(false);
    }
  };

  return (
    <>
      <SessionExpiryModalStyles />
      <AppModal
        open={open}
        dialogSize="xs"
        centered
        title={null}
        okText={t("session.stay")}
        cancelText={t("session.signOut")}
        onOk={handleStay}
        onCancel={() => void sessionManager.signOut()}
        confirmLoading={extending}
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        cancelButtonProps={{ danger: false }}
        className="session-expiry-modal"
      >
        <div className="session-expiry-modal__body">
          <div className="session-expiry-modal__header">
            <span className="session-expiry-modal__icon" aria-hidden>
              <AppIcon icon={Icons.clock} size={18} />
            </span>
            <div className="session-expiry-modal__copy">
              <Title level={5} className="session-expiry-modal__title">
                {t("session.warningTitle")}
              </Title>
              <Paragraph className="session-expiry-modal__desc">
                {t("session.warningDesc")}
              </Paragraph>
            </div>
          </div>

          <div className="session-expiry-modal__countdown">
            <Text className="session-expiry-modal__countdown-label">
              {t("session.countdownLabel")}
            </Text>
            <Text
              className="session-expiry-modal__countdown-value"
              role="timer"
              aria-label={t("session.countdownLabel")}
            >
              {formatClock(secondsLeft)}
            </Text>
          </div>
        </div>
      </AppModal>
    </>
  );
}
