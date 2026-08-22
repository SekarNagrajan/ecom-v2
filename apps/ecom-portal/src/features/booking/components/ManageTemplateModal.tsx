// Created by Antigravity (2026-08-22 10:10)
import { AppModal } from '@solverminds/shared-ui';
import { Button, Space, Table, Input, Select } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

interface ManageTemplateModalProps {
  open: boolean;
  onCancel: () => void;
}

export function ManageTemplateModal({ open, onCancel }: ManageTemplateModalProps) {
  const columns = [
    { title: 'S.No', dataIndex: 'sno', width: 80 },
    { title: 'Template Name', dataIndex: 'templateName' },
    { title: 'Origin', dataIndex: 'origin' },
    { title: 'Delivery', dataIndex: 'delivery' },
    { 
      title: 'Action', 
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined style={{ color: '#1677ff' }} />} size="small" />
          <Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} size="small" />
          <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} size="small" />
        </Space>
      )
    },
  ];

  return (
    <AppModal
      title={<div style={{ color: '#fff' }}>Manage Template</div>}
      open={open}
      onCancel={onCancel}
      dialogSize="lg"
      footer={null}
      styles={{
        header: { backgroundColor: '#1677ff', margin: '-20px -24px 20px -24px', padding: '16px 24px' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      closeIcon={<span style={{ color: '#fff' }}>×</span>}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          Show 
          <Select defaultValue="10" options={[{ value: '10', label: '10' }]} style={{ width: 70 }} /> 
          entries
        </Space>
        <Space>
          Search: <Input style={{ width: 200 }} />
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={[]} 
        pagination={{
          showSizeChanger: false,
          showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
        }}
        bordered
        size="small"
        locale={{ emptyText: 'No data available in table' }}
      />
    </AppModal>
  );
}
