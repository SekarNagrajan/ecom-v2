// Modified by Sekar Nagarajan (2026-10-20 16:20)
import { AppButton, AppTextarea } from "@solverminds/shared-ui";
import {
  appendTranscript,
  AudioDictationButton,
} from "@solverminds/shared-ui/components/ui/audio-dictation-button";
import { GrammarImproveButton } from "@solverminds/shared-ui/components/ui/grammar-improve-button";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";

import { AppIcon, Icons } from "../../../components/icons";
import { useAiTextAssist } from "../../ai-assist";
import type { useAssistantController } from "../hooks/use-assistant-controller";
import { routeToModule } from "../utils/route-module";

/** Module slug → modules:titles.* key for the context pill label. */
const MODULE_TITLE_KEY: Record<string, string> = {
  booking: "booking",
  tracking: "tracking",
  schedules: "schedules",
  rates: "rates",
  vgm: "vgm",
  "shipping-instruction": "shippingInstruction",
  bl: "billOfLading",
  carbon: "carbonCalculator",
};

const MAX_LEN = 4000;

/**
 * CRM-style composer (Cursor-like card):
 * - Full-width textarea on top
 * - Bottom toolbar: context chip (left) · grammar · voice · send (right)
 * Same AI affordances as CRM ChatInput (grammar improve + audio dictation).
 */
export function Composer({
  controller: c,
}: {
  controller: ReturnType<typeof useAssistantController>;
}) {
  const { t } = useTranslation(["assistant", "ai-assist", "modules"]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const module = routeToModule(pathname);
  const titleKey = MODULE_TITLE_KEY[module];
  const contextLabel = titleKey
    ? t(`modules:titles.${titleKey}`)
    : t("context.thisScreen");
  const { audioDictation, grammarImprove } = useAiTextAssist();
  const canSend = c.draft.trim().length > 0 && !c.streaming;
  const nearLimit = c.draft.length >= MAX_LEN - 500;
  const assistDisabled = c.streaming;

  function handleDictationResult(text: string) {
    const result = appendTranscript(c.draft, text, MAX_LEN);
    if (result.value !== c.draft) c.setDraft(result.value);
    if (result.error) audioDictation.onError?.(result.error);
  }

  return (
    <div className="assistant-composer-shell">
      <div className="assistant-composer">
        <AppTextarea
          className="assistant-composer__input"
          value={c.draft}
          onChange={(e) => c.setDraft(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              if (canSend) c.send(c.draft);
            }
          }}
          placeholder={t(`modes.${c.mode}.placeholder`, {
            defaultValue: t("composer.placeholder"),
          })}
          autoSize={{ minRows: 2, maxRows: 6 }}
          maxLength={MAX_LEN}
          disabled={assistDisabled}
          aria-label={t(`modes.${c.mode}.placeholder`, {
            defaultValue: t("composer.placeholder"),
          })}
        />
        <div className="assistant-composer__footer">
          <div className="assistant-composer__footer-start">
            <Tooltip title={t("context.tooltip")}>
              <button
                type="button"
                className={[
                  "assistant-context-pill",
                  c.includePageContext
                    ? undefined
                    : "assistant-context-pill--off",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={c.togglePageContext}
                aria-pressed={c.includePageContext}
                aria-label={t("context.tooltip")}
              >
                <AppIcon
                  icon={c.includePageContext ? Icons.appWindow : Icons.circleX}
                  size={12}
                />
                <span>{contextLabel}</span>
              </button>
            </Tooltip>
          </div>
          <div className="assistant-composer__actions">
            <GrammarImproveButton
              grammarImprove={grammarImprove}
              currentValue={c.draft}
              onResult={(corrected) => c.setDraft(corrected)}
              disabled={assistDisabled}
              iconOnly
              tooltip={t("ai-assist:tooltips.grammarImprove", {
                defaultValue: "Improve Grammar",
              })}
            />
            <AudioDictationButton
              audioDictation={audioDictation}
              onResult={handleDictationResult}
              disabled={assistDisabled}
              tooltip={t("composer.dictate")}
            />
            {c.streaming ? (
              <Tooltip title={t("actions.stop")}>
                <AppButton
                  danger
                  shape="circle"
                  className="assistant-composer__send"
                  icon={<AppIcon icon={Icons.stopCircle} size={16} />}
                  onClick={c.stop}
                  aria-label={t("actions.stop")}
                />
              </Tooltip>
            ) : (
              <Tooltip title={t("actions.send")}>
                <AppButton
                  type="primary"
                  shape="circle"
                  className="assistant-composer__send"
                  icon={<AppIcon icon={Icons.sendHorizontal} size={16} />}
                  disabled={!canSend}
                  onClick={() => c.send(c.draft)}
                  aria-label={t("actions.send")}
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      <div className="assistant-composer__meta">
        <AppIcon icon={Icons.info} size={12} />
        <span className="assistant-composer__hint">
          {t("composer.disclaimer")}
        </span>
        {nearLimit ? (
          <span className="assistant-composer__count">
            {c.draft.length} / {MAX_LEN}
          </span>
        ) : null}
      </div>
    </div>
  );
}
