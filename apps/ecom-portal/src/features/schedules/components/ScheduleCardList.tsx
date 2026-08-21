// Schedule Route Cards List Component
// Parity with SchedulebetweenlocationView.jsp detailed route panels
// Redesigned with icon-driven UI actions and rich layout per user feedback
// Modified by sekar nagarajan (2026-08-21)

import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  DollarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Divider, Empty, Row, Space, Tag, theme, Typography } from 'antd';
import { useState } from 'react';
import type { ScheduleItem } from '../types/schedules.types';

const { Text, Title } = Typography;

interface ScheduleCardListProps {
  schedules: ScheduleItem[];
  isLoading?: boolean;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

export function ScheduleCardList({
  schedules,
  isLoading,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardListProps) {
  const { token } = theme.useToken();
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  if (!isLoading && schedules.length === 0) {
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
        <Empty description="No vessel schedules found matching your route parameters" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {schedules.map((item) => {
        const isExpanded = expandedTimelineId === item.id;

        return (
          <Card
            key={item.id}
            style={{
              borderRadius: 16,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: item.isDefaultRoute ? '0 6px 20px rgba(24, 144, 255, 0.08)' : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease',
            }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            {/* Header Badge & Service Information */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <Space align="center" size={8} wrap>
                {item.isDefaultRoute && (
                  <Tag color="gold" icon={<CheckCircleOutlined />}>
                    Recommended Route
                  </Tag>
                )}
                <Tag color="blue" style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px' }}>
                  {item.serviceCode} — {item.serviceName}
                </Tag>
                {item.isDirect ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Direct Service
                  </Tag>
                ) : (
                  <Tag color="purple">
                    Transshipment ({item.transshipmentCount} {item.transshipmentCount === 1 ? 'stop' : 'stops'})
                  </Tag>
                )}
                <Tag
                  color="cyan"
                  style={{ cursor: 'pointer', padding: '4px 10px' }}
                  onClick={() => onViewVessel(item.vesselCode)}
                >
                  <CompassOutlined /> {item.vesselName} ({item.voyage}{item.bound})
                </Tag>
              </Space>

              <Text type="secondary" style={{ fontSize: 12 }}>
                Est. Distance: <b>{item.distanceKm.toLocaleString()} km</b>
              </Text>
            </div>

            {/* Main Visual Route Timeline */}
            <Row gutter={[24, 16]} align="middle">
              {/* Origin Port (POL) */}
              <Col xs={24} md={7}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: token.colorBgLayout,
                    borderLeft: `4px solid ${token.colorPrimary}`,
                  }}
                >
                  <Space align="center" size={4} style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined style={{ color: token.colorPrimary }} />
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      Departure (POL)
                    </Text>
                  </Space>
                  <Title level={4} style={{ margin: '2px 0', fontSize: 20, color: token.colorPrimary }}>
                    {item.polPortId}
                  </Title>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    {item.polPortName}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" icon={<CalendarOutlined />}>
                      ETD: {item.etd}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    Terminal: {item.polTerminal}
                  </Text>
                </div>
              </Col>

              {/* Transit Time & Route Visual Indicator */}
              <Col xs={24} md={5} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    padding: '12px 8px',
                    borderRadius: 12,
                    border: `1px dashed ${token.colorBorder}`,
                    background: '#fafafa',
                  }}
                >
                  <Space align="center" size={6} style={{ color: token.colorPrimary, fontWeight: 700, fontSize: 14 }}>
                    <ClockCircleOutlined />
                    <span>{item.transitTimeDays} Days Transit</span>
                  </Space>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '10px 0 6px',
                      color: token.colorTextDescription,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorPrimary }} />
                    <div style={{ flex: 1, height: 2, background: token.colorPrimary, margin: '0 4px' }} />
                    <CompassOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
                    <div style={{ flex: 1, height: 2, background: token.colorSuccess, margin: '0 4px' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorSuccess }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {item.isDirect ? 'Direct Sea Route' : `${item.transshipmentCount} Transshipment Stop`}
                  </Text>
                </div>
              </Col>

              {/* Destination Port (POD) */}
              <Col xs={24} md={7}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: token.colorBgLayout,
                    borderLeft: `4px solid ${token.colorSuccess}`,
                  }}
                >
                  <Space align="center" size={4} style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined style={{ color: token.colorSuccess }} />
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      Arrival (POD)
                    </Text>
                  </Space>
                  <Title level={4} style={{ margin: '2px 0', fontSize: 20, color: token.colorSuccess }}>
                    {item.podPortId}
                  </Title>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    {item.podPortName}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" icon={<CalendarOutlined />}>
                      ETA: {item.eta}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    Terminal: {item.podTerminal}
                  </Text>
                </div>
              </Col>

              {/* Action Buttons Group */}
              <Col xs={24} md={5} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AppButton
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  style={{ width: '100%', height: 38, fontWeight: 700, fontSize: 14 }}
                  onClick={() => onBookNow(item)}
                >
                  Book Shipment <ArrowRightOutlined />
                </AppButton>

                <AppButton
                  icon={<DollarOutlined />}
                  style={{ width: '100%', borderColor: token.colorPrimary, color: token.colorPrimary }}
                  onClick={() => onViewRates(item)}
                >
                  Estimate Rates
                </AppButton>

                <div style={{ display: 'flex', gap: 6 }}>
                  <AppButton
                    size="small"
                    icon={<GlobalOutlined />}
                    style={{ flex: 1, color: '#389e0d', borderColor: '#b7eb8f' }}
                    onClick={() => onOpenCarbonModal(item)}
                  >
                    CO₂ Calc
                  </AppButton>
                  <AppButton
                    size="small"
                    icon={<InfoCircleOutlined />}
                    style={{ flex: 1 }}
                    onClick={() => onViewVessel(item.vesselCode)}
                  >
                    Vessel Specs
                  </AppButton>
                </div>
              </Col>
            </Row>

            {/* Operational Deadlines & Leg Expand Bar */}
            <Divider style={{ margin: '16px 0 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Space size={12} wrap>
                <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 12, padding: '2px 8px' }}>
                  Gate-In Cut-off: <b>{item.deadlines.containerGateIn}</b>
                </Tag>
                <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 12, padding: '2px 8px' }}>
                  SI Doc Cut-off: <b>{item.deadlines.siDocClosing}</b>
                </Tag>
                <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 12, padding: '2px 8px' }}>
                  VGM Cut-off: <b>{item.deadlines.vgmClosing}</b>
                </Tag>
              </Space>

              <AppButton
                type="text"
                size="small"
                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setExpandedTimelineId(isExpanded ? null : item.id)}
              >
                {isExpanded ? 'Hide Routing Details' : 'View Leg Routing'}
              </AppButton>
            </div>

            {/* Expandable Leg Routing Timeline */}
            {isExpanded && (
              <div
                style={{
                  marginTop: 12,
                  padding: 16,
                  background: token.colorBgLayout,
                  borderRadius: 12,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                  Leg-by-Leg Vessel Schedule Sequence
                </Text>

                {item.legs.map((leg, index) => (
                  <div key={leg.id} style={{ marginBottom: index === item.legs.length - 1 ? 0 : 12 }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Tag color="cyan">{leg.legType}</Tag>
                        <Text strong style={{ fontSize: 12 }}>
                          {leg.polPortId} → {leg.podPortId}
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Text style={{ fontSize: 12 }}>
                          Vessel: <b>{leg.vesselName}</b> ({leg.voyage}
                          {leg.bound})
                        </Text>
                      </Col>
                      <Col span={10} style={{ textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          ETD: {leg.etd} &nbsp;|&nbsp; ETA: {leg.eta}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </Space>
  );
}
