// Modified by Sekar Nagarajan (2026-11-16 12:00) — recommended warning card chrome
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Tag, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { RouteLeg, ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

type SchedulesTranslateFn = (
  key: string,
  options?: { count?: number; [key: string]: unknown },
) => string;

interface ScheduleCardListProps {
  schedules: ScheduleItem[];
  isLoading?: boolean;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

interface ScheduleCardProps {
  item: ScheduleItem;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

type TransportNode =
  | { kind: "mode"; mode: "road" | "sea"; label: string; icon: LucideIcon }
  | { kind: "hub"; label: string }
  | { kind: "vessel"; label: string; vesselCode: string };

/** Short card date — e.g. 09/02/26 */
function formatCardDate(value: string): string {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const yy = String(parsed.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function vesselLabel(leg: Pick<RouteLeg, "vesselName" | "voyage" | "bound">): string {
  return `${leg.vesselName} (${leg.voyage}${leg.bound})`;
}

/**
 * Builds the horizontal transport transcript from existing schedule/leg data.
 * Multimodal: Road · service · vessel(s) · Road
 * Transshipment: vessel · hub port · vessel
 * Direct ocean: service · vessel
 */
function buildTransportNodes(item: ScheduleItem, roadLabel: string): TransportNode[] {
  const nodes: TransportNode[] = [];
  const hasInland = item.isMultimodal || item.legs.some((leg) => leg.legType === "Inland");

  if (hasInland) {
    nodes.push({
      kind: "mode",
      mode: "road",
      label: roadLabel,
      icon: Icons.truck,
    });
    nodes.push({ kind: "hub", label: item.serviceCode });
  }

  item.legs.forEach((leg, index) => {
    if (index > 0) {
      nodes.push({ kind: "hub", label: item.legs[index - 1].podPortId });
    }

    if (leg.legType === "Inland") {
      nodes.push({
        kind: "mode",
        mode: "road",
        label: roadLabel,
        icon: Icons.truck,
      });
      return;
    }

    nodes.push({
      kind: "vessel",
      label: vesselLabel(leg),
      vesselCode: leg.vesselCode,
    });
  });

  if (hasInland) {
    nodes.push({
      kind: "mode",
      mode: "road",
      label: roadLabel,
      icon: Icons.truck,
    });
  }

  if (!hasInland && item.legs.length <= 1) {
    return [
      { kind: "hub", label: item.serviceCode },
      {
        kind: "vessel",
        label: vesselLabel(item),
        vesselCode: item.vesselCode,
      },
    ];
  }

  return nodes;
}

function TransportTranscript({
  item,
  onViewVessel,
  roadLabel,
}: {
  item: ScheduleItem;
  onViewVessel: (vesselCode: string) => void;
  roadLabel: string;
}) {
  const nodes = buildTransportNodes(item, roadLabel);

  return null;
  // <div className="schedule-card__transport custom-scroll">
  //   {nodes.map((node, index) => (
  //     <Fragment key={`${node.kind}-${index}-${node.label}`}>
  //       {index > 0 ? (
  //         <span className="schedule-card__transport-rail" aria-hidden />
  //       ) : null}
  //       {node.kind === "hub" ? (
  //         <span className="schedule-card__transport-hub">{node.label}</span>
  //       ) : null}
  //       {node.kind === "mode" ? (
  //         <span className="schedule-card__transport-mode">
  //           <AppIcon icon={node.icon} size={14} />
  //           <span>{node.label}</span>
  //         </span>
  //       ) : null}
  //       {node.kind === "vessel" ? (
  //         <button
  //           type="button"
  //           className="schedule-card__transport-vessel"
  //           onClick={() => onViewVessel(node.vesselCode)}
  //         >
  //           <AppIcon icon={Icons.ship} size={14} />
  //           <span>{node.label}</span>
  //         </button>
  //       ) : null}
  //     </Fragment>
  //   ))}
  // </div>
}

type RouteStopBadge =
  | { kind: "road" }
  | { kind: "hub"; label: string }
  | { kind: "vessel"; label: string; vesselCode: string };

interface RouteStopOutbound {
  vesselName: string;
  vesselCode: string;
  serviceCode: string;
  serviceName: string;
  voyage: string;
  bound: string;
}

interface RouteStop {
  id: string;
  index: number;
  portCode: string;
  portName: string;
  terminal?: string;
  eta?: string;
  etd?: string;
  badges: RouteStopBadge[];
  outbound?: RouteStopOutbound;
}

const MONTH_SHORT = [
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

/** Route panel datetime — e.g. 18-Nov-2026 14:04 */
function formatRouteDateTime(value: string): string {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mon = MONTH_SHORT[parsed.getMonth()];
  const yyyy = String(parsed.getFullYear());
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}-${mon}-${yyyy} ${hh}:${min}`;
}

function outboundFromLeg(leg: RouteLeg): RouteStopOutbound {
  return {
    vesselName: leg.vesselName,
    vesselCode: leg.vesselCode,
    serviceCode: leg.serviceCode,
    serviceName: leg.serviceName,
    voyage: leg.voyage,
    bound: leg.bound,
  };
}

function outboundFromItem(item: ScheduleItem): RouteStopOutbound {
  return {
    vesselName: item.vesselName,
    vesselCode: item.vesselCode,
    serviceCode: item.serviceCode,
    serviceName: item.serviceName,
    voyage: item.voyage,
    bound: item.bound,
  };
}

function parseScheduleInstant(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value.replace(" ", "T"));
  const ms = parsed.getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Rail segment after `from` toward `to`:
 * completed (stronger solid) once the next stop is reached; otherwise upcoming (lighter solid).
 */
function isRouteSegmentCompleted(from: RouteStop, to: RouteStop): boolean {
  const arrivedAtNext = parseScheduleInstant(to.eta ?? to.etd);
  if (arrivedAtNext !== null) {
    return arrivedAtNext <= Date.now();
  }
  const departedFrom = parseScheduleInstant(from.etd ?? from.eta);
  return departedFrom !== null && departedFrom <= Date.now();
}

function legOutboundBadges(leg: RouteLeg, options?: { includeRoad?: boolean }): RouteStopBadge[] {
  const badges: RouteStopBadge[] = [];
  if (options?.includeRoad || leg.legType === "Inland") {
    badges.push({ kind: "road" });
  }
  if (leg.legType !== "Inland") {
    badges.push({ kind: "hub", label: leg.serviceCode });
    badges.push({
      kind: "vessel",
      label: vesselLabel(leg),
      vesselCode: leg.vesselCode,
    });
  }
  return badges;
}

/**
 * Builds Route timeline stops from existing legs + terminals.
 * Origin → ETD only; hubs → ETA + ETD; destination → ETA only.
 */
function buildRouteStops(item: ScheduleItem): RouteStop[] {
  const legs = item.legs;
  if (legs.length === 0) {
    return [
      {
        id: `stop-${item.polPortId}`,
        index: 1,
        portCode: item.polPortId,
        portName: item.polPortName,
        terminal: item.polTerminal,
        etd: item.etd,
        outbound: outboundFromItem(item),
        badges: item.isMultimodal
          ? [{ kind: "road" }]
          : [
              { kind: "hub", label: item.serviceCode },
              {
                kind: "vessel",
                label: vesselLabel(item),
                vesselCode: item.vesselCode,
              },
            ],
      },
      {
        id: `stop-${item.podPortId}`,
        index: 2,
        portCode: item.podPortId,
        portName: item.podPortName,
        terminal: item.podTerminal,
        eta: item.eta,
        badges: item.isMultimodal ? [{ kind: "road" }] : [],
      },
    ];
  }

  const stops: Omit<RouteStop, "index">[] = [];

  legs.forEach((leg, i) => {
    if (i === 0) {
      stops.push({
        id: `stop-${leg.polPortId}-origin`,
        portCode: leg.polPortId,
        portName: leg.polPortName,
        terminal: item.polTerminal || leg.terminal,
        etd: leg.etd,
        outbound: outboundFromLeg(leg),
        badges: legOutboundBadges(leg, {
          includeRoad: item.isMultimodal && leg.legType !== "Inland",
        }),
      });
      return;
    }

    const prev = legs[i - 1];
    stops.push({
      id: `stop-${leg.polPortId}-hub-${i}`,
      portCode: leg.polPortId,
      portName: leg.polPortName,
      terminal: leg.terminal,
      eta: prev.eta,
      etd: leg.etd,
      outbound: outboundFromLeg(leg),
      badges: legOutboundBadges(leg),
    });
  });

  const last = legs[legs.length - 1];
  stops.push({
    id: `stop-${last.podPortId}-dest`,
    portCode: last.podPortId,
    portName: last.podPortName,
    terminal: item.podTerminal || last.terminal,
    eta: last.eta,
    badges: item.isMultimodal || last.legType === "Inland" ? [{ kind: "road" }] : [],
  });

  return stops.map((stop, index) => ({ ...stop, index: index + 1 }));
}

function RouteStopBadges({
  badges,
  onViewVessel,
  t,
}: {
  badges: RouteStopBadge[];
  onViewVessel: (vesselCode: string) => void;
  t: SchedulesTranslateFn;
}) {
  if (badges.length === 0) return null;

  return (
    <div className="schedule-route-stop__badges">
      {badges.map((badge, index) => {
        if (badge.kind === "road") {
          return (
            <span
              key={`road-${index}`}
              className="schedule-route-stop__badge schedule-route-stop__badge--road"
            >
              <AppIcon icon={Icons.truck} size={12} />
              {t("card.road")}
            </span>
          );
        }
        if (badge.kind === "hub") {
          return (
            <span
              key={`hub-${badge.label}-${index}`}
              className="schedule-route-stop__badge schedule-route-stop__badge--hub"
            >
              {badge.label}
            </span>
          );
        }
        return (
          <button
            key={`vessel-${badge.vesselCode}-${index}`}
            type="button"
            className="schedule-route-stop__badge schedule-route-stop__badge--vessel"
            onClick={() => onViewVessel(badge.vesselCode)}
          >
            <AppIcon icon={Icons.ship} size={12} />
            {badge.label}
          </button>
        );
      })}
    </div>
  );
}

function RouteStopFact({
  label,
  value,
  title,
  onValueClick,
}: {
  label: string;
  value: string;
  title?: string;
  onValueClick?: () => void;
}) {
  return (
    <div className="schedule-route-stop__fact">
      <Text type="secondary" className="schedule-route-stop__fact-label">
        {label}
      </Text>
      {onValueClick ? (
        <button
          type="button"
          className="schedule-route-stop__fact-value schedule-route-stop__fact-value--link"
          title={title || value}
          onClick={onValueClick}
        >
          {value}
        </button>
      ) : (
        <Text
          strong
          className="schedule-route-stop__fact-value"
          ellipsis={{ tooltip: title || value }}
        >
          {value}
        </Text>
      )}
    </div>
  );
}

function ScheduleRouteDetails({
  item,
  onViewVessel,
  t,
}: {
  item: ScheduleItem;
  onViewVessel: (vesselCode: string) => void;
  t: SchedulesTranslateFn;
}) {
  // Modified by Sekar Nagarajan (2026-11-16 11:50)
  const stops = buildRouteStops(item);

  return (
    <div className="schedule-route-details">
      <div className="schedule-route-details__header">
        <Title level={5} className="schedule-route-details__title">
          {t("card.route")}
        </Title>
      </div>

      <ol className="schedule-route-timeline">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;
          const nextStop = stops[index + 1];
          const segmentCompleted =
            !isLast && nextStop ? isRouteSegmentCompleted(stop, nextStop) : false;
          const hasDeparture = Boolean(stop.etd);
          const hasArrivalOnly = Boolean(stop.eta) && !stop.etd;
          const nodeIcon = hasDeparture ? Icons.ship : Icons.mapPin;
          const placeLabel = `${portCity(stop.portName).toUpperCase()} (${stop.portCode})`;
          const roadBadges = stop.badges.filter((badge) => badge.kind === "road");
          const voyageDirection = stop.outbound
            ? `${stop.outbound.voyage}${stop.outbound.bound}`
            : "";

          return (
            <li
              key={stop.id}
              className={[
                "schedule-route-stop",
                hasDeparture ? "schedule-route-stop--departure" : undefined,
                hasArrivalOnly ? "schedule-route-stop--arrival" : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="schedule-route-stop__place-col">
                <Text
                  strong
                  className="schedule-route-stop__place"
                  ellipsis={{ tooltip: placeLabel }}
                >
                  {placeLabel}
                </Text>
              </div>

              <div className="schedule-route-stop__rail">
                <span
                  className="schedule-route-stop__node app-icon-inherit"
                  aria-label={hasDeparture ? t("card.departure") : t("card.arrival")}
                >
                  <AppIcon icon={nodeIcon} size={14} />
                </span>
                {isLast ? null : (
                  <span
                    className={[
                      "schedule-route-stop__line",
                      segmentCompleted
                        ? "schedule-route-stop__line--solid"
                        : "schedule-route-stop__line--dotted",
                    ].join(" ")}
                    aria-hidden
                  />
                )}
              </div>

              <div className="schedule-route-stop__body">
                {stop.eta && hasDeparture ? (
                  <div className="schedule-route-stop__panel schedule-route-stop__panel--arrival">
                    <RouteStopFact
                      label={t("card.arrival")}
                      value={formatRouteDateTime(stop.eta)}
                    />
                  </div>
                ) : null}

                {hasDeparture && stop.outbound ? (
                  <div className="schedule-route-stop__panel schedule-route-stop__panel--departure">
                    <RouteStopFact
                      label={t("card.departure")}
                      value={
                        stop.terminal?.trim()
                          ? stop.terminal
                          : portCity(stop.portName).toUpperCase()
                      }
                      title={stop.terminal || stop.portName}
                    />
                    <RouteStopFact
                      label={t("card.dateAndTime")}
                      value={formatRouteDateTime(stop.etd!)}
                    />
                    <RouteStopFact
                      label={t("card.vessel")}
                      value={stop.outbound.vesselName}
                      onValueClick={() => onViewVessel(stop.outbound!.vesselCode)}
                    />
                    <RouteStopFact
                      label={t("card.service")}
                      value={
                        stop.outbound.serviceName?.trim()
                          ? stop.outbound.serviceName
                          : stop.outbound.serviceCode
                      }
                      title={`${stop.outbound.serviceCode} — ${stop.outbound.serviceName}`}
                    />
                    <RouteStopFact label={t("card.voyageDirection")} value={voyageDirection} />
                  </div>
                ) : null}

                {hasArrivalOnly && stop.eta ? (
                  <div className="schedule-route-stop__panel schedule-route-stop__panel--arrival">
                    <RouteStopFact
                      label={t("card.arrival")}
                      value={formatRouteDateTime(stop.eta)}
                    />
                  </div>
                ) : null}

                {roadBadges.length > 0 ? (
                  <RouteStopBadges badges={roadBadges} onViewVessel={onViewVessel} t={t} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="schedule-route-details__deadlines">
        <Text className="schedule-route-details__deadlines-title">{t("card.cutoffs")}</Text>
        <div className="schedule-card__deadlines">
          <Tooltip title={t("card.gateInTooltip")}>
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--gate app-icon-inherit">
                <AppIcon icon={Icons.container} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">{t("card.gateIn")}</span>
                <span className="schedule-card__deadline-value">
                  {item.deadlines.containerGateIn}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title={t("card.siTooltip")}>
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--si app-icon-inherit">
                <AppIcon icon={Icons.clipboardList} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">{t("card.siCutoff")}</span>
                <span className="schedule-card__deadline-value">{item.deadlines.siDocClosing}</span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title={t("card.vgmTooltip")}>
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--vgm app-icon-inherit">
                <AppIcon icon={Icons.shieldCheck} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">{t("card.vgmCutoff")}</span>
                <span className="schedule-card__deadline-value">{item.deadlines.vgmClosing}</span>
              </span>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({
  item,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const [expanded, setExpanded] = useState(false);
  const routingLabel = item.isDirect
    ? t("list.direct")
    : t("list.stopCount", { count: item.transshipmentCount });

  return (
    <article
      className={["schedule-card", item.isDefaultRoute ? "schedule-card--recommended" : undefined]
        .filter(Boolean)
        .join(" ")}
      title={item.isDefaultRoute ? t("card.recommendedRoute") : undefined}
      aria-label={item.isDefaultRoute ? t("card.recommendedRoute") : undefined}
    >
      <div className="schedule-card__main">
        <div className="schedule-card__content">
          <div className="schedule-card__route">
            <div className="schedule-card__endpoint schedule-card__endpoint--origin">
              {/* <div className="schedule-card__date">
                {formatCardDate(item.etd)}
              </div> */}
              <Text className="schedule-card__place">
                {portCity(item.polPortName).toUpperCase()},{" "}
                <span className="schedule-card__port-code">{item.polPortId}</span>
              </Text>
              <div className="schedule-card__etime">
                <Tag className="schedule-card__etd-tag">{t("card.etd", { value: item.etd })}</Tag>
              </div>
              <Text className="schedule-card__terminal">
                {t("card.terminal", { name: item.polTerminal })}
              </Text>
            </div>

            <div className="schedule-card__connector">
              <div className="schedule-card__connector-service">
                <Tag
                  color="pink"
                  className="schedule-card__service-tag"
                  title={`${item.serviceCode} — ${item.serviceName}`}
                >
                  {item.serviceCode} — {item.serviceName}
                </Tag>
              </div>
              <div className="schedule-card__connector-line">
                <span className="schedule-card__connector-dot" />
                <span className="schedule-card__connector-rail" />
                <span className="schedule-card__connector-pill">
                  {t("card.days", { count: item.transitTimeDays })}
                </span>
                <span className="schedule-card__connector-rail" />
                <span className="schedule-card__connector-dot" />
              </div>
              <Text className="schedule-card__connector-type">{routingLabel}</Text>
            </div>

            <div className="schedule-card__endpoint schedule-card__endpoint--dest">
              {/* <div className="schedule-card__date">
                {formatCardDate(item.eta)}
              </div> */}
              <Text className="schedule-card__place">
                {portCity(item.podPortName).toUpperCase()},{" "}
                <span className="schedule-card__port-code">{item.podPortId}</span>
              </Text>
              <div className="schedule-card__etime">
                <Tag className="schedule-card__eta-tag">{t("card.eta", { value: item.eta })}</Tag>
              </div>
              <Text className="schedule-card__terminal">
                {t("card.terminal", { name: item.podTerminal })}
              </Text>
            </div>
          </div>

          <TransportTranscript item={item} onViewVessel={onViewVessel} roadLabel={t("card.road")} />
        </div>

        <div className="schedule-card__actions">
          <Tooltip title={!item.bookingAllowed ? t("bookingNotAllowedToast") : undefined}>
            <span className="schedule-card__book-now-wrap">
              <AppButton
                type="primary"
                // icon={<AppIcon icon={NavBookingDocIcon} size={16} />}
                onClick={() => onBookNow(item)}
                disabled={!item.bookingAllowed}
                block
              >
                {t("actions.bookNow")}
              </AppButton>
            </span>
          </Tooltip>
          <AppButton
            type="primary"
            // icon={<AppIcon icon={NavRatesIcon} size={16} />}
            className="schedule-card__actions-quote"
            onClick={() => onViewRates(item)}
            block
          >
            {t("actions.getAQuote")}
          </AppButton>
          <AppButton
            type="link"
            className={[
              "schedule-card__details-toggle",
              expanded ? "schedule-card__details-toggle--open" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
            icon={<AppIcon icon={Icons.route} size={14} />}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            block
          >
            {expanded ? t("actions.closeDetails") : t("actions.showDetails")}
          </AppButton>
          {/* <div className="schedule-card__actions-secondary">
            <AppButton
              size="small"
              icon={<AppIcon icon={Icons.calculator} size={14} tone="track" />}
              onClick={() => onOpenCarbonModal(item)}
            >
              CO₂
            </AppButton>
            <AppButton
              size="small"
              icon={<AppIcon icon={NavVesselIcon} size={14} tone="view" />}
              onClick={() => onViewVessel(item.vesselCode)}
            >
              Vessel
            </AppButton>
          </div> */}
        </div>
      </div>

      <div
        className={[
          "schedule-card__details-panel",
          expanded ? "schedule-card__details-panel--open" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!expanded}
      >
        <div className="schedule-card__details-panel-inner">
          <ScheduleRouteDetails item={item} onViewVessel={onViewVessel} t={t} />
        </div>
      </div>
    </article>
  );
}

export function ScheduleCardList({
  schedules,
  isLoading,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardListProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  if (isLoading) {
    return (
      <div
        className="schedule-empty module-loading-center"
        role="status"
        aria-label={t("a11y.loading")}
      >
        <Spin size="medium" />
        <Text type="secondary">{t("card.searching")}</Text>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="schedule-empty">
        <ModuleEmptyState
          variant="filtered"
          title={t("empty.cardTitle")}
          message={t("empty.cardMessage")}
          artSize="md"
        />
      </div>
    );
  }

  return (
    <div className="schedule-card-list">
      {schedules.map((item) => (
        <ScheduleCard
          key={item.id}
          item={item}
          onBookNow={onBookNow}
          onViewVessel={onViewVessel}
          onViewRates={onViewRates}
          onOpenCarbonModal={onOpenCarbonModal}
        />
      ))}
    </div>
  );
}
