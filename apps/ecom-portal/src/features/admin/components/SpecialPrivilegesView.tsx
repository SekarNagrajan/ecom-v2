// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Checkbox, Tag, Typography, Card, Space } from 'antd';
import { KeyOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { SpecialPrivilege } from '../types/admin.types';

const { Text, Title } = Typography;

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
    { title: 'Role Name', dataIndex: 'roleName', key: 'roleName', render: (val: string) => <Tag color="purple">{val}</Tag> },
    { title: 'Module Code', dataIndex: 'moduleCode', key: 'moduleCode', render: (val: string) => <Tag color="blue">{val}</Tag> },
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
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <KeyOutlined style={{ fontSize: 20, color: '#722ed1' }} />
            <Title level={4} style={{ margin: 0 }}>Special Privileges Matrix</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Assign granular action permissions for internal agency and vendor roles
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(data)}>
          Save Privileges Matrix
        </AppButton>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey={(r: SpecialPrivilege) => `${r.roleId}_${r.moduleCode}`}
        pagination={false}
      />
    </Card>
  );
}
