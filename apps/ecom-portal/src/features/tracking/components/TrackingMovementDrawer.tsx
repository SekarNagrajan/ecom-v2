// Container Movement Events Side Drawer Component
// Uses @solverminds/shared-ui AppDrawer architecture matching ProfileView.tsx
// Parity with TrackingAllMovement.jsp and TrackingMovement.jsp
// Modified by sekar nagarajan (2026-08-21)

import {
  HistoryOutlined,
} from '@ant-design/icons';
import { AppDrawer } from '@solverminds/shared-ui';
import type { TableProps } from 'antd';
import { Card, Descriptions, Table, Tag, theme, Typography } from 'antd';
import type { ContainerEquipment, ContainerMovementEvent } from '../types/tracking.types';

const { Title, Text } = Typography;

interface TrackingMovementDrawerProps {
  container: ContainerEquipment | null;
  open: boolean;
  onClose: () => void;
}

export function TrackingMovementDrawer({ container, open, onClose }: TrackingMovementDrawerProps) {
  const { token } = theme.useToken();

  if (!container) return null;

  const columns: TableProps<ContainerMovementEvent>['columns'] = [
    {
      title: 'Event Code & Name',
      dataIndex: 'eventName',
      key: 'eventName',
      render: (val: string, record: { eventCode: string; transportMode: string }) => (
        <div>
          <Text strong style={{ fontSize: 13, display: 'block' }}>
            {val}
          </Text>

          <Tag color="blue" style={{ fontSize: 10 }}>
            {record.eventCode}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Location & Facility',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (val: string, record: { facility: string }) => (
        <div>
          <Text style={{ fontSize: 12, display: 'block' }}>{val}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.facility}
          </Text>
        </div>
      ),
    },
    {
      title: 'Vessel / Voyage',
      dataIndex: 'vesselName',
      key: 'vesselName',
      render: (val: string, record: { voyage?: string }) => (
        val ? (
          <div>
            <Text style={{ fontSize: 12, display: 'block' }}>{val}</Text>
            <Tag color="purple" style={{ fontSize: 10 }}>
              Voy: {record.voyage || '-'}
            </Tag>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (val: string) => <Tag color="green">{val}</Tag>,
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HistoryOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Container Movement History & Events
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Container No: <strong>{container.containerNo}</strong> | Seal: {container.sealNo}
            </Text>
          </div>
        </div>
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

    >
      {/* Container Specification Card */}
      <Card
        type="inner"
        style={{
          borderRadius: 12,
          background: token.colorFillAlter,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 20,
        }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Container No">
            <strong>{container.containerNo}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Size / Type">{container.containerType}</Descriptions.Item>
          <Descriptions.Item label="Seal No">{container.sealNo}</Descriptions.Item>
          <Descriptions.Item label="Tare Weight">{container.tareWeightKg} KG</Descriptions.Item>
          <Descriptions.Item label="Payload Weight">{container.payloadKg} KG</Descriptions.Item>
          <Descriptions.Item label="Current Status">
            <Tag color="cyan">{container.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Movement Events Log Table */}
      <Title level={5} style={{ marginBottom: 12 }}>
        Chronological Event Log
      </Title>
      <Table
        columns={columns}
        dataSource={container.movements}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </AppDrawer>
  );
}
