// Vessel Details & Particulars Side Drawer Component
// Parity with legacy VesselDetails.jsp & user-modules AppDrawer standard
// Modified by Antigravity (2026-08-21)

import { CompassOutlined, DownloadOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { Card, Descriptions, Table, Tag, theme, Typography } from 'antd';
import type { VesselParticulars } from '../types/schedules.types';

const { Text, Title } = Typography;

interface VesselDetailsModalProps {
  vessel: VesselParticulars | null;
  open: boolean;
  onClose: () => void;
}

export function VesselDetailsModal({ vessel, open, onClose }: VesselDetailsModalProps) {
  const { token } = theme.useToken();

  if (!vessel) return null;

  const portCallColumns = [
    {
      title: 'Port Code & Name',
      dataIndex: 'portCode',
      key: 'portCode',
      render: (code: string, record: { portName: string }) => (
        <span>
          <Tag color="blue">{code}</Tag> <b>{record.portName}</b>
        </span>
      ),
    },
    {
      title: 'Terminal',
      dataIndex: 'terminal',
      key: 'terminal',
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
    },
    {
      title: 'ETD',
      dataIndex: 'etd',
      key: 'etd',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PORT' ? 'processing' : 'default'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CompassOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {vessel.vesselName}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              IMO: {vessel.imoNumber} | Call Sign: {vessel.callSign}
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
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
          <AppButton danger onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="primary" icon={<DownloadOutlined />}>
            Download Specs PDF
          </AppButton>
        </div>
      }
    >
      <Card
        title="Vessel Specifications"
        style={{ borderRadius: 12, marginBottom: 20 }}
        styles={{ header: { background: token.colorBgLayout } }}
      >
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Vessel Code">{vessel.vesselCode}</Descriptions.Item>
          <Descriptions.Item label="Flag">{vessel.flag}</Descriptions.Item>

          <Descriptions.Item label="Vessel Type">{vessel.vesselType}</Descriptions.Item>
          <Descriptions.Item label="Operator">{vessel.vesselOperator}</Descriptions.Item>

          <Descriptions.Item label="Owner">{vessel.vesselOwner}</Descriptions.Item>
          <Descriptions.Item label="Built Year">{vessel.builtYear}</Descriptions.Item>

          <Descriptions.Item label="Port of Registry">{vessel.portOfRegistry}</Descriptions.Item>
          <Descriptions.Item label="Length Overall">{vessel.lengthOverall}</Descriptions.Item>

          <Descriptions.Item label="TEU Nominal">{vessel.teuNominal}</Descriptions.Item>
          <Descriptions.Item label="Gross Tonnage">{vessel.grossTonnage}</Descriptions.Item>

          <Descriptions.Item label="Net Tonnage">{vessel.netTonnage}</Descriptions.Item>
          <Descriptions.Item label="IMO / Lloyd's">{vessel.imoNumber}</Descriptions.Item>
        </Descriptions>
      </Card>

      {vessel.portCalls && vessel.portCalls.length > 0 && (
        <Card
          title="Voyage Port Call Sequence"
          style={{ borderRadius: 12 }}
          styles={{ header: { background: token.colorBgLayout } }}
        >
          <Table
            dataSource={vessel.portCalls.map((item, idx) => ({ ...item, key: idx }))}
            columns={portCallColumns}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </AppDrawer>
  );
}
