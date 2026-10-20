// Modified by Sekar Nagarajan (2026-10-20 16:40)
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAssistantSuggestions } from "../hooks/use-assistant-suggestions";

const { Title } = Typography;

/** Suggestion rows carry the icon of the module they help with. */
const MODULE_SUGGESTION_ICON: Record<string, keyof typeof Icons> = {
  booking: "bookOpen",
  tracking: "mapPin",
  schedules: "ship",
  "shipping-instruction": "clipboardList",
  rates: "dollarSign",
  vgm: "shieldCheck",
  bl: "fileCheck",
  carbon: "calculator",
  default: "sparkles",
};

const MODE_SUGGESTION_ICON: Record<string, keyof typeof Icons> = {
  assistant: "sparkles",
  automation: "bot",
  sql: "barChart",
  docs: "bookOpen",
};

/** Centered hero + contextual suggestion rows (per mode / module). */
export function AssistantWelcome({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  const { t } = useTranslation("assistant");
  const { module, mode, items } = useAssistantSuggestions();
  const iconKey =
    mode === "assistant"
      ? (MODULE_SUGGESTION_ICON[module] ?? "sparkles")
      : (MODE_SUGGESTION_ICON[mode] ?? "sparkles");
  const icon = Icons[iconKey];

  return (
    <div className="assistant-welcome">
      <div className="assistant-welcome__hero">
        <span className="assistant-welcome__avatar" aria-hidden>
          <AppIcon icon={Icons.wechatChat} size={30} />
        </span>
        <Title level={4} className="assistant-welcome__title">
          {t(`modes.${mode}.welcomeTitle`, {
            defaultValue: t("welcome.title"),
          })}
        </Title>
        <p className="assistant-welcome__body">
          {t(`modes.${mode}.welcomeBody`, {
            defaultValue: t("welcome.body"),
          })}
        </p>
      </div>
      <div className="assistant-suggestions">
        {items.map((text) => (
          <button
            key={text}
            type="button"
            className="assistant-suggestion"
            onClick={() => onPick(text)}
          >
            <span className="assistant-suggestion__icon" aria-hidden>
              <AppIcon icon={icon} size={16} />
            </span>
            <span className="assistant-suggestion__label">{text}</span>
            <span className="assistant-suggestion__go" aria-hidden>
              <AppIcon icon={Icons.arrowRight} size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
