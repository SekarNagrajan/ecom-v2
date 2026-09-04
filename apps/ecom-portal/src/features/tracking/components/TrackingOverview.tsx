// Modified by Sekar Nagarajan (2026-09-04 17:15)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Space, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { TrackingSearchResult } from "../types/tracking.types";
import { TrackingPipeline } from "./TrackingPipeline";

const { Text } = Typography;

interface TrackingOverviewProps {
  data: TrackingSearchResult;
}

/** Meta summary row; cargo journey + cut-offs expand via header dropdown. */
export function TrackingOverview({ data }: TrackingOverviewProps) {
  const [journeyOpen, setJourneyOpen] = useState(false);

  return (
    <Card className="tracking-overview">
      <div className="tracking-overview__header">
        <Row
          gutter={[16, 16]}
          align="middle"
          className="tracking-overview__meta"
        >
          <Col xs={24} sm={12} lg={6}>
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

          <Col xs={24} sm={12} lg={6}>
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

          <Col xs={24} sm={12} lg={5}>
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

          <Col xs={24} sm={12} lg={5}>
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

          <Col xs={24} lg={2} className="tracking-overview__toggle-col">
            <Tooltip
              title={
                journeyOpen ? "Hide Cargo Journey" : "Show Cargo Journey"
              }
            >
              <AppButton
                appVariant="ghost"
                className={[
                  "tracking-overview__toggle",
                  journeyOpen ? "tracking-overview__toggle--open" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-expanded={journeyOpen}
                aria-controls="tracking-overview-journey"
                onClick={() => setJourneyOpen((open) => !open)}
                icon={
                  <AppIcon
                    icon={journeyOpen ? Icons.chevronUp : Icons.chevronDown}
                    size={20}
                  />
                }
              />
            </Tooltip>
          </Col>
        </Row>
      </div>

      {journeyOpen ? (
        <div
          id="tracking-overview-journey"
          className="tracking-overview__journey"
        >
          <TrackingPipeline milestones={data.milestones} eta={data.eta} />

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
        </div>
      ) : null}
    </Card>
  );
}
