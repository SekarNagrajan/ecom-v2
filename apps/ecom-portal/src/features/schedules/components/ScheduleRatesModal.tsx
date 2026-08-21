// Schedule Freight Rates Estimator Side Drawer Component
// Parity with legacy eCommSchedules.jsp view_rates & view_rates_details modals
// Standardized using user-modules AppDrawer architecture
// Modified by sekar nagarajan (2026-08-21)

import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { Card, Col, Input, InputNumber, Row, Space, Switch, Table, theme, Typography } from 'antd';
import { useState } from 'react';
import type { ScheduleItem } from '../types/schedules.types';

const { Text, Title } = Typography;

interface ScheduleRatesModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
  onProceedBooking: (schedule: ScheduleItem) => void;
}

export function ScheduleRatesModal({
  schedule,
  open,
  onClose,
  onProceedBooking,
}: ScheduleRatesModalProps) {
  const { token } = theme.useToken();

  const [qty20ft, setQty20ft] = useState<number>(1);
  const [reefer20ft, setReefer20ft] = useState<boolean>(false);

  const [qty40ft, setQty40ft] = useState<number>(0);
  const [reefer40ft, setReefer40ft] = useState<boolean>(false);

  const [qty40hc, setQty40hc] = useState<number>(0);
  const [reefer40hc, setReefer40hc] = useState<boolean>(false);

  const [commodity, setCommodity] = useState<string>('General Cargo (FAK)');

  if (!schedule) return null;

  // Base mock prices
  const basePrice20 = reefer20ft ? 2200 : 1450;
  const basePrice40 = reefer40ft ? 3400 : 2100;
  const basePrice40hc = reefer40hc ? 3600 : 2250;

  const total20 = qty20ft * basePrice20;
  const total40 = qty40ft * basePrice40;
  const total40hc = qty40hc * basePrice40hc;

  const bafSurcharge = (qty20ft + qty40ft + qty40hc) * 180; // Bunker adjustment factor
  const thcSurcharge = (qty20ft + qty40ft + qty40hc) * 220; // Terminal handling charge

  const grandTotal = total20 + total40 + total40hc + bafSurcharge + thcSurcharge;

  const surchargeColumns = [
    {
      title: 'Charge Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Rate / Unit',
      dataIndex: 'unitRate',
      key: 'unitRate',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: 'Qty / Cont',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Subtotal Amount',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (val: number) => <b>${val.toLocaleString()} USD</b>,
    },
  ];

  const surchargeData = [
    { key: '1', description: 'Ocean Freight - 20FT Standard Dry', unitRate: basePrice20, qty: qty20ft, subtotal: total20 },
    { key: '2', description: 'Ocean Freight - 40FT Standard Dry', unitRate: basePrice40, qty: qty40ft, subtotal: total40 },
    { key: '3', description: 'Ocean Freight - 40FT High Cube', unitRate: basePrice40hc, qty: qty40hc, subtotal: total40hc },
    { key: '4', description: 'BAF - Bunker Adjustment Factor', unitRate: 180, qty: qty20ft + qty40ft + qty40hc, subtotal: bafSurcharge },
    { key: '5', description: 'THC - Terminal Handling Charge (POL)', unitRate: 220, qty: qty20ft + qty40ft + qty40hc, subtotal: thcSurcharge },
  ].filter((d) => d.qty > 0);

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      title={
        <Space align="center" size={8}>
          <DollarOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Freight Rates & Surcharge Estimator
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
          <AppButton
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              onClose();
              onProceedBooking(schedule);
            }}
          >
            Book Now
          </AppButton>
        </div>
      }
    >
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Route: <b>{schedule.polPortName}</b> → <b>{schedule.podPortName}</b> | Service: <b>{schedule.serviceCode}</b>
        </Text>
      </div>

      {/* Equipment Quantity & Type Options */}
      <Card
        size="small"
        title="Equipment Selection"
        style={{ borderRadius: 12, marginBottom: 20 }}
        styles={{ header: { background: token.colorBgLayout } }}
      >
        <Row gutter={[16, 12]} align="middle" style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Text strong style={{ color: token.colorPrimary }}>
              20 FT Standard
            </Text>
          </Col>
          <Col span={8}>
            <InputNumber min={0} max={50} value={qty20ft} onChange={(val) => setQty20ft(val || 0)} />
          </Col>
          <Col span={8}>
            <Space align="center">
              <Text style={{ fontSize: 12 }}>Reefer Temp Controlled</Text>
              <Switch size="small" checked={reefer20ft} onChange={setReefer20ft} />
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 12]} align="middle" style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Text strong style={{ color: token.colorPrimary }}>
              40 FT Standard
            </Text>
          </Col>
          <Col span={8}>
            <InputNumber min={0} max={50} value={qty40ft} onChange={(val) => setQty40ft(val || 0)} />
          </Col>
          <Col span={8}>
            <Space align="center">
              <Text style={{ fontSize: 12 }}>Reefer Temp Controlled</Text>
              <Switch size="small" checked={reefer40ft} onChange={setReefer40ft} />
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 12]} align="middle" style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Text strong style={{ color: token.colorPrimary }}>
              40 FT High Cube (HC)
            </Text>
          </Col>
          <Col span={8}>
            <InputNumber min={0} max={50} value={qty40hc} onChange={(val) => setQty40hc(val || 0)} />
          </Col>
          <Col span={8}>
            <Space align="center">
              <Text style={{ fontSize: 12 }}>Reefer Temp Controlled</Text>
              <Switch size="small" checked={reefer40hc} onChange={setReefer40hc} />
            </Space>
          </Col>
        </Row>

        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text strong>Commodity Name</Text>
          </Col>
          <Col span={16}>
            <Input
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="e.g. General Cargo, Electronics, Foodstuffs"
            />
          </Col>
        </Row>
      </Card>

      {/* Itemized Surcharge Table */}
      <Card
        size="small"
        title="Estimated Rate Breakdown"
        style={{ borderRadius: 12 }}
        styles={{ header: { background: token.colorBgLayout } }}
      >
        <Table dataSource={surchargeData} columns={surchargeColumns} pagination={false} size="small" />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            paddingTop: 12,
            borderTop: `2px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text strong style={{ fontSize: 15 }}>
            Total Estimated Freight (USD):
          </Text>
          <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
            ${grandTotal.toLocaleString()} USD
          </Title>
        </div>
      </Card>
    </AppDrawer>
  );
}
