// Created by Sekar Nagarajan (2026-08-24 14:46)
import { FileProtectOutlined } from '@ant-design/icons';
import { Card, Typography, theme } from 'antd';

const { Title, Text } = Typography;

interface DeliveryOrderLandingProps {
  onOpen: () => void;
}

export function DeliveryOrderLanding({ onOpen }: DeliveryOrderLandingProps) {
  const { token } = theme.useToken();

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={4} style={{ marginBottom: 4 }}>Delivery Order</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        View and print delivery orders for your import cargo.
      </Text>

      <Card
        hoverable
        onClick={onOpen}
        style={{
          width: 280,
          borderRadius: 12,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: token.colorPrimaryBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileProtectOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
        </div>
        <div>
          <Text strong style={{ fontSize: 15 }}>
            Delivery order summary
          </Text>
        </div>
      </Card>
    </div>
  );
}
