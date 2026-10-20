// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { usePermission } from "@solverminds/auth";
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { applyPrefillBooking } from "../../actions/prefill-booking.action";
import { useAssistantStore } from "../../store/assistant.store";

interface Sailing {
  id?: string;
  vessel?: string;
  voyage?: string;
  pol?: string;
  pod?: string;
  etd?: string;
  eta?: string;
  bookingAllowed?: boolean;
  transitTimeDays?: number;
  isDefaultRoute?: boolean;
}

interface ScheduleData {
  count?: number;
  sailings?: Sailing[];
}

export function ScheduleResultCard({ data }: { data: unknown }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const { can } = usePermission();
  const closeDrawer = useAssistantStore((s) => s.closeDrawer);
  const d = (data ?? {}) as ScheduleData;
  const sailings = (d.sailings ?? []).slice(0, 3);

  return (
    <div className="assistant-card">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("cards.schedules.title")}
        </Typography.Title>
        <Tag>{t("cards.schedules.count", { count: d.count ?? sailings.length })}</Tag>
      </div>
      {sailings.map((s, index) => (
        <div key={s.id ?? index} className="assistant-card__sailing-row">
          <div>
            <strong>
              {[s.vessel, s.voyage].filter(Boolean).join(" ") || "—"}
            </strong>
            {s.isDefaultRoute ? (
              <>
                {" "}
                <Tag color="processing">{t("cards.schedules.recommended")}</Tag>
              </>
            ) : null}
          </div>
          <div className="assistant-card__meta">
            {[s.pol, s.pod].filter(Boolean).join(" → ")}
            {s.etd || s.eta
              ? ` · ${[s.etd, s.eta].filter(Boolean).join(" → ")}`
              : ""}
            {typeof s.transitTimeDays === "number"
              ? ` · ${t("cards.schedules.transit", { days: s.transitTimeDays })}`
              : ""}
          </div>
          {s.bookingAllowed && can("BKG") ? (
            <AppButton
              size="small"
              type="link"
              onClick={() => {
                void applyPrefillBooking({
                  schedule_id: s.id,
                  origin: s.pol,
                  delivery: s.pod,
                  etd: s.etd,
                }).then((result) => {
                  if (result.ok) {
                    closeDrawer();
                    navigate({ to: "/app/booking/new" });
                  }
                });
              }}
            >
              {t("cards.schedules.book")}
            </AppButton>
          ) : null}
        </div>
      ))}
      <div className="assistant-card__footer">
        <AppButton
          type="link"
          icon={<AppIcon icon={Icons.arrowRight} size={14} />}
          onClick={() => navigate({ to: "/app/schedules" })}
        >
          {t("actions.openScreen")}
        </AppButton>
      </div>
    </div>
  );
}
