// Created for Phase 4 — a single-booking detail card for get_booking.
// Previously get_booking was (wrongly) routed through RecordStatusCard, which
// reads `items` and so always showed the empty state.
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Descriptions, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { isWhitelistedAppRoute } from "../../utils/citation-routes";
import { getStatusDisplay } from "../../utils/status-labels";

interface BookingDetailData {
  booking_id?: string;
  status?: string | null;
  masterDetails?: {
    origin?: string;
    delivery?: string;
    cargoReadyDate?: string;
  } | null;
}

const BOOKING_ROUTE = "/app/booking";

export function BookingDetailCard({ data }: { data: unknown }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const d = (data ?? {}) as BookingDetailData;
  const md = d.masterDetails ?? {};
  const route = [md.origin, md.delivery].filter(Boolean).join(" → ") || "—";
  const status = d.status
    ? getStatusDisplay("get_booking", d.status)
    : null;

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {d.booking_id ?? t("cards.records.get_booking")}
        </Typography.Title>
        {status?.label ? <Tag color={status.color}>{status.label}</Tag> : null}
      </div>
      <Descriptions
        size="small"
        column={1}
        items={[
          {
            key: "route",
            label: t("cards.booking.route"),
            children: route,
          },
          {
            key: "cargoReady",
            label: t("cards.booking.cargoReady"),
            children: md.cargoReadyDate || "—",
          },
        ]}
      />
      {isWhitelistedAppRoute(BOOKING_ROUTE) ? (
        <div className="assistant-card__footer">
          <AppButton
            type="link"
            icon={<AppIcon icon={Icons.arrowRight} size={14} />}
            onClick={() => navigate({ to: BOOKING_ROUTE })}
          >
            {t("cards.booking.open")}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
