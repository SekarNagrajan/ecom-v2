// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Image, Input, InputNumber, Space, Switch, Table, Tag, Typography } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { BannerConfig } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

const { Text } = Typography;

interface BannerManagerViewProps {
  banners: BannerConfig[];
  onCreate: (banner: Omit<BannerConfig, 'id'>) => Promise<BannerConfig>;
}

export function BannerManagerView({ banners, onCreate }: BannerManagerViewProps) {
  const [data, setData] = React.useState<BannerConfig[]>(banners);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('/hero-bg.png');
  const [sortOrder, setSortOrder] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    setData(banners);
  }, [banners]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTitle('');
    setImageUrl('/hero-bg.png');
    setSortOrder(1);
  };

  const handleAddBanner = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title, imageUrl, sortOrder, isActive: true });
      toast.success('Banner uploaded successfully');
      closeDrawer();
    } catch {
      toast.error('Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'left' as const,
      render: (_: unknown, record: BannerConfig) => (
        <Switch checked={record.isActive} disabled />
      ),
    },
    {
      title: 'Sort',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      render: (val: number) => (
        <Tag className="admin-code-tag" color="blue">
          #{val}
        </Tag>
      ),
    },
    {
      title: 'Preview',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => (
        <Image src={url} width={100} height={45} className="admin-banner-thumb" />
      ),
    },
    { title: 'Banner Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Image Asset Path',
      dataIndex: 'imageUrl',
      key: 'path',
      render: (val: string) => <code>{val}</code>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag className="admin-status-tag" color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
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
        icon={<AppIcon icon={Icons.upload} size={16} />}
        loading={submitting}
        onClick={handleAddBanner}
      >
        Submit
      </AppButton>
    </Space>
  );

  return (
    <AdminPanelShell
      icon={Icons.image}
      title="Banner & Asset Manager"
      subtitle="Manage landing hero slides, promotional carousels, and priority media assets."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.upload} size={16} />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Upload New Banner
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} scroll={{ x: true }} />
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Upload Landing Hero Banner"
        placement="right"
        dialogSize="md"
        destroyOnClose
        maskClosable={!submitting}
        keyboard={!submitting}
        footer={drawerActions}
      >
        <div className="admin-drawer-body">
          <div>
            <span className="form-field-label">
              Banner Title <Text type="danger">*</Text>
            </span>
            <Input
              size="large"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SOLAS VGM Digital Filing"
            />
          </div>

          <div>
            <span className="form-field-label">Image Asset URL</span>
            <Input size="large" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <div>
            <span className="form-field-label">Carousel Sequence Rank</span>
            <InputNumber
              size="large"
              min={1}
              value={sortOrder}
              onChange={(val) => setSortOrder(val || 1)}
            />
          </div>
        </div>
      </AppDrawer>
    </AdminPanelShell>
  );
}
