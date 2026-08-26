// Created by Sekar Nagarajan (2026-08-26 12:48)
import { Card, Typography } from "antd";

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

  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Booking / B/L Details"
      bordered={false}
    >
      <div className="vgm-meta-row">
        <div className="vgm-meta-item">
          <span className="vgm-meta-item__label">A/P Name</span>
          <span className="vgm-meta-item__value">{details.apName}</span>
        </div>
        <div className="vgm-meta-item">
          <span className="vgm-meta-item__label">Shipper Name</span>
          <span className="vgm-meta-item__value">{details.shipperName}</span>
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
        </div>

        <div className="vgm-route-connector">
          <span className="vgm-route-connector__label">Port to Port</span>
          <div className="vgm-route-connector__line">
            <span className="vgm-route-connector__dot vgm-route-connector__dot--origin" />
            <span className="vgm-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="vgm-route-connector__track" />
            <span className="vgm-route-connector__dot vgm-route-connector__dot--delivery" />
          </div>
          <AppIcon icon={Icons.truck} size={16} />
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
          <Text className="vgm-route-port__name">{deliveryPort.name}</Text>
        </div>
      </div>
    </Card>
  );
}
