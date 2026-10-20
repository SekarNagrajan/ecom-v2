// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { resolveNavigateRoute } from "../../actions/navigate.action";
import { useAssistantStore } from "../../store/assistant.store";
import type { AssistantCard } from "../../types/assistant.types";

export function NavigateCard({ card }: { card: AssistantCard }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const closeDrawer = useAssistantStore((s) => s.closeDrawer);
  const route = resolveNavigateRoute(card.arguments);

  if (!route) return null;

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("navigateCardTitle")}
        </Typography.Title>
      </div>
      <div className="assistant-card__body">{route}</div>
      <div className="assistant-card__footer">
        <AppButton
          type="primary"
          ghost
          icon={<AppIcon icon={Icons.arrowRight} size={16} />}
          onClick={() => {
            closeDrawer();
            navigate({ to: route });
          }}
        >
          {t("actions.openScreen")}
        </AppButton>
      </div>
    </div>
  );
}
