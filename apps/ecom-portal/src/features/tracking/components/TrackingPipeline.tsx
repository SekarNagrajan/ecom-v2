// Modified by Sekar Nagarajan (2026-09-04 16:10)
import { Space, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { TrackingMilestone } from "../types/tracking.types";

const { Text } = Typography;

export interface TrackingPipelineProps {
  milestones: TrackingMilestone[];
  eta: string;
  /** Vertical layout for drawer / narrow columns. */
  orientation?: "horizontal" | "vertical";
}

function milestoneIcon(stepName: string): LucideIcon {
  const name = stepName.toLowerCase();
  if (name.includes("gate in")) return Icons.container;
  if (name.includes("loaded")) return Icons.boxes;
  if (name.includes("departure")) return Icons.ship;
  if (name.includes("ocean") || name.includes("transit")) return Icons.network;
  if (name.includes("discharge")) return Icons.anchor;
  if (name.includes("gate out") || name.includes("delivered")) {
    return Icons.packageCheck;
  }
  return Icons.ship;
}

function stepStateClass(m: TrackingMilestone): string {
  if (m.isCurrent) {
    return "tracking-pipeline__step tracking-pipeline__step--current";
  }
  if (m.isCompleted) {
    return "tracking-pipeline__step tracking-pipeline__step--completed";
  }
  return "tracking-pipeline__step";
}

export function TrackingPipeline({
  milestones,
  eta,
  orientation = "horizontal",
}: TrackingPipelineProps) {
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const linePercent = Math.min(
    100,
    Math.max(
      0,
      ((completedCount - 1) / Math.max(1, milestones.length - 1)) * 100,
    ),
  );

  const progressStyle = {
    ["--tracking-pipeline-progress" as string]: String(linePercent),
  } as CSSProperties;

  const rootClass =
    orientation === "vertical"
      ? "tracking-pipeline tracking-pipeline--vertical"
      : "tracking-pipeline";

  return (
    <div className={rootClass}>
      <div className="tracking-pipeline__head">
        <Space align="center" size={8}>
          <AppIcon icon={Icons.ship} size={16} />
          <Text className="tracking-pipeline__title">Cargo journey</Text>
        </Space>
        <Text type="secondary" className="tracking-pipeline__eta">
          Estimated Arrival (ETA): <strong>{eta}</strong>
        </Text>
      </div>

      {orientation === "vertical" ? (
        <div className="tracking-pipeline__vertical custom-scroll">
          {milestones.map((m, index) => (
            <div key={m.id} className={stepStateClass(m)}>
              <div className="tracking-pipeline__rail">
                <div className="tracking-pipeline__badge app-icon-inherit">
                  {m.isCompleted ? (
                    <AppIcon icon={Icons.check} size={16} />
                  ) : m.isCurrent ? (
                    <span className="tracking-pipeline__spin">
                      <AppIcon icon={Icons.refreshCw} size={16} />
                    </span>
                  ) : (
                    <AppIcon icon={milestoneIcon(m.stepName)} size={16} />
                  )}
                </div>
                {index < milestones.length - 1 ? (
                  <div className="tracking-pipeline__connector" />
                ) : null}
              </div>
              <div className="tracking-pipeline__step-body">
                <Text className="tracking-pipeline__step-name">
                  {m.stepName}
                </Text>
                <Text type="secondary" className="tracking-pipeline__step-loc">
                  {m.location}
                </Text>
                <Text className="tracking-pipeline__step-time">
                  {m.timestamp}
                </Text>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tracking-pipeline__track" style={progressStyle}>
          <div className="tracking-pipeline__line" />
          <div className="tracking-pipeline__line-progress" />
          <div className="tracking-pipeline__steps custom-scroll">
            {milestones.map((m) => (
              <div key={m.id} className={stepStateClass(m)}>
                <div className="tracking-pipeline__badge app-icon-inherit">
                  {m.isCurrent ? (
                    <span className="tracking-pipeline__spin">
                      <AppIcon icon={Icons.refreshCw} size={18} />
                    </span>
                  ) : (
                    <AppIcon icon={milestoneIcon(m.stepName)} size={18} />
                  )}
                </div>
                <Text className="tracking-pipeline__step-name">
                  {m.stepName}
                </Text>
                <Text type="secondary" className="tracking-pipeline__step-loc">
                  {m.location}
                </Text>
                <Text className="tracking-pipeline__step-time">
                  {m.timestamp}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
