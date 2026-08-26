// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Switch, Table, Tag } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { MenuConfig } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

interface MenuManagementViewProps {
  menus: MenuConfig[];
  onSave: (menus: MenuConfig[]) => void;
}

export function MenuManagementView({ menus, onSave }: MenuManagementViewProps) {
  const [data, setData] = React.useState<MenuConfig[]>(menus);

  React.useEffect(() => {
    setData(menus);
  }, [menus]);

  const handleToggle = (refNo: string, checked: boolean) => {
    setData(data.map((item) => (item.refNo === refNo ? { ...item, isEnabled: checked } : item)));
  };

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'left' as const,
      render: (_: unknown, record: MenuConfig) => (
        <Switch
          checked={record.isEnabled}
          onChange={(checked) => handleToggle(record.refNo, checked)}
        />
      ),
    },
    {
      title: 'Ref Code',
      dataIndex: 'refNo',
      key: 'refNo',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    { title: 'Resource Key / Label', dataIndex: 'labelValue', key: 'labelValue' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag className="admin-status-tag" color={cat === 'D' ? 'success' : 'warning'}>
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
      render: (enabled: boolean) => (
        <Tag className="admin-status-tag" color={enabled ? 'success' : 'default'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.list}
      title="Global Menu Management"
      subtitle="Configure menu hierarchy, visibility, and category entitlement rules."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(data)}
        >
          Save Menu Hierarchy
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table dataSource={data} columns={columns} rowKey="refNo" pagination={false} scroll={{ x: true }} />
      </div>
    </AdminPanelShell>
  );
}
