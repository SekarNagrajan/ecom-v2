// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Switch, Tag, Typography, Card, Space } from 'antd';
import { StopOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { ServiceRestriction } from '../types/admin.types';

const { Text, Title } = Typography;

interface ServiceRestrictionsViewProps {
  restrictions: ServiceRestriction[];
  onSave: (items: ServiceRestriction[]) => void;
}

export function ServiceRestrictionsView({ restrictions, onSave }: ServiceRestrictionsViewProps) {
  const [data, setData] = React.useState<ServiceRestriction[]>(restrictions);

  React.useEffect(() => {
    setData(restrictions);
  }, [restrictions]);

  const handleToggle = (id: string, checked: boolean) => {
    const updated = data.map((item) => (item.id === id ? { ...item, isRestricted: checked } : item));
    setData(updated);
  };

  const columns = [
    { title: 'POL Code', dataIndex: 'polCode', key: 'polCode', render: (val: string) => <Tag color="geekblue">{val}</Tag> },
    { title: 'POD Code', dataIndex: 'podCode', key: 'podCode', render: (val: string) => <Tag color="volcano">{val}</Tag> },
    { title: 'Service Loop', dataIndex: 'serviceLoop', key: 'serviceLoop' },
    { title: 'Tenant Code', dataIndex: 'tenantId', key: 'tenantId', render: (val: string) => <Tag color="gold">{val}</Tag> },
    {
      title: 'Restriction Status',
      dataIndex: 'isRestricted',
      key: 'isRestricted',
      render: (restricted: boolean, record: ServiceRestriction) => (
        <Space>
          <Switch checked={restricted} onChange={(checked) => handleToggle(record.id, checked)} />
          <Tag color={restricted ? 'red' : 'green'}>{restricted ? 'RESTRICTED' : 'ACTIVE'}</Tag>
        </Space>
      ),
    },
    { title: 'Restriction Reason', dataIndex: 'reason', key: 'reason', render: (val?: string) => val || 'N/A' },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <StopOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
            <Title level={4} style={{ margin: 0 }}>Service & Route Restrictions</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Enable or restrict specific origin/destination port pairs and maritime service loops
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(data)}>
          Save Route Rules
        </AppButton>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
}
