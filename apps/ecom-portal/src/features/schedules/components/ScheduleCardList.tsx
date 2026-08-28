// Modified by Sekar Nagarajan (2026-08-27 23:09)
import { AppButton } from "@solverminds/shared-ui";
import { Empty, Space, Spin, Tag, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { Fragment, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { RouteLeg, ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

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

function vesselLabel(
  leg: Pick<RouteLeg, "vesselName" | "voyage" | "bound">,
): string {
  return `${leg.vesselName} (${leg.voyage}${leg.bound})`;
}

/**
 * Builds the horizontal transport transcript from existing schedule/leg data.
 * Multimodal: Road · service · vessel(s) · Road
 * Transshipment: vessel · hub port · vessel
 * Direct ocean: service · vessel
 */
function buildTransportNodes(item: ScheduleItem): TransportNode[] {
  const nodes: TransportNode[] = [];
  const hasInland =
    item.isMultimodal || item.legs.some((leg) => leg.legType === "Inland");

  if (hasInland) {
    nodes.push({
      kind: "mode",
      mode: "road",
      label: "Road",
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
        label: "Road",
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
      label: "Road",
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
}: {
  item: ScheduleItem;
  onViewVessel: (vesselCode: string) => void;
}) {
  const nodes = buildTransportNodes(item);

  return (
    <div className="schedule-card__transport custom-scroll">
      {nodes.map((node, index) => (
        <Fragment key={`${node.kind}-${index}-${node.label}`}>
          {index > 0 ? (
            <span className="schedule-card__transport-rail" aria-hidden />
          ) : null}
          {node.kind === "hub" ? (
            <span className="schedule-card__transport-hub">{node.label}</span>
          ) : null}
          {node.kind === "mode" ? (
            <span className="schedule-card__transport-mode">
              <AppIcon icon={node.icon} size={14} />
              <span>{node.label}</span>
            </span>
          ) : null}
          {node.kind === "vessel" ? (
            <button
              type="button"
              className="schedule-card__transport-vessel"
              onClick={() => onViewVessel(node.vesselCode)}
            >
              <AppIcon icon={Icons.ship} size={14} />
              <span>{node.label}</span>
            </button>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

type RouteStopBadge =
  | { kind: "road" }
  | { kind: "hub"; label: string }
  | { kind: "vessel"; label: string; vesselCode: string };

interface RouteStop {
  id: string;
  index: number;
  portCode: string;
  portName: string;
  terminal?: string;
  eta?: string;
  etd?: string;
  badges: RouteStopBadge[];
}

/** Detail datetime — e.g. 09/02/2026 | 18:00 LT */
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

function legOutboundBadges(
  leg: RouteLeg,
  options?: { includeRoad?: boolean },
): RouteStopBadge[] {
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
 * Builds numbered Route timeline stops from existing legs + terminals.
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
    badges:
      item.isMultimodal || last.legType === "Inland" ? [{ kind: "road" }] : [],
  });

  return stops.map((stop, index) => ({ ...stop, index: index + 1 }));
}

function RouteStopBadges({
  badges,
  onViewVessel,
}: {
  badges: RouteStopBadge[];
  onViewVessel: (vesselCode: string) => void;
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
              Road
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

function ScheduleRouteDetails({
  item,
  onClose,
  onViewVessel,
}: {
  item: ScheduleItem;
  onClose: () => void;
  onViewVessel: (vesselCode: string) => void;
}) {
  const stops = buildRouteStops(item);

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
                    <RouteStopBadges
                      badges={stop.badges}
                      onViewVessel={onViewVessel}
                    />
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

function ScheduleCard({
  item,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const routingLabel = item.isDirect
    ? "Direct"
    : `${item.transshipmentCount} ${
        item.transshipmentCount === 1 ? "Stop" : "Stops"
      }`;

  return (
    <article
      className={[
        "schedule-card",
        item.isDefaultRoute ? "schedule-card--recommended" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="schedule-card__main">
        <div className="schedule-card__content">
          <div className="schedule-card__meta">
            {item.isDefaultRoute ? <Tag color="gold">Recommended</Tag> : null}
            <Tag color="blue">
              {item.serviceCode} — {item.serviceName}
            </Tag>
            {/* {item.isDirect ? (
              <Tag color="green">Direct</Tag>
            ) : (
              <Tag color="purple">
                {item.transshipmentCount}{" "}
                {item.transshipmentCount === 1 ? "Stop" : "Stops"}
              </Tag>
            )} */}
            {item.isMultimodal ? <Tag color="cyan">Multimodal</Tag> : null}
            <Tag
              className="schedule-card__vessel-tag"
              onClick={() => onViewVessel(item.vesselCode)}
            >
              {item.vesselName} ({item.voyage}
              {item.bound})
            </Tag>
            <Text type="secondary" className="schedule-card__distance">
              {item.distanceKm.toLocaleString()} km
            </Text>
          </div>

          <div className="schedule-card__route">
            <div className="schedule-card__endpoint schedule-card__endpoint--origin">
              {/* <div className="schedule-card__date">
                {formatCardDate(item.etd)}
              </div> */}
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
              {/* <div className="schedule-card__date">
                {formatCardDate(item.eta)}
              </div> */}
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

          <TransportTranscript item={item} onViewVessel={onViewVessel} />
        </div>

        <div className="schedule-card__actions">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.ship} size={16} />}
            onClick={() => onBookNow(item)}
            disabled={!item.bookingAllowed}
            block
          >
            Book Now
          </AppButton>
          <AppButton
            icon={<AppIcon icon={Icons.fileText} size={16} tone="download" />}
            onClick={() => onViewRates(item)}
            block
          >
            Get a Quote
          </AppButton>
          <AppButton
            type="link"
            icon={
              expanded ? (
                <AppIcon icon={Icons.route} size={14} />
              ) : (
                <AppIcon icon={Icons.route} size={14} />
              )
            }
            onClick={() => setExpanded(!expanded)}
            block
          >
            {expanded ? "Close Details" : "Show Details"}
          </AppButton>
          <div className="schedule-card__actions-secondary">
            <AppButton
              size="small"
              icon={<AppIcon icon={Icons.calculator} size={14} tone="track" />}
              onClick={() => onOpenCarbonModal(item)}
            >
              CO₂
            </AppButton>
            <AppButton
              size="small"
              icon={<AppIcon icon={Icons.ship} size={14} tone="view" />}
              onClick={() => onViewVessel(item.vesselCode)}
            >
              Vessel
            </AppButton>
          </div>
        </div>
      </div>

      {expanded ? (
        <ScheduleRouteDetails
          item={item}
          onClose={() => setExpanded(false)}
          onViewVessel={onViewVessel}
        />
      ) : null}

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
  if (isLoading) {
    return (
      <div className="schedule-empty">
        <Spin size="medium" />
        <Text type="secondary" className="schedule-empty__text">
          Searching sailings…
        </Text>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="schedule-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={4}>
              <Text strong>No sailings found</Text>
              <Text type="secondary">
                Try adjusting your ports, dates, or search type.
              </Text>
            </Space>
          }
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
