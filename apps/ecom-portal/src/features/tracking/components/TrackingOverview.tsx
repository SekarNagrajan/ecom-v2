// Modified by Sekar Nagarajan (2026-08-25 19:15)
import { Card, Col, Row, Space, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  TrackingMilestone,
  TrackingSearchResult,
} from "../types/tracking.types";

const { Text } = Typography;

interface TrackingOverviewProps {
  data: TrackingSearchResult;
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
  if (m.isCurrent)
    return "tracking-pipeline__step tracking-pipeline__step--current";
  if (m.isCompleted) {
    return "tracking-pipeline__step tracking-pipeline__step--completed";
  }
  return "tracking-pipeline__step";
}

export function TrackingOverview({ data }: TrackingOverviewProps) {
  const completedCount = data.milestones.filter((m) => m.isCompleted).length;
  const linePercent = Math.min(
    100,
    Math.max(
      0,
      ((completedCount - 1) / Math.max(1, data.milestones.length - 1)) * 100,
    ),
  );

  const progressStyle = {
    ["--tracking-pipeline-progress" as string]: String(linePercent),
  } as CSSProperties;

  return (
    <Card className="tracking-overview">
      <Row gutter={[16, 16]} align="middle" className="tracking-overview__meta">
        <Col xs={24} md={6}>
          <div className="tracking-meta-item">
            <AppIcon icon={Icons.ship} size={22} tone="view" />
            <div>
              <Text type="secondary" className="tracking-meta-item__label">
                Origin Port (POL)
              </Text>
              <Text strong className="tracking-meta-item__value">
                {data.polPortCode}
              </Text>
              <Text type="secondary" className="tracking-meta-item__sub">
                {data.polPortName}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div className="tracking-meta-item">
            <AppIcon icon={Icons.mapPin} size={22} tone="create" />
            <div>
              <Text type="secondary" className="tracking-meta-item__label">
                Destination (POD)
              </Text>
              <Text strong className="tracking-meta-item__value">
                {data.podPortCode}
              </Text>
              <Text type="secondary" className="tracking-meta-item__sub">
                {data.podPortName}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div className="tracking-meta-item">
            <AppIcon icon={Icons.notebook} size={22} tone="print" />
            <div>
              <Text type="secondary" className="tracking-meta-item__label">
                Booking & BL Ref
              </Text>
              <Text strong className="tracking-meta-item__value">
                {data.bookingNo}
              </Text>
              <Text type="secondary" className="tracking-meta-item__sub">
                BL: {data.blNo}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div className="tracking-meta-item">
            <AppIcon icon={Icons.ship} size={22} tone="navigate" />
            <div>
              <Text type="secondary" className="tracking-meta-item__label">
                Vessel & Voyage
              </Text>
              <Text strong className="tracking-meta-item__value">
                {data.vesselName}
              </Text>
              <Text type="secondary" className="tracking-meta-item__sub">
                Voyage: {data.voyage}
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      <div className="tracking-pipeline">
        <div className="tracking-pipeline__head">
          <Space align="center" size={8}>
            <AppIcon icon={Icons.ship} size={16} />
            <Text className="tracking-pipeline__title">
              Cargo Journey Pipeline
            </Text>
          </Space>
          <Text type="secondary" className="tracking-pipeline__eta">
            Estimated Arrival (ETA): <strong>{data.eta}</strong>
          </Text>
        </div>

        <div className="tracking-pipeline__track" style={progressStyle}>
          <div className="tracking-pipeline__line" />
          <div className="tracking-pipeline__line-progress" />
          <div className="tracking-pipeline__steps custom-scroll">
            {data.milestones.map((m) => (
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
      </div>

      <div className="tracking-deadlines">
        <Space size={6}>
          <AppIcon icon={Icons.calendar} size={16} />
          <strong>Cut-Off Deadlines:</strong>
        </Space>
        <Tooltip title="Container Gate-In Closing">
          <div className="tracking-deadline">
            <span className="tracking-deadline__icon tracking-deadline__icon--gate app-icon-inherit">
              <AppIcon icon={Icons.container} size={14} />
            </span>
            <span>
              <span className="tracking-deadline__label">Gate-In</span>
              <span className="tracking-deadline__value">
                {data.deadlines.containerGateIn}
              </span>
            </span>
          </div>
        </Tooltip>
        <Tooltip title="Shipping Instruction Document Closing">
          <div className="tracking-deadline">
            <span className="tracking-deadline__icon tracking-deadline__icon--si app-icon-inherit">
              <AppIcon icon={Icons.clipboardList} size={14} />
            </span>
            <span>
              <span className="tracking-deadline__label">SI Cut-Off</span>
              <span className="tracking-deadline__value">
                {data.deadlines.siDocClosing}
              </span>
            </span>
          </div>
        </Tooltip>
        <Tooltip title="Verified Gross Mass (VGM) Closing">
          <div className="tracking-deadline">
            <span className="tracking-deadline__icon tracking-deadline__icon--vgm app-icon-inherit">
              <AppIcon icon={Icons.shieldCheck} size={14} />
            </span>
            <span>
              <span className="tracking-deadline__label">VGM Cut-Off</span>
              <span className="tracking-deadline__value">
                {data.deadlines.vgmClosing}
              </span>
            </span>
          </div>
        </Tooltip>
      </div>
    </Card>
  );
}
