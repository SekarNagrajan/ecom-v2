// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { RECORD_ROW_LIMIT } from "../../tools/registry";
import { getStatusDisplay, type StatusModule } from "../../utils/status-labels";

interface RecordRow {
  id?: string;
  number?: string;
  bookingNo?: string;
  blNo?: string;
  siNo?: string;
  croNo?: string;
  doNo?: string;
  arnNo?: string;
  status?: string;
  pol?: string;
  pod?: string;
  origin?: string;
  delivery?: string;
  date?: string;
  etd?: string;
  cargoReadyDate?: string;
}

interface RecordData {
  items?: RecordRow[];
  total?: number;
  returned?: number;
  truncated?: boolean;
}

const TOOL_LIST_ROUTE: Record<string, string> = {
  list_bookings: "/app/booking",
  get_booking: "/app/booking",
  list_shipping_instructions: "/app/shipping-instruction",
  list_bills_of_lading: "/app/bl",
  list_vgm: "/app/vgm",
  list_cro: "/app/cro",
  list_delivery_orders: "/app/delivery-order",
  list_arrival_notices: "/app/arrival-notice",
};

function rowLabel(row: RecordRow): string {
  return (
    row.number ??
    row.bookingNo ??
    row.blNo ??
    row.siNo ??
    row.croNo ??
    row.doNo ??
    row.arnNo ??
    row.id ??
    "—"
  );
}

function rowRoute(row: RecordRow): string {
  return (
    [row.pol ?? row.origin, row.pod ?? row.delivery]
      .filter(Boolean)
      .join(" → ") ||
    row.date ||
    row.etd ||
    row.cargoReadyDate ||
    ""
  );
}

export function RecordStatusCard({
  tool,
  data,
}: {
  tool: string;
  data: unknown;
}) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const d = (data ?? {}) as RecordData;
  const items = (d.items ?? []).slice(0, RECORD_ROW_LIMIT);
  const returned = d.returned ?? items.length;
  const total = d.total ?? returned;
  const listRoute = TOOL_LIST_ROUTE[tool] ?? "/app/dashboard";

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t(`cards.records.${tool}`, {
            defaultValue: t("cards.records.title"),
          })}
        </Typography.Title>
        {returned > 0 ? (
          <Tag>{t("cards.records.count", { returned, total })}</Tag>
        ) : null}
      </div>
      {items.map((row, index) => {
        const status = row.status
          ? getStatusDisplay(tool as StatusModule, row.status)
          : null;
        return (
          <div key={row.id ?? index} className="assistant-card__sailing-row">
            <div>
              <strong>{rowLabel(row)}</strong>{" "}
              {status?.label ? (
                <Tag color={status.color}>{status.label}</Tag>
              ) : null}
            </div>
            <div className="assistant-card__meta">{rowRoute(row)}</div>
          </div>
        );
      })}
      {!items.length ? (
        <div className="assistant-card__body">{t("cards.records.empty")}</div>
      ) : null}
      <div className="assistant-card__footer">
        <AppButton
          type="link"
          icon={<AppIcon icon={Icons.arrowRight} size={14} />}
          onClick={() => navigate({ to: listRoute })}
        >
          {t("actions.openScreen")}
        </AppButton>
      </div>
    </div>
  );
}
