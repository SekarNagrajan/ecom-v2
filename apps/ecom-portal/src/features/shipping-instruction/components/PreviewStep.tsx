// Created by Antigravity (2026-08-24 11:30)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, Typography, theme, Divider, Table } from 'antd';
import type { SIDTO } from '../types/si.types';

const { Title, Text } = Typography;

export function PreviewStep({ 
  data, 
  onNext, 
  onPrevious,
  onSubmit,
  isSubmitting 
}: { 
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}) {
  const { token } = theme.useToken();
  const cardStyle = { border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, marginBottom: 24 };
  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, display: 'block', marginBottom: 4 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        <Title level={4} style={{ textAlign: 'center', marginBottom: 32, color: token.colorPrimary }}>SHIPPING INSTRUCTION SUMMARY</Title>

        {/* Master Details */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>MASTER DETAILS</Title>} size="small">
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Text style={labelStyle}>Booking Number</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{data.bookingNo}</div>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>B/L Type</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{data.blType}</div>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Freight Option</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{data.freightOption}</div>
            </Col>
          </Row>
        </Card>

        {/* Parties */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>PARTIES</Title>} size="small">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>SHIPPER</Text>
                <div style={{ marginTop: 8 }}><Text strong>{data.parties.shipper.name}</Text></div>
                <div><Text>{data.parties.shipper.address}</Text></div>
                <div><Text>{data.parties.shipper.city}, {data.parties.shipper.country}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>CONSIGNEE {data.parties.consignee.toOrder && <Text type="warning">(TO ORDER)</Text>}</Text>
                <div style={{ marginTop: 8 }}><Text strong>{data.parties.consignee.name}</Text></div>
                <div><Text>{data.parties.consignee.address}</Text></div>
                <div><Text>{data.parties.consignee.city}, {data.parties.consignee.country}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>NOTIFY PARTY</Text>
                <div style={{ marginTop: 8 }}><Text strong>{data.parties.notify.name}</Text></div>
                <div><Text>{data.parties.notify.address}</Text></div>
                <div><Text>{data.parties.notify.city}, {data.parties.notify.country}</Text></div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Cargo & Containers */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>CARGO & CONTAINERS</Title>} size="small">
          {data.containers.map((c, i) => (
            <div key={c.id} style={{ marginBottom: i < data.containers.length - 1 ? 24 : 0 }}>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 15 }}>Container {i + 1}: {c.containerNo} ({c.eqpSize})</Text>
                <div>
                  <Text type="secondary" style={{ marginRight: 16 }}>Carrier Seal: <Text strong>{c.carrierSeal || 'N/A'}</Text></Text>
                  <Text type="secondary">Shipper Seal: <Text strong>{c.shipperSeal || 'N/A'}</Text></Text>
                </div>
              </div>
              <Table
                size="small"
                dataSource={c.cargoLines}
                rowKey="id"
                pagination={false}
                bordered
                columns={[
                  { title: 'Marks & Numbers', dataIndex: 'marksAndNumbers', key: 'marksAndNumbers' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  { title: 'Packages', key: 'packages', render: (_, record) => `${record.packageCount} ${record.packageType}` },
                  { title: 'Gross Wt (KG)', dataIndex: 'grossWeight', key: 'grossWeight' },
                ]}
              />
            </div>
          ))}
        </Card>
      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={onPrevious} disabled={isSubmitting}>Previous</AppButton>
        <AppButton type="primary" onClick={onSubmit} loading={isSubmitting}>Submit to ESL</AppButton>
      </div>
    </div>
  );
}
