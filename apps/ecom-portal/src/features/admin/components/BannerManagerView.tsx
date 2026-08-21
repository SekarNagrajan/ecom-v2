// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Switch, Tag, Typography, Card, Space, Image, Input, InputNumber } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { AppButton, AppModal } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import type { BannerConfig } from '../types/admin.types';

const { Text, Title } = Typography;

interface BannerManagerViewProps {
  banners: BannerConfig[];
  onCreate: (banner: Omit<BannerConfig, 'id'>) => Promise<BannerConfig>;
}

export function BannerManagerView({ banners, onCreate }: BannerManagerViewProps) {
  const [data, setData] = React.useState<BannerConfig[]>(banners);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('');
  const [imageUrl, setImageUrl] = React.useState<string>('/hero_bg.png');
  const [sortOrder, setSortOrder] = React.useState<number>(1);
  const toast = useToast();

  React.useEffect(() => {
    setData(banners);
  }, [banners]);

  const handleAddBanner = async () => {
    if (!title.trim()) return;
    try {
      await onCreate({ title, imageUrl, sortOrder, isActive: true });
      toast.success('Banner uploaded successfully');
      setIsModalOpen(false);
      setTitle('');
    } catch {
      toast.error('Failed to create banner');
    }
  };

  const columns = [
    { title: 'Sort', dataIndex: 'sortOrder', key: 'sortOrder', render: (val: number) => <Tag color="blue">#{val}</Tag> },
    {
      title: 'Preview',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => <Image src={url} width={100} height={45} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    { title: 'Banner Title', dataIndex: 'title', key: 'title' },
    { title: 'Image Asset Path', dataIndex: 'imageUrl', key: 'path', render: (val: string) => <code>{val}</code> },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => <Switch checked={active} />,
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <PictureOutlined style={{ fontSize: 20, color: '#eb2f96' }} />
            <Title level={4} style={{ margin: 0 }}>Banner & Asset Manager</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Manage landing hero slides, promotional carousels, and priority media assets
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>
          Upload New Banner
        </AppButton>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />

      <AppModal
        open={isModalOpen}
        title="Upload Landing Hero Banner"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddBanner}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size="middle">
          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Banner Title</Text>
            <Input size="large" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SOLAS VGM Digital Filing" />
          </div>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Image Asset URL</Text>
            <Input size="large" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <div>
            <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Carousel Sequence Rank</Text>
            <InputNumber size="large" min={1} value={sortOrder} onChange={(val) => setSortOrder(val || 1)} />
          </div>
        </Space>
      </AppModal>
    </Card>
  );
}
