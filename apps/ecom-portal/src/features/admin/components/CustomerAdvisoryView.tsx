// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Tag, Typography, Card, Space, Input, Select } from 'antd';
import { NotificationOutlined, PlusOutlined } from '@ant-design/icons';
import { AppButton, AppModal } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import type { CustomerAdvisory } from '../types/admin.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface CustomerAdvisoryViewProps {
  advisories: CustomerAdvisory[];
  onCreate: (adv: Omit<CustomerAdvisory, 'id'>) => Promise<CustomerAdvisory>;
}

export function CustomerAdvisoryView({ advisories, onCreate }: CustomerAdvisoryViewProps) {
  const [data, setData] = React.useState<CustomerAdvisory[]>(advisories);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [severity, setSeverity] = React.useState<'INFO' | 'WARNING' | 'URGENT'>('WARNING');
  const toast = useToast();

  React.useEffect(() => {
    setData(advisories);
  }, [advisories]);

  const handleCreateAdvisory = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      await onCreate({
        title,
        message,
        severity,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '2026-12-31',
        isActive: true,
      });
      toast.success('Operational advisory published successfully');
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
    } catch {
      toast.error('Failed to publish advisory');
    }
  };

  const columns = [
    {
      title: 'Severity Level',
      dataIndex: 'severity',
      key: 'severity',
      render: (sev: 'INFO' | 'WARNING' | 'URGENT') => {
        const colorMap = { INFO: 'blue', WARNING: 'orange', URGENT: 'red' };
        return <Tag color={colorMap[sev]}>{sev}</Tag>;
      },
    },
    { title: 'Advisory Title', dataIndex: 'title', key: 'title', render: (val: string) => <strong>{val}</strong> },
    { title: 'Announcement Content', dataIndex: 'message', key: 'message' },
    { title: 'Effective Period', key: 'period', render: (_: unknown, r: CustomerAdvisory) => `${r.effectiveFrom} ~ ${r.effectiveTo}` },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'ACTIVE' : 'EXPIRED'}</Tag>,
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <NotificationOutlined style={{ fontSize: 20, color: '#fa541c' }} />
            <Title level={4} style={{ margin: 0 }}>Customer Advisory Admin</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Publish operational advisories, port congestion alerts, and announcements
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Publish New Advisory
        </AppButton>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />

      <AppModal open={isModalOpen} title="Publish Operational Advisory" onCancel={() => setIsModalOpen(false)} onOk={handleCreateAdvisory}>
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Alert Severity</Text>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={severity}
              onChange={(val) => setSeverity(val)}
              options={[
                { label: 'INFO (General Update)', value: 'INFO' },
                { label: 'WARNING (Operational Delay)', value: 'WARNING' },
                { label: 'URGENT (Port Closure / Severe Weather)', value: 'URGENT' },
              ]}
            />
          </div>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Advisory Headline</Text>
            <Input size="large" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Typhoon Delay at Shanghai Port" />
          </div>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Detailed Announcement Message</Text>
            <TextArea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </Space>
      </AppModal>
    </Card>
  );
}
