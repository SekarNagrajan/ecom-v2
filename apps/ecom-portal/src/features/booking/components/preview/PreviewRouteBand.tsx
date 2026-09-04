// Modified by Sekar Nagarajan (2026-09-04 23:45)
import { Typography } from "antd";

import type { SelectedRoute } from "../../types/booking.types";

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

interface PreviewRouteBandProps {
  route: SelectedRoute;
  originCode: string;
  destCode: string;
  carriageContract?: string;
  haulageOrigin?: string;
  haulageDestination?: string;
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

function formatCutoffValue(value?: string): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 16);
}

function portPlace(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function shipmentKindLabel(route: SelectedRoute): string {
  if (route.shipmentKind === "Multimodal") return "Multimodal";
  if (route.isDirect) return "Direct";
  const stops =
    route.transshipmentCount ?? Math.max((route.legs?.length ?? 1) - 1, 0);
  return stops > 0
    ? `${stops} ${stops === 1 ? "stop" : "stops"}`
    : "Transshipment";
}

function haulageLine(
  haulageOrigin?: string,
  haulageDestination?: string,
): string {
  const origin = haulageOrigin?.trim() || "—";
  const destination = haulageDestination?.trim() || "—";
  return `${origin} / ${destination}`;
}

/** Airy review route band — matches Booking Preview Airy Review prototype. */
export function PreviewRouteBand({
  route,
  originCode,
  destCode,
  carriageContract,
  haulageOrigin,
  haulageDestination,
}: PreviewRouteBandProps) {
  const voyage = `${route.voyage ?? ""}${route.bound ?? ""}`;
  const serviceLine = [
    route.serviceCode ? `${route.serviceCode} — ${route.serviceName}` : null,
    voyage ? `${route.vesselName} ${voyage}` : route.vesselName,
  ]
    .filter(Boolean)
    .join(" · ");

  const originPlace = [
    portPlace(route.polPortName),
    route.polTerminal?.replace(/^AEJEA\s*/i, "").trim() || route.polTerminal,
  ]
    .filter(Boolean)
    .join(" · ");

  const destPlace = [
    portPlace(route.podPortName).split(",")[0]?.trim() ||
      portPlace(route.podPortName),
    route.podTerminal,
  ]
    .filter(Boolean)
    .join(" · ");

  const freightLine = [
    "Sea freight",
    "Door-to-door",
    carriageContract ? `FCL (${carriageContract})` : "FCL",
  ].join(" · ");

  const cutoffRows = [
    { label: "Gate-in cut-off", value: formatCutoffValue(route.gateInCutoff) },
    { label: "SI cut-off", value: formatCutoffValue(route.siDocCutoff) },
    { label: "VGM cut-off", value: formatCutoffValue(route.vgmCutoff) },
    {
      label: "Haulage (O / D)",
      value: haulageLine(haulageOrigin, haulageDestination),
    },
  ];

  return (
    <div className="booking-review-route">
      <div className="booking-review-route__band">
        <div className="booking-review-route__endpoint">
          <span className="booking-review-route__eyebrow">Origin</span>
          <Text strong className="booking-review-route__code">
            {originCode || "—"}
          </Text>
          <span className="booking-review-route__place">{originPlace || "—"}</span>
          <span className="booking-review-route__pill booking-review-route__pill--etd">
            ETD {formatRoutePillDate(route.etd)}
          </span>
        </div>

        <div className="booking-review-route__mid">
          <span className="booking-review-route__service">{serviceLine}</span>
          <div className="booking-review-route__rail">
            <span className="booking-review-route__dot booking-review-route__dot--origin" />
            <span className="booking-review-route__dash" />
            <span className="booking-review-route__pill booking-review-route__pill--transit">
              {route.transitTimeDays} days · {shipmentKindLabel(route)}
            </span>
            <span className="booking-review-route__dash" />
            <span className="booking-review-route__dot booking-review-route__dot--dest" />
          </div>
          <span className="booking-review-route__freight">{freightLine}</span>
        </div>

        <div className="booking-review-route__endpoint booking-review-route__endpoint--dest">
          <span className="booking-review-route__eyebrow">Destination</span>
          <Text strong className="booking-review-route__code">
            {destCode || "—"}
          </Text>
          <span className="booking-review-route__place">{destPlace || "—"}</span>
          <span className="booking-review-route__pill booking-review-route__pill--eta">
            ETA {formatRoutePillDate(route.eta)}
          </span>
        </div>
      </div>

      <div className="booking-review__grid booking-review-route__cutoffs">
        {cutoffRows.map((row) => (
          <div key={row.label} className="booking-review__field">
            <span className="booking-review__label">{row.label}</span>
            <span className="booking-review__value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
