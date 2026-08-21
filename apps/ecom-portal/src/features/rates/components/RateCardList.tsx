// Modified by Antigravity (2026-08-21 23:51)
// Rate Card List Component — Parity with ScheduleCardList layout
// Redesigned with icon-driven UI actions and rich layout per user feedback

import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DownOutlined,
  EyeOutlined,
  FileProtectOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Divider, Empty, Row, Space, Tag, theme, Typography } from 'antd';
import { useState } from 'react';
import { TariffDTO, ContractDTO, SurchargeDTO } from '../types/rates.types';

const { Text, Title } = Typography;

export interface CombinedRateItem {
  id: string;
  type: 'TARIFF' | 'CONTRACT' | 'SURCHARGE';
  title: string;
  code: string;
  originPort: string;
  originPortName: string;
  deliveryPort: string;
  deliveryPortName: string;
  eqpType: string;
  commodity: string;
  commodityName: string;
  currency: string;
  baseAmount: number;
  surchargeAmount: number;
  totalEstimatedAmount: number;
  effectiveFrom: string;
  effectiveTo: string;
  isRecommended?: boolean;
  surcharges?: SurchargeDTO[];
}

interface RateCardListProps {
  rates: CombinedRateItem[];
  isLoading?: boolean;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

export function RateCardList({
  rates,
  isLoading,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateCardListProps) {
  const { token } = theme.useToken();
  const [expandedSurchargeId, setExpandedSurchargeId] = useState<string | null>(null);

  if (!isLoading && rates.length === 0) {
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
        <Empty description="No published tariffs or freight rates found matching your route parameters" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {rates.map((item) => {
        const isExpanded = expandedSurchargeId === item.id;

        return (
          <Card
            key={item.id}
            style={{
              borderRadius: 16,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: item.isRecommended ? '0 6px 20px rgba(24, 144, 255, 0.08)' : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease',
            }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            {/* Header Badge & Service Contract Information */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <Space align="center" size={8} wrap>
                {item.isRecommended && (
                  <Tag color="gold" icon={<CheckCircleOutlined />}>
                    Lowest Published Freight
                  </Tag>
                )}
                <Tag color={item.type === 'CONTRACT' ? 'purple' : 'blue'} style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px' }}>
                  {item.type === 'CONTRACT' ? <FileProtectOutlined /> : <TagOutlined />} {item.code} — {item.title}
                </Tag>
                <Tag color="cyan">
                  <CalendarOutlined /> Valid: {item.effectiveFrom} to {item.effectiveTo}
                </Tag>
              </Space>

              <Text type="secondary" style={{ fontSize: 12 }}>
                Rate Ref ID: <Text code>{item.id}</Text>
              </Text>
            </div>

            {/* Route & Pricing Breakdown Grid */}
            <Row gutter={[24, 16]} align="middle">
              {/* Route Column */}
              <Col xs={24} md={10} lg={10}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <Text strong style={{ fontSize: 18, color: token.colorPrimary, display: 'block' }}>
                      {item.originPort}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {item.originPortName}
                    </Text>
                  </div>

                  <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                      PORT-TO-PORT
                    </Text>
                    <div
                      style={{
                        height: 2,
                        background: `linear-gradient(90deg, ${token.colorPrimary} 0%, #722ed1 100%)`,
                        margin: '6px 0',
                        position: 'relative',
                      }}
                    >
                      <ArrowRightOutlined
                        style={{
                          position: 'absolute',
                          right: -4,
                          top: -6,
                          color: '#722ed1',
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <Space size={4}>
                      <Tag color="blue" style={{ fontSize: 11 }}>{item.eqpType}</Tag>
                    </Space>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 18, color: token.colorPrimary, display: 'block' }}>
                      {item.deliveryPort}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {item.deliveryPortName}
                    </Text>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Commodity: <Text strong>{item.commodityName}</Text> ({item.commodity})
                  </Text>
                </div>
              </Col>

              {/* Pricing Column */}
              <Col xs={24} md={8} lg={8} style={{ borderLeft: `1px solid ${token.colorBorderSecondary}`, paddingLeft: 24 }}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Agreed Ocean Freight (OFR):</Text>
                    <Text strong style={{ fontSize: 13 }}>{item.currency} ${item.baseAmount.toFixed(2)}</Text>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Subject-to Surcharges Total:</Text>
                    <Text style={{ fontSize: 13, color: '#cf1322' }}>+ {item.currency} ${item.surchargeAmount.toFixed(2)}</Text>
                  </div>

                  <Divider style={{ margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>Estimated All-In Rate:</Text>
                    <Title level={4} style={{ margin: 0, color: '#3f8600', fontWeight: 800 }}>
                      {item.currency} ${item.totalEstimatedAmount.toFixed(2)}
                    </Title>
                  </div>
                </Space>
              </Col>

              {/* Actions Column */}
              <Col xs={24} md={6} lg={6} style={{ textAlign: 'right' }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <AppButton
                    type="primary"
                    block
                    icon={<ShoppingCartOutlined />}
                    style={{ height: 40, fontWeight: 700, borderRadius: 8 }}
                    onClick={() => onBookNow(item)}
                  >
                    Book at This Rate
                  </AppButton>

                  <Space size={8} wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <AppButton
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => onViewSurcharges(item)}
                    >
                      Surcharges
                    </AppButton>

                    <AppButton
                      size="small"
                      icon={<MailOutlined />}
                      onClick={() => onShareRate(item)}
                    >
                      Share Quote
                    </AppButton>

                    {item.surcharges && item.surcharges.length > 0 && (
                      <AppButton
                        type="text"
                        size="small"
                        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => setExpandedSurchargeId(isExpanded ? null : item.id)}
                      >
                        {isExpanded ? 'Hide Details' : 'Details'}
                      </AppButton>
                    )}
                  </Space>
                </Space>
              </Col>
            </Row>

            {/* Expandable Surcharge Breakdown Tray */}
            {isExpanded && item.surcharges && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: token.colorFillAlter,
                  border: `1px dashed ${token.colorBorder}`,
                }}
              >
                <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                  <InfoCircleOutlined style={{ color: token.colorPrimary }} /> Itemized Surcharge Breakdown:
                </Text>
                <Row gutter={[16, 8]}>
                  {item.surcharges.map((sur) => (
                    <Col xs={12} sm={8} md={6} key={sur.id}>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                        {sur.chargeCode} - {sur.chargeName}
                      </Text>
                      <Text strong style={{ fontSize: 12, color: '#cf1322' }}>
                        {sur.currency} ${sur.amount.toFixed(2)}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card>
        );
      })}
    </Space>
  );
}
