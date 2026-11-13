// Modified by Sekar Nagarajan (2026-11-13 02:00)
/**
 * Cargo journey strip: the shared `AppTimeline` renders the steps; this component only maps
 * tracking milestones to timeline items (icons per step, status, "last updated" header).
 */
import { AppTimeline, type AppTimelineItem } from "@solverminds/shared-ui";
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

const TRANSPORT_ICON: Record<NonNullable<TrackingMilestone["transportMode"]>, LucideIcon> = {
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
    return milestone.transportMode ? TRANSPORT_ICON[milestone.transportMode] : Icons.truck;
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

function milestoneStatus(m: TrackingMilestone): AppTimelineItem["status"] {
  if (m.isCurrent) return "current";
  if (m.isCompleted) return "done";
  return "upcoming";
}

function lastUpdatedLabel(milestones: TrackingMilestone[], eta: string): string {
  const stamped = [...milestones]
    .reverse()
    .find((m) => (m.isCompleted || m.isCurrent) && m.timestamp);
  return stamped?.timestamp || eta || "—";
}

export function toJourneyTimelineItems(milestones: TrackingMilestone[]): AppTimelineItem[] {
  return milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.stepName,
    subtitle: milestone.location,
    timestamp: milestone.timestamp,
    status: milestoneStatus(milestone),
    icon: (
      <span className="app-icon-inherit">
        <AppIcon icon={milestoneIcon(milestone)} size={18} />
      </span>
    ),
  }));
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
        isVertical ? "tracking-journey--vertical" : "tracking-journey--horizontal",
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
          Last updated: <span className="tracking-journey__updated-value">{updatedAt}</span>
        </Text>
      </div>

      <AppTimeline
        items={toJourneyTimelineItems(milestones)}
        orientation={orientation}
        ariaLabel="Cargo journey"
        statusLabels={{ current: "In Progress", done: "Completed", upcoming: "Upcoming" }}
        maxHeight={isVertical ? 420 : undefined}
        className="custom-scroll"
      />
    </div>
  );
}
