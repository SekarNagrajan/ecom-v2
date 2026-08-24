// Created by Antigravity (2026-08-24 11:30)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, Typography, theme, Table, Tag } from 'antd';
import type { SIDTO } from '../types/si.types';

const { Text, Title } = Typography;

export function CargoStep({ 
  data, 
  onNext, 
  onPrevious, 
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

  const handleNext = () => {
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {data.containers.map((container, index) => (
          <Card 
            key={container.id}
            style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, marginBottom: 24 }}
            styles={{ header: { backgroundColor: token.colorFillAlter, borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>Container {index + 1}: <Text strong>{container.containerNo}</Text></span>
                <Tag color="blue">{container.eqpSize}</Tag>
              </div>
            }
          >
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Carrier Seal</Text>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{container.carrierSeal || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Shipper Seal</Text>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{container.shipperSeal || 'N/A'}</div>
              </Col>
            </Row>

            <Table
              dataSource={container.cargoLines}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
              columns={[
                { title: 'Marks & Numbers', dataIndex: 'marksAndNumbers', key: 'marksAndNumbers' },
                { title: 'Description', dataIndex: 'description', key: 'description' },
                { title: 'Commodity', dataIndex: 'commodityCode', key: 'commodityCode' },
                { title: 'HS Code', dataIndex: 'hsCode', key: 'hsCode' },
                { title: 'Packages', key: 'packages', render: (_, record) => `${record.packageCount} ${record.packageType}` },
                { title: 'Gross Wt (KG)', dataIndex: 'grossWeight', key: 'grossWeight' },
                { title: 'Volume (CBM)', dataIndex: 'volume', key: 'volume' },
              ]}
            />
          </Card>
        ))}
      </div>

      <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, display: 'flex', justifyContent: 'space-between', backgroundColor: token.colorBgContainer }}>
        <AppButton onClick={onPrevious} disabled={isSubmitting}>Previous</AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>Next</AppButton>
      </div>
    </div>
  );
}
