// Modified by Sekar Nagarajan (2026-09-11 12:40)
import { AppDrawer } from "@solverminds/shared-ui";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import {
  AppIcon,
  Icons,
  NavDeliveryOrderIcon,
} from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type {
  ContainerEquipment,
  ContainerMovementEvent,
} from "../types/tracking.types";

const { Title, Text } = Typography;

interface TrackingMovementDrawerProps {
  container: ContainerEquipment | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABEL: Record<ContainerEquipment["status"], string> = {
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  GATE_IN: "Gate In",
  LOADED: "Loaded",
  DISCHARGED: "Discharged",
};

const TRANSPORT_ICON: Record<
  ContainerMovementEvent["transportMode"],
  LucideIcon
> = {
  VESSEL: Icons.ship,
  TRUCK: Icons.truck,
  RAIL: Icons.truck,
  BARGE: Icons.anchor,
};

const TRANSPORT_LABEL: Record<ContainerMovementEvent["transportMode"], string> =
  {
    VESSEL: "Vessel",
    TRUCK: "Truck",
    RAIL: "Rail",
    BARGE: "Barge",
  };

function formatWeight(kg: number): string {
  return `${kg.toLocaleString("en-US")} kg`;
}

function sortMovementsNewestFirst(
  movements: ContainerMovementEvent[],
): ContainerMovementEvent[] {
  return [...movements].sort((a, b) =>
    a.eventDate < b.eventDate ? 1 : a.eventDate > b.eventDate ? -1 : 0,
  );
}

function MovementEventCard({
  event,
  isLatest,
  isLast,
}: {
  event: ContainerMovementEvent;
  isLatest: boolean;
  isLast: boolean;
}) {
  const modeIcon = TRANSPORT_ICON[event.transportMode];
  const vesselLine =
    event.vesselName || event.voyage
      ? [event.vesselName, event.voyage ? `Voy ${event.voyage}` : null]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <li
      className={[
        "tracking-movement-event",
        isLatest ? "tracking-movement-event--latest" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="tracking-movement-event__rail" aria-hidden>
        <span className="tracking-movement-event__node app-icon-inherit">
          <AppIcon icon={modeIcon} size={14} />
        </span>
        {isLast ? null : <span className="tracking-movement-event__line" />}
      </div>

      <div className="tracking-movement-event__body">
        <div className="tracking-movement-event__head">
          <div className="tracking-movement-event__title-block">
            <Text strong className="tracking-movement-event__name">
              {event.eventName}
            </Text>
            <div className="tracking-movement-event__chips">
              <span className="tracking-movement-chip tracking-movement-chip--code">
                {event.eventCode}
              </span>
              <span className="tracking-movement-chip tracking-movement-chip--mode">
                {TRANSPORT_LABEL[event.transportMode]}
              </span>
              {event.isActual ? (
                <span className="tracking-movement-chip tracking-movement-chip--actual">
                  Actual
                </span>
              ) : (
                <span className="tracking-movement-chip tracking-movement-chip--estimate">
                  Estimated
                </span>
              )}
              {isLatest ? (
                <span className="tracking-movement-chip tracking-movement-chip--latest">
                  Latest
                </span>
              ) : null}
            </div>
          </div>
          <time
            className="tracking-movement-event__time"
            dateTime={event.eventDate.replace(" ", "T")}
          >
            {event.eventDate}
          </time>
        </div>

        <div className="tracking-movement-event__meta">
          <div className="tracking-movement-event__meta-item">
            <span className="tracking-movement-event__meta-icon app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={14} />
            </span>
            <div className="tracking-movement-event__meta-copy">
              <Text className="tracking-movement-event__meta-value">
                {event.locationName}
                {event.locationCode ? (
                  <span className="tracking-movement-event__meta-code">
                    {" "}
                    ({event.locationCode})
                  </span>
                ) : null}
              </Text>
              {event.facility ? (
                <Text
                  type="secondary"
                  className="tracking-movement-event__meta-sub"
                >
                  {event.facility}
                </Text>
              ) : null}
            </div>
          </div>

          {vesselLine ? (
            <div className="tracking-movement-event__meta-item">
              <span className="tracking-movement-event__meta-icon app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
              </span>
              <div className="tracking-movement-event__meta-copy">
                <Text className="tracking-movement-event__meta-value">
                  {vesselLine}
                </Text>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function TrackingMovementDrawer({
  container,
  open,
  onClose,
}: TrackingMovementDrawerProps) {
  if (!container) return null;

  const movements = sortMovementsNewestFirst(container.movements);
  const statusClass = `tracking-movement-status tracking-movement-status--${container.status
    .toLowerCase()
    .replace(/_/g, "-")}`;

  const summaryItems = [
    { label: "Container No", value: container.containerNo },
    { label: "Size / Type", value: container.containerType },
    { label: "Seal No", value: container.sealNo },
    { label: "Tare Weight", value: formatWeight(container.tareWeightKg) },
    { label: "Payload", value: formatWeight(container.payloadKg) },
    {
      label: "Current Status",
      value: (
        <span className={statusClass}>{STATUS_LABEL[container.status]}</span>
      ),
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      dialogSize="md"
      classNames={{
        header: "tracking-movement-drawer__header-wrap",
        body: "tracking-drawer-body tracking-movement-drawer custom-scroll",
      }}
      title={
        <div className="tracking-movement-drawer__header">
          <span className="tracking-movement-drawer__header-icon app-icon-inherit">
            <AppIcon icon={NavDeliveryOrderIcon} size={20} />
          </span>
          <div className="tracking-movement-drawer__header-copy">
            <Text className="tracking-movement-drawer__eyebrow">
              Container movement
            </Text>
            <Title level={5} className="tracking-movement-drawer__heading">
              {container.containerNo}
            </Title>
            <Text type="secondary" className="tracking-movement-drawer__meta">
              {container.latestActivity}
              {" · "}
              {container.activityLocation}
            </Text>
          </div>
        </div>
      }
    >
      <section
        className="tracking-movement-summary"
        aria-label="Container summary"
      >
        <div className="tracking-movement-summary__grid">
          {summaryItems.map((item) => (
            <div key={item.label} className="tracking-movement-summary__cell">
              <Text className="tracking-movement-summary__label">
                {item.label}
              </Text>
              <div className="tracking-movement-summary__value">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="tracking-movement-timeline-section"
        aria-label="Movement event log"
      >
        <div className="tracking-movement-timeline-section__head">
          <Title
            level={5}
            className="tracking-movement-timeline-section__title"
          >
            Event timeline
          </Title>
          <Text
            type="secondary"
            className="tracking-movement-timeline-section__count"
          >
            {movements.length} {movements.length === 1 ? "event" : "events"} ·
            newest first
          </Text>
        </div>

        {movements.length > 0 ? (
          <ol className="tracking-movement-timeline">
            {movements.map((event, index) => (
              <MovementEventCard
                key={event.id}
                event={event}
                isLatest={index === 0}
                isLast={index === movements.length - 1}
              />
            ))}
          </ol>
        ) : (
          <div className="tracking-movement-empty">
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title="No movement events recorded"
            />
          </div>
        )}
      </section>
    </AppDrawer>
  );
}
