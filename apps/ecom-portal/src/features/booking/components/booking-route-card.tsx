// Modified by Sekar Nagarajan (2026-09-03 15:59)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { Fragment, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingRouteLeg, SelectedRoute } from "../types/booking.types";

const { Text, Title } = Typography;

type TransportNode =
  | { kind: "mode"; mode: "road"; label: string; icon: LucideIcon }
  | { kind: "hub"; label: string }
  | { kind: "vessel"; label: string; vesselCode: string };

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

export interface BookingRouteCardAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  type?: "primary" | "default";
}

interface BookingRouteCardProps {
  route: SelectedRoute;
  action?: BookingRouteCardAction;
  detailsMode?: "inline" | "drawer";
  expanded?: boolean;
  onToggle?: () => void;
}

function isMultimodalRoute(route: SelectedRoute): boolean {
  const legs = route.legs ?? [];
  return (
    route.shipmentKind === "Multimodal" ||
    legs.some((leg) => leg.legType === "Inland")
  );
}

function routingLabel(route: SelectedRoute): string {
  if (isMultimodalRoute(route)) {
    const moduleCount = Math.max(
      (route.legs?.length ?? 1) - 1,
      route.transshipmentCount ?? 0,
    );
    return moduleCount > 0 ? `Multimodal (${moduleCount})` : "Multimodal";
  }
  if (!route.isDirect) {
    const stops =
      route.transshipmentCount ?? Math.max((route.legs?.length ?? 1) - 1, 0);
    return stops > 0
      ? `${stops} ${stops === 1 ? "Stop" : "Stops"}`
      : "Transshipment";
  }
  return "Direct";
}

function canExpandModules(route: SelectedRoute): boolean {
  const legs = route.legs ?? [];
  if (legs.length > 0) return true;
  return isMultimodalRoute(route) || !route.isDirect;
}

function formatCardDate(value: string): string {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const yy = String(parsed.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
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

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function vesselLabel(
  leg: Pick<BookingRouteLeg | SelectedRoute, "vesselName" | "voyage" | "bound">,
): string {
  const voyage = leg.voyage ?? "";
  const bound = leg.bound ?? "";
  const suffix = `${voyage}${bound}`;
  return suffix ? `${leg.vesselName} (${suffix})` : leg.vesselName;
}

function isInlandLeg(leg: BookingRouteLeg): boolean {
  return leg.legType === "Inland";
}

function buildTransportNodes(route: SelectedRoute): TransportNode[] {
  const legs = route.legs ?? [];
  const multimodal = isMultimodalRoute(route);
  const nodes: TransportNode[] = [];

  if (multimodal) {
    nodes.push({
      kind: "mode",
      mode: "road",
      label: "Road",
      icon: Icons.truck,
    });
    nodes.push({ kind: "hub", label: route.serviceCode });
  }

  const oceanLegs = legs.filter((leg) => !isInlandLeg(leg));
  const sourceLegs = oceanLegs.length > 0 ? oceanLegs : legs;

  sourceLegs.forEach((leg, index) => {
    if (index > 0) {
      nodes.push({ kind: "hub", label: sourceLegs[index - 1]!.podPortId });
    }
    if (isInlandLeg(leg)) {
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
      vesselCode: leg.vesselCode || leg.vesselName,
    });
  });

  if (multimodal) {
    nodes.push({
      kind: "mode",
      mode: "road",
      label: "Road",
      icon: Icons.truck,
    });
  }

  if (!multimodal && sourceLegs.length <= 1) {
    return [
      { kind: "hub", label: route.serviceCode },
      {
        kind: "vessel",
        label: vesselLabel(route),
        vesselCode: route.vesselCode,
      },
    ];
  }

  if (nodes.length === 0) {
    return [
      { kind: "hub", label: route.serviceCode },
      {
        kind: "vessel",
        label: vesselLabel(route),
        vesselCode: route.vesselCode,
      },
    ];
  }

  return nodes;
}

function legOutboundBadges(
  leg: BookingRouteLeg,
  options?: { includeRoad?: boolean },
): RouteStopBadge[] {
  const badges: RouteStopBadge[] = [];
  if (options?.includeRoad || isInlandLeg(leg)) {
    badges.push({ kind: "road" });
  }
  if (!isInlandLeg(leg)) {
    if (leg.serviceCode) {
      badges.push({ kind: "hub", label: leg.serviceCode });
    }
    badges.push({
      kind: "vessel",
      label: vesselLabel(leg),
      vesselCode: leg.vesselCode || leg.vesselName,
    });
  }
  return badges;
}

function buildRouteStops(route: SelectedRoute): RouteStop[] {
  const legs = route.legs ?? [];
  const multimodal = isMultimodalRoute(route);

  if (legs.length === 0) {
    return [
      {
        id: `stop-${route.polPortId}`,
        index: 1,
        portCode: route.polPortId,
        portName: route.polPortName,
        terminal: route.polTerminal,
        etd: route.etd,
        badges: multimodal
          ? [{ kind: "road" }]
          : [
              { kind: "hub", label: route.serviceCode },
              {
                kind: "vessel",
                label: vesselLabel(route),
                vesselCode: route.vesselCode,
              },
            ],
      },
      {
        id: `stop-${route.podPortId}`,
        index: 2,
        portCode: route.podPortId,
        portName: route.podPortName,
        terminal: route.podTerminal,
        eta: route.eta,
        badges: multimodal ? [{ kind: "road" }] : [],
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
        terminal: route.polTerminal || leg.terminal,
        etd: leg.etd,
        badges: legOutboundBadges(leg, {
          includeRoad: multimodal && !isInlandLeg(leg),
        }),
      });
      return;
    }

    const prev = legs[i - 1]!;
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

  const last = legs[legs.length - 1]!;
  stops.push({
    id: `stop-${last.podPortId}-dest`,
    portCode: last.podPortId,
    portName: last.podPortName,
    terminal: route.podTerminal || last.terminal,
    eta: last.eta,
    badges: multimodal || isInlandLeg(last) ? [{ kind: "road" }] : [],
  });

  return stops.map((stop, index) => ({ ...stop, index: index + 1 }));
}

function TransportTranscript({ route }: { route: SelectedRoute }) {
  const nodes = buildTransportNodes(route);

  return (
    <div className="booking-routing-card__transport custom-scroll">
      {nodes.map((node, index) => (
        <Fragment key={`${node.kind}-${index}-${node.label}`}>
          {index > 0 ? (
            <span
              className="booking-routing-card__transport-rail"
              aria-hidden
            />
          ) : null}
          {node.kind === "hub" ? (
            <span className="booking-routing-card__transport-hub">
              {node.label}
            </span>
          ) : null}
          {node.kind === "mode" ? (
            <span className="booking-routing-card__transport-mode">
              <AppIcon icon={node.icon} size={14} />
              <span>{node.label}</span>
            </span>
          ) : null}
          {node.kind === "vessel" ? (
            <span className="booking-routing-card__transport-vessel">
              <AppIcon icon={Icons.ship} size={14} />
              <span>{node.label}</span>
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function RouteStopBadges({ badges }: { badges: RouteStopBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="booking-route-stop__badges">
      {badges.map((badge, index) => {
        if (badge.kind === "road") {
          return (
            <span
              key={`road-${index}`}
              className="booking-route-stop__badge booking-route-stop__badge--road"
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
              className="booking-route-stop__badge booking-route-stop__badge--hub"
            >
              {badge.label}
            </span>
          );
        }
        return (
          <span
            key={`vessel-${badge.vesselCode}-${index}`}
            className="booking-route-stop__badge booking-route-stop__badge--vessel"
          >
            <AppIcon icon={Icons.ship} size={12} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}

function RouteStopTimes({ eta, etd }: { eta?: string; etd?: string }) {
  const etaParts = eta ? formatDetailDateTime(eta) : null;
  const etdParts = etd ? formatDetailDateTime(etd) : null;

  return (
    <div className="booking-route-stop__times">
      {etaParts ? (
        <Text className="booking-route-stop__time">
          ETA:{" "}
          <span className="booking-route-stop__time-date">{etaParts.date}</span>
          {etaParts.time ? ` | ${etaParts.time}` : null}
        </Text>
      ) : null}
      {etdParts ? (
        <Text className="booking-route-stop__time">
          ETD:{" "}
          <span className="booking-route-stop__time-date">{etdParts.date}</span>
          {etdParts.time ? ` | ${etdParts.time}` : null}
        </Text>
      ) : null}
    </div>
  );
}

function BookingRouteDetails({ route }: { route: SelectedRoute }) {
  const stops = buildRouteStops(route);

  return (
    <div className="booking-route-details">
      <div className="booking-route-details__header">
        <Title level={5} className="booking-route-details__title">
          Route
        </Title>
      </div>

      <ol className="booking-route-timeline">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;
          return (
            <li key={stop.id} className="booking-route-stop">
              <div className="booking-route-stop__rail">
                <span className="booking-route-stop__node">{stop.index}</span>
                {isLast ? null : (
                  <span className="booking-route-stop__line" aria-hidden />
                )}
              </div>
              <div className="booking-route-stop__body">
                <div className="booking-route-stop__main">
                  <div className="booking-route-stop__location">
                    <Text className="booking-route-stop__place">
                      {portCity(stop.portName).toUpperCase()},{" "}
                      <span className="booking-route-stop__code">
                        {stop.portCode}
                      </span>
                    </Text>
                    {stop.terminal ? (
                      <Text className="booking-route-stop__terminal">
                        {stop.terminal}
                      </Text>
                    ) : null}
                    <RouteStopBadges badges={stop.badges} />
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

function RouteDeadlines({ route }: { route: SelectedRoute }) {
  if (!(route.gateInCutoff || route.siDocCutoff || route.vgmCutoff)) {
    return null;
  }

  return (
    <div className="booking-routing-card__deadlines">
      {route.gateInCutoff ? (
        <div className="booking-routing-card__deadline">
          <span className="booking-routing-card__deadline-icon booking-routing-card__deadline-icon--gate app-icon-inherit">
            <AppIcon icon={Icons.container} size={14} />
          </span>
          <span>
            <span className="booking-routing-card__deadline-label">
              Gate-In
            </span>
            <span className="booking-routing-card__deadline-value">
              {route.gateInCutoff}
            </span>
          </span>
        </div>
      ) : null}
      {route.siDocCutoff ? (
        <div className="booking-routing-card__deadline">
          <span className="booking-routing-card__deadline-icon booking-routing-card__deadline-icon--si app-icon-inherit">
            <AppIcon icon={Icons.clipboardList} size={14} />
          </span>
          <span>
            <span className="booking-routing-card__deadline-label">
              SI Cut-Off
            </span>
            <span className="booking-routing-card__deadline-value">
              {route.siDocCutoff}
            </span>
          </span>
        </div>
      ) : null}
      {route.vgmCutoff ? (
        <div className="booking-routing-card__deadline">
          <span className="booking-routing-card__deadline-icon booking-routing-card__deadline-icon--vgm app-icon-inherit">
            <AppIcon icon={Icons.shieldCheck} size={14} />
          </span>
          <span>
            <span className="booking-routing-card__deadline-label">
              VGM Cut-Off
            </span>
            <span className="booking-routing-card__deadline-value">
              {route.vgmCutoff}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function BookingRouteDetailsDrawer({
  route,
  open,
  onClose,
}: {
  route: SelectedRoute;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      dialogSize="md"
      classNames={{ body: "booking-drawer-body custom-scroll" }}
      title={
        <div className="booking-drawer-title">
          <AppIcon icon={Icons.route} size={22} />
          <div>
            <Title level={4} className="booking-drawer-title__text">
              Route Details
            </Title>
            <Text type="secondary" className="booking-drawer-title__meta">
              {route.vesselName} ({route.voyage}
              {route.bound}) · {route.serviceCode} — {route.serviceName}
            </Text>
          </div>
        </div>
      }
    >
      <div className="booking-route-details-drawer">
        <BookingRouteDetails route={route} />
        {route.gateInCutoff || route.siDocCutoff || route.vgmCutoff ? (
          <section className="booking-route-details-drawer__section">
            <Title level={5} className="booking-route-details__title">
              Cut-offs
            </Title>
            <RouteDeadlines route={route} />
          </section>
        ) : null}
      </div>
    </AppDrawer>
  );
}

export function BookingRouteCard({
  route,
  action,
  detailsMode = "inline",
  expanded = false,
  onToggle,
}: BookingRouteCardProps) {
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const expandable = canExpandModules(route);
  const label = routingLabel(route);
  const useDrawer = detailsMode === "drawer";
  const showDetailsAction = useDrawer || expandable;

  const handleShowDetails = () => {
    if (useDrawer) {
      setIsDetailsDrawerOpen(true);
      return;
    }
    onToggle?.();
  };

  return (
    <article
      className={[
        "booking-routing-card",
        route.isDefaultRoute ? "booking-routing-card--default" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="booking-routing-card__main">
        <div className="booking-routing-card__content">
          <div className="booking-routing-card__meta">
            <Tag color="blue">
              {route.serviceCode} — {route.serviceName}
            </Tag>
            <Tag>
              {route.vesselName} ({route.voyage}
              {route.bound})
            </Tag>
          </div>

          <div className="booking-routing-card__route">
            <div className="booking-routing-card__endpoint booking-routing-card__endpoint--origin">
              {/* <div className="booking-routing-card__date">
                {formatCardDate(route.etd)}
              </div> */}
              <Text className="booking-routing-card__place">
                {portCity(route.polPortName).toUpperCase()},{" "}
                <span className="booking-routing-card__port-code">
                  {route.polPortId}
                </span>
              </Text>
              <div className="booking-routing-card__etime">
                <Tag color="blue">ETD {route.etd}</Tag>
              </div>
              {route.polTerminal ? (
                <Text className="booking-routing-card__terminal">
                  Terminal: {route.polTerminal}
                </Text>
              ) : null}
            </div>

            <div className="booking-routing-card__connector">
              <div className="booking-routing-card__connector-line">
                <span className="booking-routing-card__connector-dot" />
                <span className="booking-routing-card__connector-rail" />
                <span className="booking-routing-card__connector-pill">
                  {route.transitTimeDays} Days
                </span>
                <span className="booking-routing-card__connector-rail" />
                <span className="booking-routing-card__connector-dot" />
              </div>
              <Text className="booking-routing-card__connector-type">
                {label}
              </Text>
            </div>

            <div className="booking-routing-card__endpoint booking-routing-card__endpoint--dest">
              {/* <div className="booking-routing-card__date">
                {formatCardDate(route.eta)}
              </div> */}
              <Text className="booking-routing-card__place">
                {portCity(route.podPortName).toUpperCase()},{" "}
                <span className="booking-routing-card__port-code">
                  {route.podPortId}
                </span>
              </Text>
              <div className="booking-routing-card__etime">
                <Tag color="green">ETA {route.eta}</Tag>
              </div>
              {route.podTerminal ? (
                <Text className="booking-routing-card__terminal">
                  Terminal: {route.podTerminal}
                </Text>
              ) : null}
            </div>
          </div>
        </div>

        <div className="booking-routing-card__actions">
          {action ? (
            <AppButton
              type={action.type ?? "primary"}
              icon={<AppIcon icon={action.icon} size={14} />}
              onClick={action.onClick}
              block
            >
              {action.label}
            </AppButton>
          ) : null}
          {showDetailsAction ? (
            <AppButton
              type="link"
              icon={<AppIcon icon={Icons.route} size={14} />}
              onClick={handleShowDetails}
              block
            >
              {useDrawer || !expanded ? "Show Details" : "Close Details"}
            </AppButton>
          ) : null}
        </div>
      </div>

      {useDrawer ? (
        <BookingRouteDetailsDrawer
          route={route}
          open={isDetailsDrawerOpen}
          onClose={() => setIsDetailsDrawerOpen(false)}
        />
      ) : (
        <>
          <div className="booking-routing-card__transport-wrap">
            <TransportTranscript route={route} />
          </div>
          {expanded ? <BookingRouteDetails route={route} /> : null}
          {route.gateInCutoff || route.siDocCutoff || route.vgmCutoff ? (
            <div className="booking-routing-card__footer">
              <RouteDeadlines route={route} />
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}
