// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Table, Switch, Tag, Typography, Card, Space } from 'antd';
import { FormOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { FieldConfig } from '../types/admin.types';

const { Text, Title } = Typography;

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
    const updated = data.map((item) => (item.id === id ? { ...item, [prop]: checked } : item));
    setData(updated);
  };

  const columns = [
    { title: 'Form Module', dataIndex: 'formName', key: 'formName', render: (val: string) => <Tag color="blue">{val}</Tag> },
    { title: 'Field Identifier', dataIndex: 'fieldId', key: 'fieldId', render: (val: string) => <code>{val}</code> },
    { title: 'Field Display Label', dataIndex: 'fieldLabel', key: 'fieldLabel' },
    {
      title: 'Is Visible',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (val: boolean, record: FieldConfig) => (
        <Switch checked={val} onChange={(checked) => handleToggle(record.id, 'isVisible', checked)} />
      ),
    },
    {
      title: 'Is Mandatory',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (val: boolean, record: FieldConfig) => (
        <Switch checked={val} onChange={(checked) => handleToggle(record.id, 'isRequired', checked)} />
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <FormOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
            <Title level={4} style={{ margin: 0 }}>Form Field Configuration</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Dynamically manage form field visibility and mandatory rules across all forms
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(data)}>
          Save Field Configs
        </AppButton>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
}
