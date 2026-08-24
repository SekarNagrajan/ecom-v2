// Created by Antigravity (2026-08-24 11:35)
import { Card, Typography, Space, theme, Row, Col, Table } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchSIDetails } from './api/si.api';

const { Title, Text } = Typography;

export function ShippingInstructionViewRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  
  const { siId } = useParams({ strict: false });

  const { data: siDetails, isLoading } = useQuery({
    queryKey: ['siDetails', siId],
    queryFn: async () => {
      const res = await fetchSIDetails(siId as string);
      return res.data;
    }
  });

  const cardStyle = { border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, marginBottom: 24 };
  const labelStyle: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: token.colorTextSecondary, display: 'block', marginBottom: 4 };

  if (isLoading) return <div style={{ padding: 24 }}>Loading SI details...</div>;
  if (!siDetails) return <div style={{ padding: 24 }}>SI not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={10}>
            <FileTextOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              VIEW SHIPPING INSTRUCTION: {siDetails.siNo || siId}
            </Title>
          </Space>
          <AppButton onClick={() => navigate({ to: '/app/shipping-instruction' })}>Back to Dashboard</AppButton>
        </div>
      </Card>

      <div style={{ padding: '0 2px' }}>
        {/* Master Details */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>MASTER DETAILS</Title>} size="small">
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Text style={labelStyle}>Booking Number</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{siDetails.bookingNo}</div>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>B/L Type</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{siDetails.blType}</div>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Freight Option</Text>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{siDetails.freightOption}</div>
            </Col>
          </Row>
        </Card>

        {/* Parties */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>PARTIES</Title>} size="small">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>SHIPPER</Text>
                <div style={{ marginTop: 8 }}><Text strong>{siDetails.parties.shipper.name}</Text></div>
                <div><Text>{siDetails.parties.shipper.address}</Text></div>
                <div><Text>{siDetails.parties.shipper.city}, {siDetails.parties.shipper.country}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>CONSIGNEE {siDetails.parties.consignee.toOrder && <Text type="warning">(TO ORDER)</Text>}</Text>
                <div style={{ marginTop: 8 }}><Text strong>{siDetails.parties.consignee.name}</Text></div>
                <div><Text>{siDetails.parties.consignee.address}</Text></div>
                <div><Text>{siDetails.parties.consignee.city}, {siDetails.parties.consignee.country}</Text></div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ padding: 12, backgroundColor: token.colorFillAlter, borderRadius: 6, height: '100%' }}>
                <Text style={labelStyle}>NOTIFY PARTY</Text>
                <div style={{ marginTop: 8 }}><Text strong>{siDetails.parties.notify.name}</Text></div>
                <div><Text>{siDetails.parties.notify.address}</Text></div>
                <div><Text>{siDetails.parties.notify.city}, {siDetails.parties.notify.country}</Text></div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Cargo & Containers */}
        <Card style={cardStyle} title={<Title level={5} style={{ margin: 0 }}>CARGO & CONTAINERS</Title>} size="small">
          {siDetails.containers.map((c, i) => (
            <div key={c.id} style={{ marginBottom: i < siDetails.containers.length - 1 ? 24 : 0 }}>
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
    </div>
  );
}
