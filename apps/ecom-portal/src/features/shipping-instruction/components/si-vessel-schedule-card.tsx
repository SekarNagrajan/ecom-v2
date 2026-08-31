// Modified by Sekar Nagarajan (2026-08-31 16:31)
/**
 * Vessel Details card — exact Schedules ScheduleCard visual parity
 * (schedule-card classes + ScheduleModuleStyles). Shared by SI + BL Master Details.
 */
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Tag, Tooltip, Typography, theme } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ScheduleModuleStyles } from "../../schedules/components/schedule-module-styles";
import type {
  RouteLeg,
  ScheduleItem,
} from "../../schedules/types/schedules.types";
import { tokenMix } from "../../theme/utils/token-mix";

const { Text, Title } = Typography;

/** Shared routing shape — SI + BL Master Details vessel card. */
export interface VesselScheduleRoutingLeg {
  id: string;
  vesselName: string;
  voyage?: string;
  polPortName: string;
  podPortName: string;
  etd: string;
  eta: string;
}

export interface VesselScheduleRouting {
  vesselVoyage: string;
  originPrint?: string;
  polPrint?: string;
  podPrint?: string;
  deliveryPrint?: string;
  scheduleLegs?: VesselScheduleRoutingLeg[];
}

function VesselScheduleCardStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .si-vessel-schedule-card.schedule-card {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__main {
        grid-template-columns: minmax(0, 1fr) !important;
        width: 100%;
        padding: ${token.paddingLG}px ${token.paddingXL}px;
      }
      .si-vessel-schedule-card .schedule-card__content,
      .si-vessel-schedule-card .schedule-card__meta,
      .si-vessel-schedule-card .schedule-card__transport,
      .si-vessel-schedule-card .schedule-card__footer {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__distance {
        margin-left: auto;
      }
      .si-vessel-schedule-card .schedule-card__route {
        width: 100%;
        gap: ${token.marginLG}px;
      }
      .si-vessel-schedule-card .schedule-card__endpoint {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        min-height: ${token.controlHeightLG * 3}px;
        justify-content: center;
      }
      .si-vessel-schedule-card .schedule-card__endpoint--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(
          180deg,
          ${primaryTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .si-vessel-schedule-card .schedule-card__endpoint--dest {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(
          180deg,
          ${successTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .si-vessel-schedule-card .schedule-card__place {
        font-size: ${token.fontSizeHeading5}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.3;
      }
      .si-vessel-schedule-card .schedule-card__connector {
        min-width: 0;
        width: 100%;
        padding-top: ${token.paddingMD}px;
      }
      .si-vessel-schedule-card .schedule-card__connector-pill {
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        font-size: ${token.fontSize}px;
      }
      @media (min-width: 768px) {
        .si-vessel-schedule-card .schedule-card__route {
          grid-template-columns: minmax(0, 1.2fr) minmax(180px, 1fr) minmax(0, 1.2fr);
          align-items: stretch;
        }
        .si-vessel-schedule-card .schedule-card__endpoint--dest {
          text-align: right;
          align-items: flex-end;
          border-left: 1px solid ${token.colorBorderSecondary};
          border-right: 4px solid ${token.colorSuccess};
        }
        .si-vessel-schedule-card .schedule-card__connector {
          align-self: center;
        }
      }
    `}</style>
  );
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function portCodeFromName(name: string): string {
  const cleaned = portCity(name)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return cleaned.slice(0, 5) || "PORT";
}

function transitDays(etd?: string, eta?: string): number {
  if (!etd || !eta) return 0;
  const start = Date.parse(etd);
  const end = Date.parse(eta);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function formatDetailDateTime(value: string): { date: string; time: string } {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return { date: value, time: "" };
  }
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const yyyy = String(parsed.getFullYear());
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return { date: `${mm}/${dd}/${yyyy}`, time: `${hh}:${min} LT` };
}

function mapLeg(leg: VesselScheduleRoutingLeg, index: number): RouteLeg {
  return {
    id: leg.id || `LEG-${index + 1}`,
    legType: "Mainline",
    vesselName: leg.vesselName,
    vesselCode: leg.vesselName.replace(/\s+/g, "").toUpperCase().slice(0, 10),
    voyage: (leg.voyage ?? "").replace(/[EWNSwns]$/, ""),
    bound: /[EWNSwns]$/.test(leg.voyage ?? "")
      ? (leg.voyage ?? "").slice(-1).toUpperCase()
      : "E",
    serviceName: "Booking Schedule",
    serviceCode: "BKGSCH",
    polPortId: portCodeFromName(leg.polPortName),
    polPortName: leg.polPortName,
    podPortId: portCodeFromName(leg.podPortName),
    podPortName: leg.podPortName,
    etd: leg.etd,
    eta: leg.eta,
    terminal: "Main Terminal",
  };
}

function mapSiRoutingToScheduleItem(
  routing: VesselScheduleRouting | undefined,
  fallback: {
    origin: string;
    loadPort: string;
    dischargePort: string;
    delivery: string;
  },
): ScheduleItem | null {
  if (!routing) return null;

  const legs = (routing.scheduleLegs ?? []).map(mapLeg);
  const first = legs[0];
  const last = legs[legs.length - 1] ?? first;
  const vesselParts = routing.vesselVoyage.split("/").map((p) => p.trim());
  const vesselName = first?.vesselName || vesselParts[0] || "—";
  const rawVoyage = first?.voyage || vesselParts[1] || "";
  const voyage = first?.voyage
    ? first.voyage
    : rawVoyage.replace(/[EWNSwns]$/, "");
  const bound = first?.bound
    ? first.bound
    : /[EWNSwns]$/.test(rawVoyage)
    ? rawVoyage.slice(-1).toUpperCase()
    : "E";
  const etd = first?.etd || "";
  const eta = last?.eta || first?.eta || "";
  const days = transitDays(etd, eta);

  return {
    id: "si-booking-schedule",
    serviceCode: "BKGSCH",
    serviceName: "Booking Schedule",
    isDefaultRoute: true,
    polPortId:
      first?.polPortId ||
      portCodeFromName(fallback.loadPort || fallback.origin),
    polPortName: first?.polPortName || fallback.origin,
    podPortId:
      last?.podPortId ||
      portCodeFromName(fallback.dischargePort || fallback.delivery),
    podPortName: last?.podPortName || fallback.delivery,
    polTerminal: first?.terminal || "Main Terminal",
    podTerminal: last?.terminal || "Main Terminal",
    etd,
    eta,
    transitTimeDays: days || 1,
    isDirect: legs.length <= 1,
    transshipmentCount: Math.max(0, legs.length - 1),
    isMultimodal: false,
    vesselName,
    vesselCode: vesselName.replace(/\s+/g, "").toUpperCase().slice(0, 10),
    voyage,
    bound,
    deadlines: {
      containerGateIn: etd ? `${etd} 18:00` : "—",
      siDocClosing: etd ? `${etd} 12:00` : "—",
      vgmClosing: etd ? `${etd} 15:00` : "—",
    },
    legs,
    distanceKm: 5280,
    bookingAllowed: false,
  };
}

function RouteStopTimes({ eta, etd }: { eta?: string; etd?: string }) {
  const etaParts = eta ? formatDetailDateTime(eta) : null;
  const etdParts = etd ? formatDetailDateTime(etd) : null;

  return (
    <div className="schedule-route-stop__times">
      {etaParts ? (
        <Text className="schedule-route-stop__time">
          ETA:{" "}
          <span className="schedule-route-stop__time-date">
            {etaParts.date}
          </span>
          {etaParts.time ? ` | ${etaParts.time}` : null}
        </Text>
      ) : null}
      {etdParts ? (
        <Text className="schedule-route-stop__time">
          ETD:{" "}
          <span className="schedule-route-stop__time-date">
            {etdParts.date}
          </span>
          {etdParts.time ? ` | ${etdParts.time}` : null}
        </Text>
      ) : null}
    </div>
  );
}

function SiScheduleRouteDetails({
  item,
  onViewVessel,
}: {
  item: ScheduleItem;
  onViewVessel: (vesselCode: string) => void;
}) {
  const stops =
    item.legs.length === 0
      ? []
      : [
          {
            id: `stop-origin`,
            index: 1,
            portCode: item.legs[0].polPortId,
            portName: item.legs[0].polPortName,
            terminal: item.polTerminal,
            etd: item.legs[0].etd,
            vesselCode: item.legs[0].vesselCode,
            vesselLabel: `${item.legs[0].vesselName} (${item.legs[0].voyage}${item.legs[0].bound})`,
          },
          ...item.legs.slice(1).map((leg, i) => ({
            id: `stop-hub-${i}`,
            index: i + 2,
            portCode: leg.polPortId,
            portName: leg.polPortName,
            terminal: leg.terminal,
            eta: item.legs[i].eta,
            etd: leg.etd,
            vesselCode: leg.vesselCode,
            vesselLabel: `${leg.vesselName} (${leg.voyage}${leg.bound})`,
          })),
          {
            id: `stop-dest`,
            index: item.legs.length + 1,
            portCode: item.legs[item.legs.length - 1].podPortId,
            portName: item.legs[item.legs.length - 1].podPortName,
            terminal: item.podTerminal,
            eta: item.legs[item.legs.length - 1].eta,
          },
        ];

  return (
    <div className="schedule-route-details">
      <div className="schedule-route-details__header">
        <Title level={5} className="schedule-route-details__title">
          Route
        </Title>
      </div>
      <ol className="schedule-route-timeline">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;
          return (
            <li key={stop.id} className="schedule-route-stop">
              <div className="schedule-route-stop__rail">
                <span className="schedule-route-stop__node">{stop.index}</span>
                {isLast ? null : (
                  <span className="schedule-route-stop__line" aria-hidden />
                )}
              </div>
              <div className="schedule-route-stop__body">
                <div className="schedule-route-stop__main">
                  <div className="schedule-route-stop__location">
                    <Text className="schedule-route-stop__place">
                      {portCity(stop.portName).toUpperCase()},{" "}
                      <span className="schedule-route-stop__code">
                        {stop.portCode}
                      </span>
                    </Text>
                    {stop.terminal ? (
                      <Text className="schedule-route-stop__terminal">
                        {stop.terminal}
                      </Text>
                    ) : null}
                    {"vesselCode" in stop && stop.vesselCode ? (
                      <div className="schedule-route-stop__badges">
                        <button
                          type="button"
                          className="schedule-route-stop__badge schedule-route-stop__badge--vessel"
                          onClick={() => onViewVessel(stop.vesselCode!)}
                        >
                          <AppIcon icon={Icons.ship} size={12} />
                          {stop.vesselLabel}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <RouteStopTimes eta={stop.eta} etd={stop.etd} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface SiVesselScheduleCardProps {
  routing: VesselScheduleRouting | undefined;
  origin: string;
  loadPort: string;
  dischargePort: string;
  delivery: string;
}

export function SiVesselScheduleCard({
  routing,
  origin,
  loadPort,
  dischargePort,
  delivery,
}: SiVesselScheduleCardProps) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const item = mapSiRoutingToScheduleItem(routing, {
    origin,
    loadPort,
    dischargePort,
    delivery,
  });

  if (!item) {
    return (
      <>
        <ScheduleModuleStyles />
        <div className="schedule-empty">
          <Text type="secondary" className="schedule-empty__text">
            No schedule available for this booking.
          </Text>
        </div>
      </>
    );
  }

  const routingLabel = item.isDirect
    ? "Direct"
    : `${item.transshipmentCount} ${
        item.transshipmentCount === 1 ? "Stop" : "Stops"
      }`;

  const onViewVessel = (vesselCode: string) => {
    toast.info(`Vessel: ${item.vesselName} (${vesselCode})`);
  };

  return (
    <>
      <ScheduleModuleStyles />
      <VesselScheduleCardStyles />
      <article
        className={[
          "schedule-card",
          "si-vessel-schedule-card",
          item.isDefaultRoute ? "schedule-card--recommended" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="schedule-card__main">
          <div className="schedule-card__content">
            <div className="schedule-card__meta">
              <Tag color="blue">
                {item.serviceCode} — {item.serviceName}
              </Tag>
              <Tag
                className="schedule-card__vessel-tag"
                onClick={() => onViewVessel(item.vesselCode)}
              >
                {item.vesselName} ({item.voyage}
                {item.bound})
              </Tag>
              <Text type="secondary" className="schedule-card__distance">
                <Tag color="gold">Distance</Tag>{" "}
                {item.distanceKm.toLocaleString()} km
              </Text>
            </div>

            <div className="schedule-card__route">
              <div className="schedule-card__endpoint schedule-card__endpoint--origin">
                <Text className="schedule-card__place">
                  {portCity(item.polPortName).toUpperCase()},{" "}
                  <span className="schedule-card__port-code">
                    {item.polPortId}
                  </span>
                </Text>
                <div className="schedule-card__etime">
                  <Tag color="blue">ETD {item.etd}</Tag>
                </div>
                <Text className="schedule-card__terminal">
                  Terminal: {item.polTerminal}
                </Text>
              </div>

              <div className="schedule-card__connector">
                <div className="schedule-card__connector-line">
                  <span className="schedule-card__connector-dot" />
                  <span className="schedule-card__connector-rail" />
                  <span className="schedule-card__connector-pill">
                    {item.transitTimeDays} Days
                  </span>
                  <span className="schedule-card__connector-rail" />
                  <span className="schedule-card__connector-dot" />
                </div>
                <Text className="schedule-card__connector-type">
                  {routingLabel}
                </Text>
              </div>

              <div className="schedule-card__endpoint schedule-card__endpoint--dest">
                <Text className="schedule-card__place">
                  {portCity(item.podPortName).toUpperCase()},{" "}
                  <span className="schedule-card__port-code">
                    {item.podPortId}
                  </span>
                </Text>
                <div className="schedule-card__etime">
                  <Tag color="green">ETA {item.eta}</Tag>
                </div>
                <Text className="schedule-card__terminal">
                  Terminal: {item.podTerminal}
                </Text>
              </div>
            </div>

            <div className="schedule-card__transport custom-scroll">
              <span className="schedule-card__transport-hub">
                {item.serviceCode}
              </span>
              <span className="schedule-card__transport-rail" aria-hidden />
              <button
                type="button"
                className="schedule-card__transport-vessel"
                onClick={() => onViewVessel(item.vesselCode)}
              >
                <AppIcon icon={Icons.ship} size={14} />
                <span>
                  {item.vesselName} ({item.voyage}
                  {item.bound})
                </span>
              </button>
            </div>
          </div>
        </div>

        {expanded ? (
          <SiScheduleRouteDetails item={item} onViewVessel={onViewVessel} />
        ) : null}

        {/* Modified by Sekar Nagarajan (2026-08-31 16:07) — Show Details on footer right */}
        <div className="schedule-card__footer">
          <div className="schedule-card__deadlines">
            <Tooltip title="Container Gate-In Closing">
              <div className="schedule-card__deadline">
                <span className="schedule-card__deadline-icon schedule-card__deadline-icon--gate app-icon-inherit">
                  <AppIcon icon={Icons.container} size={14} />
                </span>
                <span>
                  <span className="schedule-card__deadline-label">Gate-In</span>
                  <span className="schedule-card__deadline-value">
                    {item.deadlines.containerGateIn}
                  </span>
                </span>
              </div>
            </Tooltip>
            <Tooltip title="Shipping Instruction Document Closing">
              <div className="schedule-card__deadline">
                <span className="schedule-card__deadline-icon schedule-card__deadline-icon--si app-icon-inherit">
                  <AppIcon icon={Icons.clipboardList} size={14} />
                </span>
                <span>
                  <span className="schedule-card__deadline-label">
                    SI Cut-Off
                  </span>
                  <span className="schedule-card__deadline-value">
                    {item.deadlines.siDocClosing}
                  </span>
                </span>
              </div>
            </Tooltip>
            <Tooltip title="Verified Gross Mass (VGM) Closing">
              <div className="schedule-card__deadline">
                <span className="schedule-card__deadline-icon schedule-card__deadline-icon--vgm app-icon-inherit">
                  <AppIcon icon={Icons.shieldCheck} size={14} />
                </span>
                <span>
                  <span className="schedule-card__deadline-label">
                    VGM Cut-Off
                  </span>
                  <span className="schedule-card__deadline-value">
                    {item.deadlines.vgmClosing}
                  </span>
                </span>
              </div>
            </Tooltip>
          </div>
          <AppButton
            type="link"
            icon={<AppIcon icon={Icons.route} size={14} />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Close Details" : "Show Details"}
          </AppButton>
        </div>
      </article>
    </>
  );
}
