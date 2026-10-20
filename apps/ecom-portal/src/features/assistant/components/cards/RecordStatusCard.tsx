// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";

interface RecordRow {
  id?: string;
  number?: string;
  bookingNo?: string;
  blNo?: string;
  siNo?: string;
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
}

const TOOL_LIST_ROUTE: Record<string, string> = {
  list_bookings: "/app/booking",
  get_booking: "/app/booking",
  list_shipping_instructions: "/app/shipping-instruction",
  list_bills_of_lading: "/app/bl",
  list_vgm: "/app/vgm",
  list_cro: "/app/cro",
};

function rowLabel(row: RecordRow): string {
  return (
    row.number ?? row.bookingNo ?? row.blNo ?? row.siNo ?? row.id ?? "—"
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

function statusColor(
  status: string | undefined,
): "success" | "processing" | "warning" | "error" | "default" {
  if (!status) return "default";
  const s = status.toLowerCase();
  if (s.includes("accept") || s.includes("confirm") || s.includes("complete")) {
    return "success";
  }
  if (s.includes("pending") || s.includes("draft") || s.includes("open")) {
    return "processing";
  }
  if (s.includes("reject") || s.includes("cancel") || s.includes("error")) {
    return "error";
  }
  if (s.includes("await") || s.includes("hold")) return "warning";
  return "default";
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
  const items = (d.items ?? []).slice(0, 5);
  const listRoute = TOOL_LIST_ROUTE[tool] ?? "/app/dashboard";

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t(`cards.records.${tool}`, {
            defaultValue: t("cards.records.title"),
          })}
        </Typography.Title>
        <Tag>{items.length}</Tag>
      </div>
      {items.map((row, index) => (
        <div key={row.id ?? index} className="assistant-card__sailing-row">
          <div>
            <strong>{rowLabel(row)}</strong>{" "}
            {row.status ? (
              <Tag color={statusColor(row.status)}>{row.status}</Tag>
            ) : null}
          </div>
          <div className="assistant-card__meta">{rowRoute(row)}</div>
        </div>
      ))}
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
