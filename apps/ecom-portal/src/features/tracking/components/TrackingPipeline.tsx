// Modified by Sekar Nagarajan (2026-09-11 13:02)
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

const TRANSPORT_LABEL: Record<
  NonNullable<TrackingMilestone["transportMode"]>,
  string
> = {
  VESSEL: "Vessel",
  TRUCK: "Truck",
  RAIL: "Rail",
  BARGE: "Barge",
};

function milestoneIcon(milestone: TrackingMilestone): LucideIcon {
  if (milestone.transportMode) {
    return TRANSPORT_ICON[milestone.transportMode];
  }
  const name = milestone.stepName.toLowerCase();
  if (name.includes("gate in")) return Icons.container;
  if (name.includes("loaded")) return Icons.boxes;
  if (name.includes("departure")) return Icons.ship;
  if (name.includes("ocean") || name.includes("transit")) return Icons.ship;
  if (name.includes("discharge")) return Icons.anchor;
  if (name.includes("gate out") || name.includes("delivered")) {
    return Icons.packageCheck;
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
  if (m.isCurrent) return "In progress";
  if (m.isCompleted) return "Completed";
  return "Upcoming";
}

export function TrackingPipeline({
  milestones,
  eta,
  orientation = "horizontal",
}: TrackingPipelineProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={[
        "tracking-journey",
        isVertical ? "tracking-journey--vertical" : "tracking-journey--horizontal",
      ].join(" ")}
    >
      <div className="tracking-journey__header">
        <div className="tracking-journey__header-main">
          <span className="tracking-journey__header-icon app-icon-inherit">
            <AppIcon icon={Icons.ship} size={16} />
          </span>
          <Title level={5} className="tracking-journey__title">
            Cargo journey
          </Title>
        </div>
        <Text type="secondary" className="tracking-journey__eta">
          Estimated arrival (ETA):{" "}
          <span className="tracking-journey__eta-value">{eta}</span>
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
          const isLast = index === milestones.length - 1;
          const lineStyle = milestone.isCurrent
            ? "tracking-journey-stop__line--dotted"
            : milestone.isCompleted
              ? "tracking-journey-stop__line--solid"
              : "tracking-journey-stop__line--dotted";
          const nodeIcon = milestone.isCompleted && !milestone.isCurrent
            ? Icons.check
            : milestoneIcon(milestone);

          return (
            <li key={milestone.id} className={stopStateClass(milestone)}>
              <div className="tracking-journey-stop__rail">
                <span
                  className="tracking-journey-stop__node app-icon-inherit"
                  aria-label={statusLabel(milestone)}
                >
                  {milestone.isCurrent ? (
                    <span className="tracking-journey-stop__spin">
                      <AppIcon icon={Icons.refreshCw} size={18} />
                    </span>
                  ) : (
                    <AppIcon icon={nodeIcon} size={18} />
                  )}
                </span>
                {isLast ? null : (
                  <span
                    className={["tracking-journey-stop__line", lineStyle].join(
                      " ",
                    )}
                    aria-hidden
                  />
                )}
              </div>

              <div className="tracking-journey-stop__body">
                <Text className="tracking-journey-stop__place">
                  {milestone.stepName}
                </Text>
                <Text
                  type="secondary"
                  className="tracking-journey-stop__terminal"
                >
                  {milestone.location}
                </Text>
                <div className="tracking-journey-stop__badges">
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
                    {statusLabel(milestone)}
                  </span>
                  {milestone.transportMode ? (
                    <span className="tracking-journey-stop__badge tracking-journey-stop__badge--mode">
                      {TRANSPORT_LABEL[milestone.transportMode]}
                    </span>
                  ) : null}
                </div>
                {milestone.timestamp ? (
                  <Text className="tracking-journey-stop__time">
                    <span className="tracking-journey-stop__time-date">
                      {milestone.timestamp}
                    </span>
                  </Text>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
