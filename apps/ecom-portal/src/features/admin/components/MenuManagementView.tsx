// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Switch, Tag, Typography, Card, Space, theme } from 'antd';
import { UnorderedListOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { MenuConfig } from '../types/admin.types';

const { Text, Title } = Typography;

interface MenuManagementViewProps {
  menus: MenuConfig[];
  onSave: (menus: MenuConfig[]) => void;
}

export function MenuManagementView({ menus, onSave }: MenuManagementViewProps) {
  const { token } = theme.useToken();
  const [data, setData] = React.useState<MenuConfig[]>(menus);

  React.useEffect(() => {
    setData(menus);
  }, [menus]);

  const handleToggle = (refNo: string, checked: boolean) => {
    const updated = data.map((item) => (item.refNo === refNo ? { ...item, isEnabled: checked } : item));
    setData(updated);
  };

  const columns = [
    { title: 'Ref Code', dataIndex: 'refNo', key: 'refNo', render: (val: string) => <Tag color="blue">{val}</Tag> },
    { title: 'Resource Key / Label', dataIndex: 'labelValue', key: 'labelValue' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag color={cat === 'D' ? 'green' : 'orange'}>
          {cat === 'D' ? 'Default Access' : 'Permission Restricted'}
        </Tag>
      ),
    },
    { title: 'Icon Class', dataIndex: 'classValue', key: 'classValue' },
    { title: 'Route Target', dataIndex: 'attrValue', key: 'attrValue' },
    {
      title: 'Status',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: MenuConfig) => (
        <Switch checked={enabled} onChange={(checked) => handleToggle(record.refNo, checked)} />
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <UnorderedListOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <Title level={4} style={{ margin: 0 }}>Global Menu Management</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Configure menu hierarchy, visibility, and category entitlement rules
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(data)}>
          Save Menu Hierarchy
        </AppButton>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="refNo"
        pagination={false}
      />
    </Card>
  );
}
