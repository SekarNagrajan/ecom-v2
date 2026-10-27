// Modified by Sekar Nagarajan (2026-10-27 11:10)
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../components/icons";
import type { TrackingMilestone } from "../types/tracking.types";

const { Text, Title } = Typography;

export interface TrackingPipelineProps {
  milestones: TrackingMilestone[];
  eta: string;
  /** Horizontal (default) overview strip, or vertical compact drawer rail. */
  orientation?: "horizontal" | "vertical";
}

const TRANSPORT_ICON: Record<
  NonNullable<TrackingMilestone["transportMode"]>,
  LucideIcon
> = {
  VESSEL: Icons.ship,
  TRUCK: Icons.truck,
  RAIL: Icons.truck,
  BARGE: Icons.anchor,
};

/**
 * Pipeline progress icons — match shipment steps from buildMilestones:
 * Booking → Empty Pick-up → Pre-carriage → Gate In → Loaded →
 * Transhipment → Discharged → On-carriage → Delivered.
 */
function milestoneIcon(milestone: TrackingMilestone): LucideIcon {
  const name = milestone.stepName.toLowerCase();

  if (name.includes("book")) return Icons.fileCheck;
  if (name.includes("pick")) return Icons.container;
  if (name.includes("pre-carriage") || name.includes("on-carriage")) {
    return milestone.transportMode
      ? TRANSPORT_ICON[milestone.transportMode]
      : Icons.truck;
  }
  if (name.includes("gate in")) return Icons.truck;
  if (name.includes("loaded") || name.includes("on board")) return Icons.ship;
  if (name.includes("tranship") || name.includes("transship")) {
    return Icons.boxes;
  }
  if (name.includes("discharge")) return Icons.anchor;
  if (name.includes("delivered") || name.includes("gate out")) {
    return Icons.packageCheck;
  }

  if (milestone.transportMode) {
    return TRANSPORT_ICON[milestone.transportMode];
  }
  return Icons.mapPin;
}

function stopStateClass(m: TrackingMilestone): string {
  const parts = ["tracking-journey-stop"];
  if (m.isCurrent) parts.push("tracking-journey-stop--current");
  else if (m.isCompleted) parts.push("tracking-journey-stop--completed");
  else parts.push("tracking-journey-stop--upcoming");
  return parts.join(" ");
}

function statusLabel(m: TrackingMilestone): string {
  if (m.isCurrent) return "In Progress";
  if (m.isCompleted) return "Completed";
  return "Upcoming";
}

function statusBadgeIcon(m: TrackingMilestone): LucideIcon {
  if (m.isCurrent) return Icons.history;
  if (m.isCompleted) return Icons.checkCircle;
  return Icons.clock;
}

function connectorLineClass(m: TrackingMilestone | undefined): string {
  if (!m) return "tracking-journey-stop__line--dotted";
  if (m.isCompleted && !m.isCurrent) {
    return "tracking-journey-stop__line--solid";
  }
  return "tracking-journey-stop__line--dotted";
}

function lastUpdatedLabel(
  milestones: TrackingMilestone[],
  eta: string,
): string {
  const stamped = [...milestones]
    .reverse()
    .find((m) => (m.isCompleted || m.isCurrent) && m.timestamp);
  return stamped?.timestamp || eta || "—";
}

export function TrackingPipeline({
  milestones,
  eta,
  orientation = "horizontal",
}: TrackingPipelineProps) {
  const isVertical = orientation === "vertical";
  const updatedAt = lastUpdatedLabel(milestones, eta);

  return (
    <div
      className={[
        "tracking-journey",
        isVertical
          ? "tracking-journey--vertical"
          : "tracking-journey--horizontal",
      ].join(" ")}
    >
      <div className="tracking-journey__header">
        <div className="tracking-journey__header-main">
          <span className="tracking-journey__header-icon app-icon-inherit">
            <AppIcon icon={Icons.ship} size={16} />
          </span>
          <Title level={5} className="tracking-journey__title">
            Cargo Journey
          </Title>
        </div>
        <Text type="secondary" className="tracking-journey__updated">
          Last updated:{" "}
          <span className="tracking-journey__updated-value">{updatedAt}</span>
        </Text>
      </div>

      <ol
        className={[
          "tracking-journey-timeline",
          "custom-scroll",
          isVertical
            ? "tracking-journey-timeline--vertical"
            : "tracking-journey-timeline--horizontal",
        ].join(" ")}
      >
        {milestones.map((milestone, index) => {
          const isFirst = index === 0;
          const isLast = index === milestones.length - 1;
          const prev = isFirst ? undefined : milestones[index - 1];
          const beforeLine = connectorLineClass(prev);
          const afterLine = connectorLineClass(milestone);
          const nodeIcon = milestoneIcon(milestone);
          const badgeIcon = statusBadgeIcon(milestone);

          return (
            <li key={milestone.id} className={stopStateClass(milestone)}>
              <div className="tracking-journey-stop__rail">
                {isVertical ? null : (
                  <span
                    className={[
                      "tracking-journey-stop__line",
                      "tracking-journey-stop__line--before",
                      beforeLine,
                      isFirst ? "tracking-journey-stop__line--ghost" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  />
                )}
                <span
                  className="tracking-journey-stop__node app-icon-inherit"
                  aria-label={statusLabel(milestone)}
                >
                  {milestone.isCurrent ? (
                    <span
                      className="tracking-journey-stop__node-pulse"
                      aria-hidden
                    />
                  ) : null}
                  <AppIcon icon={nodeIcon} size={18} />
                </span>
                {isLast && isVertical ? null : (
                  <span
                    className={[
                      "tracking-journey-stop__line",
                      "tracking-journey-stop__line--after",
                      afterLine,
                      isLast && !isVertical
                        ? "tracking-journey-stop__line--ghost"
                        : "",
                      isLast && isVertical
                        ? "tracking-journey-stop__line--hidden"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  />
                )}
              </div>

              <div className="tracking-journey-stop__body">
                <Text
                  className="tracking-journey-stop__place"
                  ellipsis={{ tooltip: milestone.stepName }}
                >
                  {milestone.stepName}
                </Text>
                <Text
                  type="secondary"
                  className="tracking-journey-stop__terminal"
                  ellipsis={{ tooltip: milestone.location }}
                >
                  {milestone.location}
                </Text>
                <span
                  className={[
                    "tracking-journey-stop__badge",
                    milestone.isCurrent
                      ? "tracking-journey-stop__badge--current"
                      : milestone.isCompleted
                        ? "tracking-journey-stop__badge--done"
                        : "tracking-journey-stop__badge--todo",
                  ].join(" ")}
                >
                  <span className="tracking-journey-stop__badge-icon app-icon-inherit">
                    <AppIcon icon={badgeIcon} size={12} />
                  </span>
                  {statusLabel(milestone)}
                </span>
                {milestone.timestamp ? (
                  <Text className="tracking-journey-stop__time">
                    <span className="tracking-journey-stop__time-date">
                      {milestone.timestamp}
                    </span>
                  </Text>
                ) : (
                  <Text className="tracking-journey-stop__time tracking-journey-stop__time--empty">
                    —
                  </Text>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
