// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import {
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { calculateCarbonEmissions } from "../mocks/schedules.mock";
import type {
  CarbonCalculationResult,
  ScheduleItem,
} from "../types/schedules.types";

const { Text, Title, Paragraph } = Typography;

interface ScheduleCarbonModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleCarbonModal({
  schedule,
  open,
  onClose,
}: ScheduleCarbonModalProps) {
  const [containerQty, setContainerQty] = useState<number>(1);
  const [weightTons, setWeightTons] = useState<number>(14);
  const [result, setResult] = useState<CarbonCalculationResult | null>(null);

  if (!schedule) return null;

  const routeLabel = `${schedule.polPortName} (${schedule.polPortId}) → ${schedule.podPortName} (${schedule.podPortId})`;

  const handleCalculate = () => {
    setResult(
      calculateCarbonEmissions(
        routeLabel,
        containerQty,
        weightTons,
        schedule.distanceKm,
      ),
    );
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      title={
        <Space align="center" size={8} className="schedule-drawer-title">
          <AppIcon icon={Icons.calculator} size={20} />
          <Title level={4} className="schedule-drawer-title__text">
            Cargo Carbon Footprint Calculator
          </Title>
        </Space>
      }
      // footer={
      //   <div className="schedule-drawer-footer">
      //     <AppButton danger onClick={onClose}>
      //       Cancel
      //     </AppButton>
      //   </div>
      // }
    >
      <div className="schedule-route-banner">
        <Space align="center" size={6}>
          <AppIcon icon={Icons.mapPin} size={16} tone="track" />
          <Text strong>Route: {routeLabel}</Text>
        </Space>
        <Text type="secondary" className="schedule-route-banner__meta">
          Sea Distance: <b>{schedule.distanceKm.toLocaleString()} km</b> |
          Vessel: <b>{schedule.vesselName}</b>
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleCalculate}>
        <Row gutter={16} align="bottom">
          <Col xs={24} sm={10}>
            <Form.Item
              label={
                <span className="schedule-field-label form-field-label">
                  Container Quantity (TEU)
                </span>
              }
            >
              <InputNumber
                size="large"
                min={1}
                max={100}
                value={containerQty}
                onChange={(val) => setContainerQty(val || 1)}
                className="schedule-field-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              label={
                <span className="schedule-field-label form-field-label">
                  Cargo Weight (Metric Tons)
                </span>
              }
            >
              <InputNumber
                size="large"
                min={1}
                max={1000}
                value={weightTons}
                onChange={(val) => setWeightTons(val || 14)}
                className="schedule-field-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={4}>
            <Form.Item>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.calculator} size={16} />}
                className="schedule-field-full co2-calc-btn"
                onClick={handleCalculate}
                block
              >
                Calculate
              </AppButton>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {result ? (
        <Card className="schedule-panel co2-result-card">
          <div className="schedule-co2-result-head">
            <Text strong>Estimated CO₂ Emission Breakdown</Text>
            <Tag color="green">GLEC & Clean Cargo Verified</Tag>
          </div>

          <Row gutter={[16, 16]} className="schedule-co2-metric-grid">
            <Col xs={24} sm={8}>
              <Card size="small" className="schedule-co2-metric">
                <Text type="secondary" className="schedule-co2-metric__label">
                  Total CO₂e
                </Text>
                <Title
                  level={3}
                  className="schedule-co2-metric__value schedule-co2-metric__value--success"
                >
                  {result.totalCo2eTons}{" "}
                  <span className="schedule-co2-metric__unit">tons</span>
                </Title>
                <Text type="secondary" className="schedule-co2-metric__hint">
                  Combined Lifecycle
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" className="schedule-co2-metric">
                <Text type="secondary" className="schedule-co2-metric__label">
                  Tank-To-Wheel (TTW)
                </Text>
                <Title
                  level={3}
                  className="schedule-co2-metric__value schedule-co2-metric__value--info"
                >
                  {result.ttwCo2eTons}{" "}
                  <span className="schedule-co2-metric__unit">tons</span>
                </Title>
                <Text type="secondary" className="schedule-co2-metric__hint">
                  Direct Vessel Burn
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" className="schedule-co2-metric">
                <Text type="secondary" className="schedule-co2-metric__label">
                  Well-To-Tank (WTT)
                </Text>
                <Title
                  level={3}
                  className="schedule-co2-metric__value schedule-co2-metric__value--purple"
                >
                  {result.wttCo2eTons}{" "}
                  <span className="schedule-co2-metric__unit">tons</span>
                </Title>
                <Text type="secondary" className="schedule-co2-metric__hint">
                  Upstream Fuel Production
                </Text>
              </Card>
            </Col>
          </Row>
        </Card>
      ) : null}

      <Card size="small" className="schedule-co2-note">
        <Space align="start">
          <AppIcon icon={Icons.info} size={16} />
          <Paragraph type="primary" className="schedule-co2-note__text">
            <b>Methodology Notice:</b> Calculations follow standard GLEC (Global
            Logistics Emissions Council) & IMO guidelines applying 8.5g
            CO₂/ton-km for ocean container vessels. Actual emissions may vary
            depending on weather conditions, speed adjustments, and port
            congestion.
          </Paragraph>
        </Space>
      </Card>
    </AppDrawer>
  );
}
