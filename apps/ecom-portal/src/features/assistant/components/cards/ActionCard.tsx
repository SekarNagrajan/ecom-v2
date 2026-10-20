// Modified by Sekar Nagarajan (2026-10-20 16:50)
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { AssistantCard } from "../../types/assistant.types";
import { AutomationConfirmCard } from "./AutomationConfirmCard";
import { BookingPrefillCard } from "./BookingPrefillCard";
import { NavigateCard } from "./NavigateCard";
import { SqlResultCard } from "./SqlResultCard";
import { ToolResultCard } from "./ToolResultCard";

interface ActionCardProps {
  card: AssistantCard;
}

export function ActionCard({ card }: ActionCardProps) {
  const { t } = useTranslation("assistant");

  switch (card.kind) {
    case "booking_prefill":
      return <BookingPrefillCard card={card} />;
    case "automation_confirm":
      return <AutomationConfirmCard card={card} />;
    case "sql_result":
      return <SqlResultCard card={card} />;
    case "navigate":
      return <NavigateCard card={card} />;
    case "tool_result":
      return <ToolResultCard card={card} />;
    case "action":
      return (
        <div className="assistant-card">
          <Typography.Title level={5} className="assistant-card__title">
            {card.name}
          </Typography.Title>
          <div className="assistant-card__body">{t("unsupportedAction")}</div>
        </div>
      );
    default: {
      const _exhaustive: never = card.kind;
      void _exhaustive;
      return null;
    }
  }
}
