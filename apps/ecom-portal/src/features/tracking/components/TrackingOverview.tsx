// Tracking Route Overview & Milestone Timeline Component
// Redesigned with custom maritime/shipping icons for logistics milestones
// Modified by Antigravity (2026-08-21 18:37)

import {
  CalendarOutlined,
  CompassOutlined,
  FlagOutlined,
  NodeIndexOutlined,
  RocketOutlined,
  SyncOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Space, Tag, theme, Typography } from 'antd';
import type { TrackingMilestone, TrackingSearchResult } from '../types/tracking.types';

const { Text } = Typography;

interface TrackingOverviewProps {
  data: TrackingSearchResult;
}

// 🚢 Custom Dedicated Shipping & Maritime Icons
const GateInShippingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="13" height="9" rx="1" />
    <path d="M14 9h4l3 3v3h-7V9z" />
    <circle cx="5.5" cy="17.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor" />
    <path d="M5 10l3 3 5-5" strokeWidth="2" />
  </svg>
);

const VesselLoadingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 17l2 3h16l2-3H2z" />
    <path d="M4 14h16" />
    <rect x="5" y="7" width="5" height="5" rx="0.5" />
    <rect x="12" y="7" width="5" height="5" rx="0.5" />
    <path d="M12 2v3m0 0l-2-2m2 2l2-2" />
  </svg>
);

const VesselSailingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 19c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
    <path d="M3 15l2.5 3h13l2.5-3H3z" />
    <path d="M12 4v8" />
    <path d="M12 4l6 3.5H12" />
    <path d="M6 8.5l4 2H6" />
  </svg>
);

const OceanTransportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8" />
    <path d="M3.6 15h16.8" />
    <path d="M11.5 3a13 13 0 0 0 0 18" />
    <path d="M12.5 3a13 13 0 0 1 0 18" />
  </svg>
);

const VesselDischargeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 17l2 3h16l2-3H2z" />
    <rect x="7" y="10" width="10" height="5" rx="0.5" />
    <path d="M12 2v5m0 0l-2-2m2 2l2-2" />
  </svg>
);

const GateOutDeliveredIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const getShippingStepIcon = (m: TrackingMilestone) => {
  const name = m.stepName.toLowerCase();
  if (name.includes('gate in')) return <GateInShippingIcon />;
  if (name.includes('loaded')) return <VesselLoadingIcon />;
  if (name.includes('departure')) return <VesselSailingIcon />;
  if (name.includes('ocean') || name.includes('transit')) return <OceanTransportIcon />;
  if (name.includes('discharge')) return <VesselDischargeIcon />;
  if (name.includes('gate out') || name.includes('delivered')) return <GateOutDeliveredIcon />;
  return <VesselSailingIcon />;
};

export function TrackingOverview({ data }: TrackingOverviewProps) {
  const { token } = theme.useToken();

  const completedCount = data.milestones.filter((m) => m.isCompleted).length;
  const linePercent = Math.min(100, Math.max(0, ((completedCount - 1) / (data.milestones.length - 1)) * 100));

  return (
    <Card
      style={{
        borderRadius: 14,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: 20,
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      {/* Route & Reference Info Bar */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} md={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CompassOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>
                Origin Port (POL)
              </Text>
              <Text strong style={{ fontSize: 15 }}>
                {data.polPortCode}
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                {data.polPortName}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlagOutlined style={{ fontSize: 22, color: token.colorSuccess }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>
                Destination (POD)
              </Text>
              <Text strong style={{ fontSize: 15 }}>
                {data.podPortCode}
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                {data.podPortName}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TagOutlined style={{ fontSize: 22, color: token.colorWarning }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>
                Booking & BL Ref
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {data.bookingNo}
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                BL: {data.blNo}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RocketOutlined style={{ fontSize: 22, color: token.colorInfo }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>
                Vessel & Voyage
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {data.vesselName}
              </Text>
              <Tag color="blue" style={{ marginTop: 2, borderRadius: 8 }}>
                Voyage: {data.voyage}
              </Tag>
            </div>
          </div>
        </Col>
      </Row>

      {/* Redesigned Milestone Pipeline Container with Maritime Shipping Icons */}
      <div
        style={{
          background: token.colorFillAlter,
          padding: '20px 24px',
          borderRadius: 12,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Space align="center" size={8}>
            <NodeIndexOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 14 }}>
              Cargo Journey Pipeline
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Estimated Arrival (ETA): <strong>{data.eta}</strong>
          </Text>
        </div>

        {/* Milestone Steps Pipeline Row */}
        <div style={{ position: 'relative', padding: '10px 0' }}>
          {/* Base Horizontal Track Line */}
          <div
            style={{
              position: 'absolute',
              top: 23,
              left: '8%',
              right: '8%',
              height: 4,
              background: token.colorBorderSecondary,
              borderRadius: 2,
              zIndex: 0,
            }}
          />

          {/* Active Completed Track Line */}
          <div
            style={{
              position: 'absolute',
              top: 23,
              left: '8%',
              width: `calc(${linePercent}% * 0.84)`,
              height: 4,
              background: token.colorSuccess,
              borderRadius: 2,
              zIndex: 0,
              transition: 'width 0.5s ease',
            }}
          />

          <Row justify="space-between" align="top" style={{ position: 'relative', zIndex: 1 }}>
            {data.milestones.map((m) => {
              const isCompleted = m.isCompleted;
              const isCurrent = m.isCurrent;

              const iconBg = isCompleted
                ? token.colorSuccess
                : isCurrent
                ? token.colorPrimary
                : token.colorBgContainer;

              const iconBorder = isCompleted
                ? token.colorSuccess
                : isCurrent
                ? token.colorPrimary
                : token.colorBorder;

              const iconColor = isCompleted || isCurrent ? '#ffffff' : token.colorTextQuaternary;

              return (
                <Col key={m.id} style={{ textAlign: 'center', flex: 1, padding: '0 4px' }}>
                  {/* 1. Shipping Icon First (Top Circle Badge) */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: iconBg,
                      border: `2px solid ${iconBorder}`,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      boxShadow: isCurrent
                        ? `0 0 0 4px ${token.colorPrimaryBg}`
                        : isCompleted
                        ? `0 0 0 3px ${token.colorSuccessBg}`
                        : '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCurrent ? <SyncOutlined spin style={{ fontSize: 18 }} /> : getShippingStepIcon(m)}
                  </div>

                  {/* 2. Step Name & Info Down Below Icon */}
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      display: 'block',
                      color: isCompleted || isCurrent ? token.colorText : token.colorTextSecondary,
                    }}
                  >
                    {m.stepName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    {m.location}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      display: 'block',
                      marginTop: 2,
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCompleted
                        ? token.colorSuccess
                        : isCurrent
                        ? token.colorPrimary
                        : token.colorTextQuaternary,
                    }}
                  >
                    {m.timestamp}
                  </Text>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>

      {/* Cut-off Deadlines Pill Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 12,
          color: token.colorTextSecondary,
        }}
      >
        <Space size={6}>
          <CalendarOutlined style={{ color: token.colorWarning }} />
          <strong>Cut-Off Deadlines:</strong>
        </Space>
        <Tag color="orange">Gate-In: {data.deadlines.containerGateIn}</Tag>
        <Tag color="purple">SI Doc: {data.deadlines.siDocClosing}</Tag>
        <Tag color="cyan">VGM: {data.deadlines.vgmClosing}</Tag>
      </div>
    </Card>
  );
}
