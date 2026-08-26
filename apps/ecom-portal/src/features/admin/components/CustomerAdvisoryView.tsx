// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Input, Select, Space, Table, Tag, Typography } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { CustomerAdvisory } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

const { Text } = Typography;
const { TextArea } = Input;

interface CustomerAdvisoryViewProps {
  advisories: CustomerAdvisory[];
  onCreate: (adv: Omit<CustomerAdvisory, 'id'>) => Promise<CustomerAdvisory>;
}

export function CustomerAdvisoryView({ advisories, onCreate }: CustomerAdvisoryViewProps) {
  const [data, setData] = React.useState<CustomerAdvisory[]>(advisories);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'INFO' | 'WARNING' | 'URGENT'>('WARNING');
  const [submitting, setSubmitting] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    setData(advisories);
  }, [advisories]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTitle('');
    setMessage('');
    setSeverity('WARNING');
  };

  const handleCreateAdvisory = async () => {
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
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
      closeDrawer();
    } catch {
      toast.error('Failed to publish advisory');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (sev: 'INFO' | 'WARNING' | 'URGENT') => {
        const colorMap = { INFO: 'blue', WARNING: 'orange', URGENT: 'red' } as const;
        const labelMap = { INFO: 'Info', WARNING: 'Warning', URGENT: 'Urgent' } as const;
        return (
          <Tag className="admin-status-tag" color={colorMap[sev]}>
            {labelMap[sev]}
          </Tag>
        );
      },
    },
    {
      title: 'Advisory Title',
      dataIndex: 'title',
      key: 'title',
      render: (val: string) => <strong>{val}</strong>,
    },
    { title: 'Announcement Content', dataIndex: 'message', key: 'message' },
    {
      title: 'Effective Period',
      key: 'period',
      render: (_: unknown, r: CustomerAdvisory) => `${r.effectiveFrom} ~ ${r.effectiveTo}`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag className="admin-status-tag" color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Expired'}
        </Tag>
      ),
    },
  ];

  const drawerActions = (
    <Space size="middle" className="admin-drawer-actions">
      <AppButton onClick={closeDrawer} disabled={submitting}>
        Cancel
      </AppButton>
      <AppButton
        type="primary"
        icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
        loading={submitting}
        onClick={handleCreateAdvisory}
      >
        Submit
      </AppButton>
    </Space>
  );

  return (
    <AdminPanelShell
      icon={Icons.bell}
      title="Customer Advisory Admin"
      subtitle="Publish operational advisories, port congestion alerts, and announcements."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Publish New Advisory
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} scroll={{ x: true }} />
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Publish Operational Advisory"
        placement="right"
        dialogSize="md"
        destroyOnClose
        maskClosable={!submitting}
        keyboard={!submitting}
        footer={drawerActions}
      >
        <div className="admin-drawer-body">
          <div>
            <span className="form-field-label">Alert Severity</span>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={severity}
              onChange={(val) => setSeverity(val)}
              options={[
                { label: 'Info (General Update)', value: 'INFO' },
                { label: 'Warning (Operational Delay)', value: 'WARNING' },
                { label: 'Urgent (Port Closure / Severe Weather)', value: 'URGENT' },
              ]}
            />
          </div>

          <div>
            <span className="form-field-label">
              Advisory Headline <Text type="danger">*</Text>
            </span>
            <Input
              size="large"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Typhoon Delay at Shanghai Port"
            />
          </div>

          <div>
            <span className="form-field-label">
              Detailed Announcement Message <Text type="danger">*</Text>
            </span>
            <TextArea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>
      </AppDrawer>
    </AdminPanelShell>
  );
}
