// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Descriptions, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";

interface TrackingData {
  found?: boolean;
  searchKey?: string;
  bookingNo?: string;
  blNo?: string;
  vessel?: string;
  voyage?: string;
  pol?: string;
  pod?: string;
  progressPercent?: number;
  containers?: Array<{
    containerNo?: string;
    status?: string;
    lastLocation?: string;
    latestActivity?: string;
  }>;
  search_type?: string;
  search_value?: string;
}

export function TrackingResultCard({ data }: { data: unknown }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const d = (data ?? {}) as TrackingData;

  if (d.found === false) {
    return (
      <div className="assistant-card">
        <div className="assistant-card__head">
          <Typography.Title level={5} className="assistant-card__title">
            {t("cards.tracking.title")}
          </Typography.Title>
          <Tag>{t("cards.tracking.notFound")}</Tag>
        </div>
      </div>
    );
  }

  const first = d.containers?.[0];
  const trackingNumber = first?.containerNo ?? d.searchKey ?? d.search_value;

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("cards.tracking.title")}
        </Typography.Title>
        {first?.status ? <Tag color="processing">{first.status}</Tag> : null}
      </div>
      <Descriptions
        size="small"
        column={1}
        items={[
          {
            key: "ref",
            label: t("cards.tracking.reference"),
            children: trackingNumber ?? "—",
          },
          {
            key: "route",
            label: t("cards.tracking.route"),
            children: [d.pol, d.pod].filter(Boolean).join(" → ") || "—",
          },
          {
            key: "vessel",
            label: t("cards.tracking.vessel"),
            children: [d.vessel, d.voyage].filter(Boolean).join(" ") || "—",
          },
          {
            key: "activity",
            label: t("cards.tracking.lastEvent"),
            children: first?.latestActivity ?? first?.lastLocation ?? "—",
          },
        ]}
      />
      <div className="assistant-card__footer">
        <AppButton
          type="link"
          icon={<AppIcon icon={Icons.arrowRight} size={14} />}
          onClick={() => navigate({ to: "/app/tracking" })}
        >
          {t("cards.tracking.open")}
        </AppButton>
      </div>
    </div>
  );
}
