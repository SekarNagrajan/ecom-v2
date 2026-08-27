// Modified by Sekar Nagarajan (2026-08-26 18:52)
/**
 * Select Vessel/Route popup — JSP ebookRoutingDetails / eBookingRouteDetails parity
 * (Direct / Transshipment / Multimodal + expandable module details).
 */
import { AppButton } from "@solverminds/shared-ui";
import { useQuery } from "@tanstack/react-query";
import { Empty, Flex, Spin, Tag, Typography } from "antd";
import { useState } from "react";

import { BookingTemplateModalShell } from "../../../components/shared/booking-template-modal-shell";
import { AppIcon, Icons } from "../../../components/icons";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import type { BookingRouteLeg, SelectedRoute } from "../types/booking.types";

const { Text } = Typography;

interface RoutingSelectModalProps {
  open: boolean;
  origin: string;
  delivery: string;
  cargoReadyDate: string;
  onCancel: () => void;
  onSelect: (route: SelectedRoute) => void;
}

/** JSP show_details label: Direct / Transshipment (N) / Multimodal Shipment (N). */
function shipmentDetailsLabel(route: SelectedRoute): string {
  const legs = route.legs ?? [];
  const isMultimodal =
    route.shipmentKind === "Multimodal" ||
    legs.some((leg) => leg.legType === "Inland");
  const moduleCount = Math.max(legs.length - 1, route.transshipmentCount ?? 0);

  if (isMultimodal) {
    return moduleCount > 0
      ? `Multimodal Shipment (${moduleCount})`
      : "Multimodal Shipment";
  }
  if (!route.isDirect && moduleCount > 0) {
    return `Transshipment (${moduleCount})`;
  }
  return "Direct Shipment";
}

function shipmentKindIcon(route: SelectedRoute) {
  const legs = route.legs ?? [];
  const isMultimodal =
    route.shipmentKind === "Multimodal" ||
    legs.some((leg) => leg.legType === "Inland");
  if (isMultimodal) return Icons.truck;
  if (!route.isDirect) return Icons.ship;
  return Icons.anchor;
}

function canExpandModules(route: SelectedRoute): boolean {
  const legs = route.legs ?? [];
  if (legs.length > 1) return true;
  return (
    route.shipmentKind === "Multimodal" ||
    legs.some((leg) => leg.legType === "Inland")
  );
}

function displayLegType(leg: BookingRouteLeg): string {
  if (leg.legType === "Mainline" || leg.legType === "Feeder") return "Vessel";
  if (leg.legType === "Vessel") return "Vessel";
  return leg.legType;
}

function legTypeIcon(leg: BookingRouteLeg) {
  const label = displayLegType(leg);
  if (label === "Inland") return Icons.truck;
  if (label === "Vessel") return Icons.ship;
  return Icons.truck;
}

interface PipelinePortNode {
  key: string;
  code: string;
  name: string;
  etd?: string;
  eta?: string;
  role: "origin" | "hub" | "delivery";
}

/** Flatten legs into port nodes + move connectors for a pipeline strip. */
function buildPipeline(legs: BookingRouteLeg[]) {
  if (legs.length === 0) {
    return { ports: [] as PipelinePortNode[], moves: [] as BookingRouteLeg[] };
  }

  const ports: PipelinePortNode[] = [];
  const first = legs[0]!;
  ports.push({
    key: `port-${first.polPortId}-0`,
    code: first.polPortId,
    name: first.polPortName || first.polPortId,
    etd: first.etd,
    role: "origin",
  });

  legs.forEach((leg, index) => {
    const isLast = index === legs.length - 1;
    ports.push({
      key: `port-${leg.podPortId}-${index + 1}`,
      code: leg.podPortId,
      name: leg.podPortName || leg.podPortId,
      eta: leg.eta,
      etd: isLast ? undefined : legs[index + 1]?.etd,
      role: isLast ? "delivery" : "hub",
    });
  });

  return { ports, moves: legs };
}

function RouteModulePipeline({ legs }: { legs: BookingRouteLeg[] }) {
  const { ports, moves } = buildPipeline(legs);
  if (ports.length === 0) return null;

  return (
    <div
      className="booking-routing-pipeline custom-scroll"
      aria-label="Module pipeline"
    >
      {ports.map((port, index) => {
        const move = moves[index];
        const isVessel = move ? displayLegType(move) === "Vessel" : false;
        return (
          <div key={port.key} className="booking-routing-pipeline__segment">
            <div
              className={
                port.role === "origin"
                  ? "booking-routing-pipeline__port booking-routing-pipeline__port--origin"
                  : port.role === "delivery"
                    ? "booking-routing-pipeline__port booking-routing-pipeline__port--delivery"
                    : "booking-routing-pipeline__port booking-routing-pipeline__port--hub"
              }
            >
              <span
                className="booking-routing-pipeline__port-icon app-icon-inherit"
                aria-hidden
              >
                <AppIcon icon={Icons.mapPin} size={16} />
              </span>
              <Text
                strong
                className="booking-routing-pipeline__port-code"
              >
                {port.code}
              </Text>
              <Text
                type="secondary"
                className="booking-routing-pipeline__port-name"
              >
                {port.name}
              </Text>
              {port.etd ? (
                <Text className="booking-routing-pipeline__port-time">
                  <Text type="secondary">ETD </Text>
                  {port.etd}
                </Text>
              ) : null}
              {port.eta ? (
                <Text className="booking-routing-pipeline__port-time">
                  <Text type="secondary">ETA </Text>
                  {port.eta}
                </Text>
              ) : null}
            </div>

            {move ? (
              <div
                className={
                  isVessel
                    ? "booking-routing-pipeline__move booking-routing-pipeline__move--vessel"
                    : "booking-routing-pipeline__move booking-routing-pipeline__move--inland"
                }
              >
                <div className="booking-routing-pipeline__rail">
                  <span className="booking-routing-pipeline__dot" />
                  <span className="booking-routing-pipeline__track" />
                  <span
                    className="booking-routing-pipeline__move-icon app-icon-inherit"
                    aria-hidden
                  >
                    <AppIcon icon={legTypeIcon(move)} size={16} />
                  </span>
                  <span className="booking-routing-pipeline__track" />
                  <span className="booking-routing-pipeline__dot booking-routing-pipeline__dot--end" />
                </div>
                <Tag className="booking-routing-pipeline__move-tag">
                  {displayLegType(move)}
                </Tag>
                <Text
                  strong
                  className="booking-routing-pipeline__move-vessel"
                >
                  {move.vesselName}
                </Text>
                {isVessel && move.serviceName ? (
                  <Text
                    type="secondary"
                    className="booking-routing-pipeline__move-meta"
                  >
                    {move.serviceName}
                    {move.voyage
                      ? ` · ${move.voyage}${move.bound ? `/${move.bound}` : ""}`
                      : ""}
                  </Text>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function RoutingSelectModal({
  open,
  origin,
  delivery,
  cargoReadyDate,
  onCancel,
  onSelect,
}: RoutingSelectModalProps) {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const {
    data: routes = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: bookingKeys.routing(origin, delivery, cargoReadyDate),
    queryFn: () =>
      bookingApi.searchRouting({ origin, delivery, cargoReadyDate }),
    enabled: open && Boolean(origin && delivery && cargoReadyDate),
    // 30 seconds
    staleTime: 30_000,
  });

  if (!open && expandedRouteId !== null) {
    setExpandedRouteId(null);
  }

  const toggleModules = (routeId: string) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  return (
    <BookingTemplateModalShell
      open={open}
      onClose={onCancel}
      icon={Icons.ship}
      title="Select Vessel / Route"
      subtitle={`${origin || "—"} → ${delivery || "—"} · Cargo ready ${cargoReadyDate || "—"}`}
      dialogSize="xl"
    >
      <div className="booking-routing-modal custom-scroll">
        {isFetching ? (
          <div
            className="booking-routing-modal__loading"
            aria-label="Loading"
            role="status"
          >
            <Spin size="medium" />
          </div>
        ) : null}

        {!isFetching && isError ? (
          <Empty description="Unable to load vessel schedules. Try again." />
        ) : null}

        {!isFetching && !isError && routes.length === 0 ? (
          <Empty description="No records found for this origin and delivery." />
        ) : null}

        {!isFetching && !isError
          ? routes.map((route) => {
              const detailsLabel = shipmentDetailsLabel(route);
              const expandable = canExpandModules(route);
              const expanded = expandedRouteId === route.routeId;
              const legs = route.legs ?? [];

              return (
                <div
                  key={route.routeId}
                  className={
                    route.isDefaultRoute
                      ? "booking-routing-card booking-routing-card--default"
                      : "booking-routing-card"
                  }
                >
                  <Flex
                    align="flex-start"
                    justify="space-between"
                    gap={12}
                    wrap="wrap"
                    className="booking-routing-card__top"
                  >
                    <div className="booking-routing-card__title-block">
                      <Flex align="center" gap={8} wrap="wrap">
                        <Text strong className="booking-routing-card__service">
                          {route.serviceName}
                        </Text>
                        <Tag>{route.serviceCode}</Tag>
                        {route.isDefaultRoute ? (
                          <Tag color="gold">Default route</Tag>
                        ) : null}
                      </Flex>
                      <Text
                        type="secondary"
                        className="booking-routing-card__vessel"
                      >
                        {route.vesselName} · Voy {route.voyage}
                        {route.bound ? `/${route.bound}` : ""}
                      </Text>
                    </div>
                    <AppButton
                      type="primary"
                      icon={<AppIcon icon={Icons.check} size={14} />}
                      onClick={() => onSelect(route)}
                    >
                      Select
                    </AppButton>
                  </Flex>

                  <div className="booking-routing-card__meta">
                    <div className="booking-routing-card__meta-item">
                      <Text
                        type="secondary"
                        className="booking-routing-card__meta-label"
                      >
                        Departure (ETD)
                      </Text>
                      <Text strong>{route.etd}</Text>
                      <Text type="secondary">
                        {route.polTerminal || route.polPortId}
                      </Text>
                    </div>
                    <div className="booking-routing-card__meta-item booking-routing-card__meta-item--center">
                      <Text
                        type="secondary"
                        className="booking-routing-card__meta-label"
                      >
                        Transit
                      </Text>
                      <Text strong>{route.transitTimeDays} days</Text>
                    </div>
                    <div className="booking-routing-card__meta-item">
                      <Text
                        type="secondary"
                        className="booking-routing-card__meta-label"
                      >
                        Arrival (ETA)
                      </Text>
                      <Text strong>{route.eta}</Text>
                      <Text type="secondary">
                        {route.podTerminal || route.podPortId}
                      </Text>
                    </div>
                  </div>

                  <div className="booking-routing-card__shipment">
                    {expandable ? (
                      <button
                        type="button"
                        className="booking-routing-card__shipment-toggle"
                        aria-expanded={expanded}
                        onClick={() => toggleModules(route.routeId)}
                      >
                        <span
                          className="booking-routing-card__shipment-icon app-icon-inherit"
                          aria-hidden
                        >
                          <AppIcon icon={shipmentKindIcon(route)} size={14} />
                        </span>
                        <span>{detailsLabel}</span>
                        <AppIcon
                          icon={expanded ? Icons.chevronUp : Icons.chevronDown}
                          size={14}
                        />
                      </button>
                    ) : (
                      <Text
                        type="secondary"
                        className="booking-routing-card__shipment-static"
                      >
                        <span
                          className="booking-routing-card__shipment-icon app-icon-inherit"
                          aria-hidden
                        >
                          <AppIcon icon={shipmentKindIcon(route)} size={14} />
                        </span>
                        {detailsLabel}
                      </Text>
                    )}
                  </div>

                  {expanded && legs.length > 0 ? (
                    <RouteModulePipeline legs={legs} />
                  ) : null}

                  {(route.gateInCutoff ||
                    route.siDocCutoff ||
                    route.vgmCutoff) && (
                    <div className="booking-routing-card__cutoffs">
                      {route.gateInCutoff ? (
                        <Text type="secondary">
                          Gate-in: <Text>{route.gateInCutoff}</Text>
                        </Text>
                      ) : null}
                      {route.siDocCutoff ? (
                        <Text type="secondary">
                          SI/Doc: <Text>{route.siDocCutoff}</Text>
                        </Text>
                      ) : null}
                      {route.vgmCutoff ? (
                        <Text type="secondary">
                          VGM: <Text>{route.vgmCutoff}</Text>
                        </Text>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          : null}
      </div>
    </BookingTemplateModalShell>
  );
}
