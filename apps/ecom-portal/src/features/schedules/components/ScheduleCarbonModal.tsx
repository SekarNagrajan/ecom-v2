// Schedule Carbon Footprint Eco Calculator Side Drawer Component
// Parity with eCommSchedules.jsp carbon-modal & user-modules AppDrawer standard
// Modified by sekar nagarajan (2026-08-21)

import { CalculatorOutlined, EnvironmentOutlined, GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { Card, Col, Form, InputNumber, Row, Space, Tag, theme, Typography } from 'antd';
import { useState } from 'react';
import { calculateCarbonEmissions } from '../mocks/schedules.mock';
import type { CarbonCalculationResult, ScheduleItem } from '../types/schedules.types';

const { Text, Title, Paragraph } = Typography;

interface ScheduleCarbonModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleCarbonModal({ schedule, open, onClose }: ScheduleCarbonModalProps) {
  const { token } = theme.useToken();
  const [containerQty, setContainerQty] = useState<number>(1);
  const [weightTons, setWeightTons] = useState<number>(14);
  const [result, setResult] = useState<CarbonCalculationResult | null>(null);

  if (!schedule) return null;

  const routeLabel = `${schedule.polPortName} (${schedule.polPortId}) → ${schedule.podPortName} (${schedule.podPortId})`;

  const handleCalculate = () => {
    const res = calculateCarbonEmissions(routeLabel, containerQty, weightTons, schedule.distanceKm);
    setResult(res);
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      title={
        <Space align="center" size={8}>
          <GlobalOutlined style={{ color: '#52c41a', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Cargo Carbon Footprint Calculator
          </Title>
        </Space>
      }
      styles={{
        body: { overflowY: 'auto', maxHeight: 'calc(100vh - 105px)', padding: '20px 24px' },
        footer: {
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '12px 20px',
          background: token.colorBgContainer,
        },
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
          <AppButton danger onClick={onClose}>
            Cancel
          </AppButton>
        </div>
      }
    >
      <div
        style={{
          background: token.colorBgLayout,
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Space align="center" size={6}>
          <EnvironmentOutlined style={{ color: token.colorPrimary }} />
          <Text strong style={{ fontSize: 13 }}>
            Route: {routeLabel}
          </Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          Sea Distance: <b>{schedule.distanceKm.toLocaleString()} km</b> | Vessel: <b>{schedule.vesselName}</b>
        </Text>
      </div>

      {/* Input Parameters Form */}
      <Form layout="vertical" onFinish={handleCalculate}>
        <Row gutter={16} align="bottom">
          <Col span={10}>
            <Form.Item label={<span style={{ fontWeight: 600 }}>Container Quantity (TEU)</span>}>
              <InputNumber
                min={1}
                max={100}
                value={containerQty}
                onChange={(val) => setContainerQty(val || 1)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label={<span style={{ fontWeight: 600 }}>Cargo Weight (Metric Tons)</span>}>
              <InputNumber
                min={1}
                max={1000}
                value={weightTons}
                onChange={(val) => setWeightTons(val || 14)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              <AppButton
                type="primary"
                icon={<CalculatorOutlined />}
                style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
                onClick={handleCalculate}
              >
                Calculate
              </AppButton>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Emission Results Panel */}
      {result && (
        <Card
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
            border: '1px solid #b7eb8f',
            marginBottom: 20,
          }}
          styles={{ body: { padding: 16 } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text strong style={{ color: '#274ee13', fontSize: 14 }}>
              Estimated CO₂ Emission Breakdown
            </Text>
            <Tag color="green">GLEC & Clean Cargo Verified</Tag>
          </div>

          <Row gutter={16} style={{ textAlign: 'center' }}>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Total CO₂e
                </Text>
                <Title level={3} style={{ margin: '4px 0', color: '#389e0d' }}>
                  {result.totalCo2eTons} <span style={{ fontSize: 12 }}>tons</span>
                </Title>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  Combined Lifecycle
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Tank-To-Wheel (TTW)
                </Text>
                <Title level={3} style={{ margin: '4px 0', color: '#096dd9' }}>
                  {result.ttwCo2eTons} <span style={{ fontSize: 12 }}>tons</span>
                </Title>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  Direct Vessel Burn
                </Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Well-To-Tank (WTT)
                </Text>
                <Title level={3} style={{ margin: '4px 0', color: '#722ed1' }}>
                  {result.wttCo2eTons} <span style={{ fontSize: 12 }}>tons</span>
                </Title>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  Upstream Fuel Production
                </Text>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Methodology Context */}
      <Card
        size="small"
        style={{ borderRadius: 8, background: token.colorBgLayout }}
        styles={{ body: { padding: 12 } }}
      >
        <Space align="start">
          <InfoCircleOutlined style={{ color: token.colorPrimary, marginTop: 2 }} />
          <Paragraph type="secondary" style={{ fontSize: 11, margin: 0 }}>
            <b>Methodology Notice:</b> Calculations follow standard GLEC (Global Logistics Emissions Council) & IMO
            guidelines applying 8.5g CO₂/ton-km for ocean container vessels. Actual emissions may vary depending on
            weather conditions, speed adjustments, and port congestion.
          </Paragraph>
        </Space>
      </Card>
    </AppDrawer>
  );
}
