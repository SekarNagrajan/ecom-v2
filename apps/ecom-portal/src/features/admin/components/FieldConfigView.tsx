// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Switch, Table, Tag } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { FieldConfig } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

interface FieldConfigViewProps {
  fields: FieldConfig[];
  onSave: (fields: FieldConfig[]) => void;
}

export function FieldConfigView({ fields, onSave }: FieldConfigViewProps) {
  const [data, setData] = React.useState<FieldConfig[]>(fields);

  React.useEffect(() => {
    setData(fields);
  }, [fields]);

  const handleToggle = (id: string, prop: 'isVisible' | 'isRequired', checked: boolean) => {
    setData(data.map((item) => (item.id === id ? { ...item, [prop]: checked } : item)));
  };

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      fixed: 'left' as const,
      render: (_: unknown, record: FieldConfig) => (
        <SpaceActions
          visible={record.isVisible}
          required={record.isRequired}
          onVisible={(checked) => handleToggle(record.id, 'isVisible', checked)}
          onRequired={(checked) => handleToggle(record.id, 'isRequired', checked)}
        />
      ),
    },
    {
      title: 'Form Module',
      dataIndex: 'formName',
      key: 'formName',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: 'Field Identifier',
      dataIndex: 'fieldId',
      key: 'fieldId',
      render: (val: string) => <code>{val}</code>,
    },
    { title: 'Field Display Label', dataIndex: 'fieldLabel', key: 'fieldLabel' },
    {
      title: 'Visible',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (val: boolean) => (
        <Tag className="admin-status-tag" color={val ? 'success' : 'default'}>
          {val ? 'Visible' : 'Hidden'}
        </Tag>
      ),
    },
    {
      title: 'Mandatory',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (val: boolean) => (
        <Tag className="admin-status-tag" color={val ? 'warning' : 'default'}>
          {val ? 'Required' : 'Optional'}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.formInput}
      title="Form Field Configuration"
      subtitle="Dynamically manage form field visibility and mandatory rules across all forms."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(data)}
        >
          Save Field Configs
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} scroll={{ x: true }} />
      </div>
    </AdminPanelShell>
  );
}

function SpaceActions({
  visible,
  required,
  onVisible,
  onRequired,
}: {
  visible: boolean;
  required: boolean;
  onVisible: (checked: boolean) => void;
  onRequired: (checked: boolean) => void;
}) {
  return (
    <span className="admin-field-actions">
      <Switch size="small" checked={visible} onChange={onVisible} title="Visible" />
      <Switch size="small" checked={required} onChange={onRequired} title="Required" />
    </span>
  );
}
