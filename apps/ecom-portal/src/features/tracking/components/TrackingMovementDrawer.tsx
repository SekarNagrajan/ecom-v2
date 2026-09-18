// Modified by Sekar Nagarajan (2026-09-17 23:52)
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

const TRANSPORT_ICON: Record<
  ContainerMovementEvent["transportMode"],
  LucideIcon
> = {
  VESSEL: Icons.ship,
  TRUCK: Icons.truck,
  RAIL: Icons.truck,
  BARGE: Icons.anchor,
};

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/** Parse "06-Aug-2026 03:00" (JSP display) for newest-first sort. */
function parseEventDate(value: string): number {
  const match = /^(\d{2})-([A-Za-z]{3})-(\d{4})\s+(\d{2}):(\d{2})/.exec(
    value.trim(),
  );
  if (!match) {
    const fallback = Date.parse(value.replace(" ", "T"));
    return Number.isNaN(fallback) ? 0 : fallback;
  }
  const [, dd, mon, yyyy, hh, mm] = match;
  const month = MONTH_INDEX[mon] ?? 0;
  return Date.UTC(Number(yyyy), month, Number(dd), Number(hh), Number(mm));
}

function sortMovementsNewestFirst(
  movements: ContainerMovementEvent[],
): ContainerMovementEvent[] {
  return [...movements].sort(
    (a, b) => parseEventDate(b.eventDate) - parseEventDate(a.eventDate),
  );
}

/** JSP-style vessel line: FIRX / NEAPOLI / 02602 / W */
function formatVesselDetails(event: ContainerMovementEvent): string | null {
  const parts = [
    event.vesselCode,
    event.vesselName,
    event.voyage,
    event.bound,
  ].filter((part): part is string => Boolean(part?.trim()));
  return parts.length > 0 ? parts.join(" / ") : null;
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
  const vesselDetails = formatVesselDetails(event);

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
          </div>
          <time
            className="tracking-movement-event__time"
            dateTime={event.eventDate}
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
              <Text
                type="secondary"
                className="tracking-movement-event__meta-label"
              >
                Activity Location:
              </Text>
              <Text className="tracking-movement-event__meta-value">
                {event.locationName}
                {event.facility ? ` · ${event.facility}` : ""}
              </Text>
            </div>
          </div>

          {vesselDetails ? (
            <div className="tracking-movement-event__meta-item">
              <span className="tracking-movement-event__meta-icon app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
              </span>
              <div className="tracking-movement-event__meta-copy">
                <Text
                  type="secondary"
                  className="tracking-movement-event__meta-label"
                >
                  Vessel Details :
                </Text>
                <Text className="tracking-movement-event__meta-value">
                  {vesselDetails}
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
            {/* <Text type="secondary" className="tracking-movement-drawer__meta">
              {container.latestActivity}
              {" · "}
              {container.activityLocation}
            </Text> */}
          </div>
        </div>
      }
    >
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
            {movements.length} {movements.length === 1 ? "event" : "events"}
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
