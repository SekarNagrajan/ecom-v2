// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { AssistantCard } from "../../types/assistant.types";
import { isWhitelistedAppRoute } from "../../utils/citation-routes";
import { toolErrorMessageKey } from "../../utils/tool-errors";
import { BookingDetailCard } from "./BookingDetailCard";
import { RecordStatusCard } from "./RecordStatusCard";
import { ScheduleResultCard } from "./ScheduleResultCard";
import { TrackingResultCard } from "./TrackingResultCard";

const TOOL_SCREEN: Record<string, string> = {
  track_shipment: "/app/tracking",
  search_schedules: "/app/schedules",
  list_bookings: "/app/booking",
  get_booking: "/app/booking",
  list_shipping_instructions: "/app/shipping-instruction",
  list_bills_of_lading: "/app/bl",
  list_vgm: "/app/vgm",
  list_cro: "/app/cro",
  list_delivery_orders: "/app/delivery-order",
  list_arrival_notices: "/app/arrival-notice",
  get_customer_statement: "/app/customer-stmt",
  estimate_carbon: "/app/carbon",
  get_rates: "/app/rates",
  get_dashboard_summary: "/app/dashboard",
  get_hotline: "/contact-us",
};

const RECORD_TOOLS = new Set([
  "list_bookings",
  "list_shipping_instructions",
  "list_bills_of_lading",
  "list_vgm",
  "list_cro",
  "list_delivery_orders",
  "list_arrival_notices",
]);

export function ToolResultCard({ card }: { card: AssistantCard }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const data = card.data;

  // A failed tool shows a translated reason, never the raw error string.
  if (card.ok === false) {
    return (
      <div className="assistant-card assistant-card--error">
        <div className="assistant-card__head">
          <Typography.Title level={5} className="assistant-card__title">
            {t(`tools.${card.name}.failed`, { defaultValue: t("errors.TOOL_FAILED") })}
          </Typography.Title>
        </div>
        <div className="assistant-card__body">
          {t(toolErrorMessageKey(card.error))}
        </div>
      </div>
    );
  }

  if (card.name === "track_shipment") {
    return <TrackingResultCard data={data} />;
  }
  if (card.name === "search_schedules") {
    return <ScheduleResultCard data={data} />;
  }
  if (card.name === "get_booking") {
    return <BookingDetailCard data={data} />;
  }
  if (RECORD_TOOLS.has(card.name)) {
    return <RecordStatusCard tool={card.name} data={data} />;
  }

  const route = card.route ?? TOOL_SCREEN[card.name];

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t(`tools.${card.name}.done`, { defaultValue: card.name })}
        </Typography.Title>
      </div>
      {card.summary ? (
        <div className="assistant-card__body">{card.summary}</div>
      ) : null}
      {route && (isWhitelistedAppRoute(route) || route === "/contact-us") ? (
        <div className="assistant-card__footer">
          <AppButton
            size="small"
            type="link"
            onClick={() => navigate({ to: route })}
          >
            {t("actions.openScreen")}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
