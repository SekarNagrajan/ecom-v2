// KPI Cards component — parity with enhancedDashboard.jsp KPI card row
// Modified by sekar nagarajan (2026-08-21)

import {
  CheckCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  RocketOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, theme, Typography } from 'antd';
import type { DashboardCounts } from '../api/dashboard.api';

const { Text } = Typography;

interface DashboardKpiCardsProps {
  counts: DashboardCounts;
  onFilterChange: (filter: string, label: string) => void;
  activeFilter: string;
}

interface KpiCard {
  key: string;
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  accentColor: string;
  bg: string;
}

export function DashboardKpiCards({ counts, onFilterChange, activeFilter }: DashboardKpiCardsProps) {
  const { token } = theme.useToken();

  const cards: KpiCard[] = [
    {
      key: 'all',
      label: 'Total Shipments',
      value: counts.totCou,
      icon: <NodeIndexOutlined />,
      accentColor: token.colorPrimary,
      bg: `${token.colorPrimary}12`,
    },
    {
      key: 'bkConfirmed',
      label: 'Booking Confirmed',
      value: counts.bkConfirmed,
      icon: <CheckCircleOutlined />,
      accentColor: token.colorSuccess,
      bg: `${token.colorSuccess}12`,
    },
    {
      key: 'siPending',
      label: 'SI Pending',
      value: counts.siPending,
      icon: <FileTextOutlined />,
      accentColor: token.colorWarning,
      bg: `${token.colorWarning}12`,
    },
    {
      key: 'payPending',
      label: 'Payment Pending',
      value: counts.payPending,
      subValue: `USD ${counts.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <CreditCardOutlined />,
      accentColor: token.colorError,
      bg: `${token.colorError}12`,
    },
    {
      key: 'origin',
      label: 'At Origin',
      value: counts.orgCou,
      icon: <ShoppingCartOutlined />,
      accentColor: '#8B5CF6',
      bg: '#8B5CF612',
    },
    {
      key: 'inTransit',
      label: 'In Transit',
      value: counts.inTransitCou,
      icon: <RocketOutlined />,
      accentColor: '#0EA5E9',
      bg: '#0EA5E912',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      value: counts.delCou,
      icon: <TruckOutlined />,
      accentColor: '#10B981',
      bg: '#10B98112',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
        return (
          <Col key={card.key} xs={12} sm={8} md={6} lg={Math.floor(24 / 4)} xl={Math.floor(24 / 7)}>
            <Card
              hoverable
              onClick={() => onFilterChange(card.key, card.label)}
              style={{
                borderRadius: 16,
                border: isActive ? `2px solid ${card.accentColor}` : `1px solid ${token.colorBorderSecondary}`,
                cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: isActive ? `0 8px 24px ${card.accentColor}30` : '0 2px 8px rgba(0,0,0,0.04)',
                background: isActive ? card.bg : token.colorBgContainer,
              }}
              styles={{ body: { padding: '16px 18px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: card.bg,
                    color: card.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <Text style={{ fontSize: 12, color: token.colorTextSecondary, fontWeight: 500, lineHeight: 1.3 }}>
                  {card.label}
                </Text>
              </div>
              <Statistic
                value={card.value}
                valueStyle={{ fontSize: 26, fontWeight: 700, color: card.accentColor, lineHeight: 1 }}
              />
              {card.subValue && (
                <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block', fontWeight: 600 }}>
                  {card.subValue}
                </Text>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
