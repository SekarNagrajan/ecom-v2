// Modified by Sekar Nagarajan (2026-11-16 15:30) — booking-preview route band for SI view
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { SIDTO, SIRouting } from "../../types/si.types";
import { splitPortLabel } from "../../utils/split-port-label";

const { Text } = Typography;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export interface SiRouteBandModel {
  originCode: string;
  originPlace: string;
  destCode: string;
  destPlace: string;
  vesselTag?: string | null;
  etd?: string;
  eta?: string;
  transitDays?: number | null;
  shipmentKind: string;
}

interface SiRouteBandProps {
  model: SiRouteBandModel;
}

function formatRoutePillDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mon = MONTHS[parsed.getMonth()];
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd} ${mon}, ${hh}:${min}`;
}

function transitDaysBetween(etd?: string, eta?: string): number | null {
  if (!etd || !eta) return null;
  const start = new Date(etd.replace(" ", "T")).getTime();
  const end = new Date(eta.replace(" ", "T")).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function shipmentKindFromLegs(
  legCount: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (legCount <= 1) return t("wizard.vessel.direct");
  const stops = legCount - 1;
  return t("wizard.vessel.stopCount", { count: stops });
}

function placeFromPrint(print?: string, fallbackPlace?: string): string {
  const raw = String(print ?? "").trim();
  if (!raw) return fallbackPlace || "—";
  return raw.replace(/\s*\([^)]*\)\s*/g, "").trim() || fallbackPlace || "—";
}

/** Builds the airy preview route-band model from SI list/detail fields. */
export function buildSiRouteBandModel(params: {
  origin?: string | null;
  delivery?: string | null;
  routing?: SIRouting | null;
  t: (key: string, options?: Record<string, unknown>) => string;
}): SiRouteBandModel {
  const { origin, delivery, routing, t } = params;
  const originPort = splitPortLabel(origin);
  const deliveryPort = splitPortLabel(delivery);
  const legs = routing?.scheduleLegs ?? [];
  const firstLeg = legs[0];
  const lastLeg = legs.length > 0 ? legs[legs.length - 1] : undefined;
  const etd = firstLeg?.etd;
  const eta = lastLeg?.eta;
  const vesselTag = routing?.vesselVoyage?.trim() || null;

  return {
    originCode: originPort.code,
    originPlace: placeFromPrint(routing?.polPrint || routing?.originPrint, originPort.place),
    destCode: deliveryPort.code,
    destPlace: placeFromPrint(routing?.podPrint || routing?.deliveryPrint, deliveryPort.place),
    vesselTag,
    etd,
    eta,
    transitDays: transitDaysBetween(etd, eta),
    shipmentKind: shipmentKindFromLegs(legs.length, t),
  };
}

export function buildSiRouteBandModelFromDetail(
  data: Pick<SIDTO, "origin" | "delivery" | "routing">,
  t: (key: string, options?: Record<string, unknown>) => string,
): SiRouteBandModel {
  return buildSiRouteBandModel({
    origin: data.origin,
    delivery: data.delivery,
    routing: data.routing,
    t,
  });
}

/** Airy review route band — same layout as Booking PreviewRouteBand. */
export function SiRouteBand({ model }: SiRouteBandProps) {
  const { t } = useTranslation("shipping-instruction");
  const transitLabel =
    model.transitDays != null
      ? t("routeBand.daysKind", {
          count: model.transitDays,
          kind: model.shipmentKind,
        })
      : t("labels.portToPort");

  return (
    <div className="booking-review-route" aria-label={t("labels.portToPort")}>
      <div className="booking-review-route__band">
        <div className="booking-review-route__endpoint">
          <span className="booking-review-route__eyebrow">{t("labels.origin")}</span>
          <Text strong className="booking-review-route__code">
            {model.originCode || "—"}
          </Text>
          <span className="booking-review-route__place">{model.originPlace || "—"}</span>
          {model.etd ? (
            <span className="booking-review-route__pill booking-review-route__pill--etd">
              {t("wizard.routing.etd")} {formatRoutePillDate(model.etd)}
            </span>
          ) : null}
        </div>

        <div className="booking-review-route__mid">
          {model.vesselTag ? (
            <div className="booking-review-route__meta">
              <Tag color="orange" className="booking-review-route__tag">
                {model.vesselTag}
              </Tag>
            </div>
          ) : null}
          <div className="booking-review-route__rail">
            <span className="booking-review-route__dot booking-review-route__dot--origin" />
            <span className="booking-review-route__dash" />
            <span className="booking-review-route__pill booking-review-route__pill--transit">
              {transitLabel}
            </span>
            <span className="booking-review-route__dash" />
            <span className="booking-review-route__dot booking-review-route__dot--dest" />
          </div>
        </div>

        <div className="booking-review-route__endpoint booking-review-route__endpoint--dest">
          <span className="booking-review-route__eyebrow">{t("labels.destination")}</span>
          <Text strong className="booking-review-route__code">
            {model.destCode || "—"}
          </Text>
          <span className="booking-review-route__place">{model.destPlace || "—"}</span>
          {model.eta ? (
            <span className="booking-review-route__pill booking-review-route__pill--eta">
              {t("wizard.routing.eta")} {formatRoutePillDate(model.eta)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
