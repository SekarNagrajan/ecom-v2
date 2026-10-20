// Modified by Sekar Nagarajan (2026-10-20 16:40)
import { useAuthStore } from "@solverminds/auth";
import { AppButton } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Select, Tooltip } from "antd";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAssistantController } from "../hooks/use-assistant-controller";
import { ASSISTANT_MODES } from "../modes/assistant-modes";
import type { AssistantMode } from "../modes/assistant-modes";
import { useAssistantStore } from "../store/assistant.store";
import { AssistantHistory } from "./AssistantHistory";
import { AssistantModuleStyles } from "./assistant-module-styles";
import { AssistantPanelHeader } from "./assistant-panel-header";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

useAuthStore.subscribe((s, prev) => {
  if (prev?.isAuthenticated && !s.isAuthenticated) {
    useAssistantStore.getState().reset();
  }
});

/**
 * Floating chat window pinned to the bottom-right corner (Copilot/Intercom
 * style) — not a drawer, no mask, the portal stays usable behind it.
 * Desktop: 520px card, expandable to ~720px; mobile: fullscreen.
 * Rendered through a portal so ancestor transforms cannot break `fixed`.
 */
export function AssistantWindow() {
  const { t } = useTranslation(["assistant", "common"]);
  const { isMobile } = useAntdBreakpoint();
  const user = useAuthStore((s) => s.user);
  const c = useAssistantController();

  // Focus the composer when the window opens; hand focus back on close.
  useEffect(() => {
    if (c.open) {
      document
        .querySelector<HTMLTextAreaElement>(".assistant-composer textarea")
        ?.focus();
      return () => {
        document
          .querySelector<HTMLButtonElement>(
            '[data-testid="assistant-launcher"]',
          )
          ?.focus();
      };
    }
    return undefined;
  }, [c.open]);

  const actingAs =
    user?.isImpersonating && user.impersonatedCustomer
      ? t("actingAs", {
          name:
            user.impersonatedCustomer.compName ||
            user.impersonatedCustomer.custCode ||
            user.name,
          customer:
            user.impersonatedCustomer.compName ||
            user.impersonatedCustomer.custCode ||
            user.name,
        })
      : undefined;

  const expanded = !isMobile && c.wide;

  const window = c.open ? (
    <section
      className={[
        "assistant-window",
        expanded ? "assistant-window--expanded" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-label={t("title")}
      data-testid="assistant-window"
      onKeyDown={(e) => {
        if (e.key === "Escape") c.setOpen(false);
      }}
    >
      <header className="assistant-window__header">
        <AssistantPanelHeader
          title={t("title")}
          status={t(`modes.${c.mode}.badge`, {
            defaultValue: t("status.online"),
          })}
          actingAs={actingAs}
          extra={
            <>
              <Select
                size="small"
                className="assistant-mode-select"
                value={c.mode}
                disabled={c.streaming}
                aria-label={t("modes.label", { defaultValue: "Assistant mode" })}
                popupMatchSelectWidth={false}
                options={ASSISTANT_MODES.map((mode) => ({
                  value: mode,
                  label: t(`modes.${mode}.label`),
                }))}
                onChange={(value: AssistantMode) => c.setMode(value)}
              />
              <Tooltip title={t("actions.history")}>
                <AppButton
                  type="text"
                  shape="circle"
                  className={
                    c.view === "history"
                      ? "assistant-header-action--active"
                      : undefined
                  }
                  icon={<AppIcon icon={Icons.history} size={16} />}
                  onClick={() =>
                    c.setView(c.view === "history" ? "chat" : "history")
                  }
                  aria-label={t("actions.history")}
                  aria-pressed={c.view === "history"}
                />
              </Tooltip>
              {!isMobile ? (
                <Tooltip
                  title={
                    c.wide
                      ? t("actions.shrinkWindow")
                      : t("actions.expandWindow")
                  }
                >
                  <AppButton
                    type="text"
                    shape="circle"
                    icon={
                      <AppIcon
                        icon={c.wide ? Icons.minimize2 : Icons.maximize2}
                        size={16}
                      />
                    }
                    onClick={c.toggleWide}
                    aria-label={
                      c.wide
                        ? t("actions.shrinkWindow")
                        : t("actions.expandWindow")
                    }
                    aria-pressed={c.wide}
                  />
                </Tooltip>
              ) : null}
              <Tooltip title={t("actions.newChat")}>
                <AppButton
                  type="text"
                  shape="circle"
                  icon={<AppIcon icon={Icons.squarePen} size={16} />}
                  onClick={c.newChat}
                  disabled={!c.messages.length}
                  aria-label={t("actions.newChat")}
                />
              </Tooltip>
              <Tooltip title={t("common:actions.close", { defaultValue: "Close" })}>
                <AppButton
                  type="text"
                  shape="circle"
                  danger
                  icon={<AppIcon icon={Icons.x} size={16} tone="delete" />}
                  onClick={() => c.setOpen(false)}
                  aria-label={t("common:actions.close", {
                    defaultValue: "Close",
                  })}
                />
              </Tooltip>
            </>
          }
        />
      </header>
      <div className="assistant-window__body">
        {c.view === "history" ? (
          <AssistantHistory controller={c} />
        ) : (
          <MessageList controller={c} />
        )}
      </div>
      {c.view === "chat" ? (
        <footer className="assistant-window__footer">
          <Composer controller={c} />
        </footer>
      ) : null}
    </section>
  ) : null;

  return (
    <>
      <AssistantModuleStyles />
      {window ? createPortal(window, document.body) : null}
    </>
  );
}
