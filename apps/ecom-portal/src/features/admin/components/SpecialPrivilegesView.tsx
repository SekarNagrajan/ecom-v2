// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Checkbox, Table, Tag } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { SpecialPrivilege } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

interface SpecialPrivilegesViewProps {
  privileges: SpecialPrivilege[];
  onSave: (privs: SpecialPrivilege[]) => void;
}

export function SpecialPrivilegesView({ privileges, onSave }: SpecialPrivilegesViewProps) {
  const [data, setData] = React.useState<SpecialPrivilege[]>(privileges);

  React.useEffect(() => {
    setData(privileges);
  }, [privileges]);

  const handleCheck = (index: number, field: keyof SpecialPrivilege, checked: boolean) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: checked };
    setData(updated);
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="purple">
          {val}
        </Tag>
      ),
    },
    {
      title: 'Module Code',
      dataIndex: 'moduleCode',
      key: 'moduleCode',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: 'Can View',
      dataIndex: 'canView',
      key: 'canView',
      render: (val: boolean, _: SpecialPrivilege, idx: number) => (
        <Checkbox checked={val} onChange={(e) => handleCheck(idx, 'canView', e.target.checked)} />
      ),
    },
    {
      title: 'Can Create',
      dataIndex: 'canCreate',
      key: 'canCreate',
      render: (val: boolean, _: SpecialPrivilege, idx: number) => (
        <Checkbox checked={val} onChange={(e) => handleCheck(idx, 'canCreate', e.target.checked)} />
      ),
    },
    {
      title: 'Can Edit',
      dataIndex: 'canEdit',
      key: 'canEdit',
      render: (val: boolean, _: SpecialPrivilege, idx: number) => (
        <Checkbox checked={val} onChange={(e) => handleCheck(idx, 'canEdit', e.target.checked)} />
      ),
    },
    {
      title: 'Can Delete',
      dataIndex: 'canDelete',
      key: 'canDelete',
      render: (val: boolean, _: SpecialPrivilege, idx: number) => (
        <Checkbox checked={val} onChange={(e) => handleCheck(idx, 'canDelete', e.target.checked)} />
      ),
    },
    {
      title: 'Can Approve',
      dataIndex: 'canApprove',
      key: 'canApprove',
      render: (val: boolean, _: SpecialPrivilege, idx: number) => (
        <Checkbox checked={val} onChange={(e) => handleCheck(idx, 'canApprove', e.target.checked)} />
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.key}
      title="Special Privileges Matrix"
      subtitle="Assign granular action permissions for internal agency and vendor roles."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(data)}
        >
          Save Privileges Matrix
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r: SpecialPrivilege) => `${r.roleId}_${r.moduleCode}`}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>
    </AdminPanelShell>
  );
}
