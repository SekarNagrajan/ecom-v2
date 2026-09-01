// Created by Sekar Nagarajan (2026-08-26 12:48)
// Modified by Sekar Nagarajan (2026-09-01 00:44) — collapsible card (default closed)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { VgmReferenceDetailsDTO } from "../types/vgm.types";
import { parsePortLabel } from "../utils/vgm.utils";

const { Text, Title } = Typography;

interface VgmReferenceStripProps {
  details: VgmReferenceDetailsDTO;
}

export function VgmReferenceStrip({ details }: VgmReferenceStripProps) {
  const originPort = parsePortLabel(details.origin || details.pol || "");
  const deliveryPort = parsePortLabel(details.delivery || details.pod || "");
  const polPort = parsePortLabel(details.pol || "");
  const podPort = parsePortLabel(details.pod || "");
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Booking / B/L Details"
      bordered={false}
      extra={
        <div className="vgm-header-extra">
          <div className="vgm-meta-row vgm-meta-row--header">
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">A/P Name</span>
              <span className="vgm-meta-item__value">{details.apName}</span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">Shipper Name</span>
              <span className="vgm-meta-item__value">
                {details.shipperName}
              </span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">VGM POL</span>
              <span className="vgm-meta-item__value">{details.pol}</span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">VGM POD</span>
              <span className="vgm-meta-item__value">{details.pod}</span>
            </div>
          </div>
          <Tooltip title={open ? "Collapse details" : "Expand details"}>
            <AppButton
              type="text"
              size="small"
              aria-label={open ? "Collapse details" : "Expand details"}
              icon={
                <AppIcon
                  icon={open ? Icons.chevronUp : Icons.chevronDown}
                  size={18}
                />
              }
              onClick={() => setOpen((prev) => !prev)}
            />
          </Tooltip>
        </div>
      }
    >
      {open ? (
        <>
          {/* Modified by Sekar Nagarajan (2026-09-01 00:50) — schedule-card style route + more info */}
          <div className="vgm-route-card">
            <div className="vgm-route-card__tags">
              <Tag color="blue">
                {details.type === "blno" ? "B/L" : "Booking"} ·{" "}
                {details.referenceNo}
              </Tag>
              <Tag color="geekblue">Port to Port</Tag>
              <Tag color="cyan">{details.shipperName}</Tag>
            </div>

            <div className="vgm-route-strip">
              <div className="vgm-route-port vgm-route-port--origin">
                <div className="vgm-route-port__label">
                  <AppIcon icon={Icons.mapPin} size={14} />
                  Origin
                </div>
                <Title
                  level={4}
                  className="vgm-route-port__code vgm-route-port__code--origin"
                >
                  {originPort.code}
                </Title>
                <Text className="vgm-route-port__name">{originPort.name}</Text>
                <div className="vgm-route-port__extra">
                  <span className="vgm-route-port__extra-label">
                    Port of Loading
                  </span>
                  <span className="vgm-route-port__extra-value">
                    {polPort.code} — {polPort.name}
                  </span>
                </div>
              </div>

              <div className="vgm-route-connector">
                <span className="vgm-route-connector__label">Port to Port</span>
                <div className="vgm-route-connector__line">
                  <span className="vgm-route-connector__dot vgm-route-connector__dot--origin" />
                  <span className="vgm-route-connector__track" />
                  <AppIcon icon={Icons.ship} size={14} />
                  <span className="vgm-route-connector__track" />
                  <span className="vgm-route-connector__dot vgm-route-connector__dot--delivery" />
                </div>
                <span className="vgm-route-connector__pill">Ocean</span>
              </div>

              <div className="vgm-route-port vgm-route-port--delivery">
                <div className="vgm-route-port__label">
                  <AppIcon icon={Icons.mapPin} size={14} />
                  Delivery
                </div>
                <Title
                  level={4}
                  className="vgm-route-port__code vgm-route-port__code--delivery"
                >
                  {deliveryPort.code}
                </Title>
                <Text className="vgm-route-port__name">
                  {deliveryPort.name}
                </Text>
                <div className="vgm-route-port__extra">
                  <span className="vgm-route-port__extra-label">
                    Port of Discharge
                  </span>
                  <span className="vgm-route-port__extra-value">
                    {podPort.code} — {podPort.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}
