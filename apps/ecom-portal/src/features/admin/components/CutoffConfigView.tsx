// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Tag, Typography, Card, Space, InputNumber } from 'antd';
import { ClockCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { CutoffConfig } from '../types/admin.types';

const { Text, Title } = Typography;

interface CutoffConfigViewProps {
  cutoffConfigs: CutoffConfig[];
  onSave: (items: CutoffConfig[]) => void;
}

export function CutoffConfigView({ cutoffConfigs, onSave }: CutoffConfigViewProps) {
  const [data, setData] = React.useState<CutoffConfig[]>(cutoffConfigs);

  React.useEffect(() => {
    setData(cutoffConfigs);
  }, [cutoffConfigs]);

  const handleHourChange = (id: string, field: 'vgmCutoffHours' | 'siCutoffHours' | 'bookingCutoffHours', val: number) => {
    const updated = data.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    setData(updated);
  };

  const columns = [
    { title: 'Port Code', dataIndex: 'portCode', key: 'portCode', render: (val: string) => <Tag color="blue">{val}</Tag> },
    { title: 'Vessel Name', dataIndex: 'vesselName', key: 'vesselName', render: (val: string) => <strong>{val}</strong> },
    { title: 'Voyage No', dataIndex: 'voyageNo', key: 'voyageNo', render: (val: string) => <Tag color="geekblue">{val}</Tag> },
    {
      title: 'VGM Cut-off (Hours Prior ETA)',
      dataIndex: 'vgmCutoffHours',
      key: 'vgmCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber size="large" min={1} value={val} onChange={(newVal) => handleHourChange(record.id, 'vgmCutoffHours', newVal || 12)} />
      ),
    },
    {
      title: 'SI Cut-off (Hours Prior ETA)',
      dataIndex: 'siCutoffHours',
      key: 'siCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber size="large" min={1} value={val} onChange={(newVal) => handleHourChange(record.id, 'siCutoffHours', newVal || 24)} />
      ),
    },
    {
      title: 'Booking Cut-off (Hours Prior ETA)',
      dataIndex: 'bookingCutoffHours',
      key: 'bookingCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber size="large" min={1} value={val} onChange={(newVal) => handleHourChange(record.id, 'bookingCutoffHours', newVal || 48)} />
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Cut-off Time Configuration</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Set port and vessel call cut-off thresholds for VGM, SI, and Booking submissions
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(data)}>
          Save Cutoff Matrix
        </AppButton>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
}
