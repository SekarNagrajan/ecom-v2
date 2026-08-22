import { AppModal } from '@solverminds/shared-ui';
import { Button, Space, Table, Input, Select, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import type { BookingTemplate } from '../types/booking.types';
import { useBookingStore } from '../stores/booking.store';

interface SelectTemplateModalProps {
  open: boolean;
  onCancel: () => void;
}

export function SelectTemplateModal({ open, onCancel }: SelectTemplateModalProps) {
  const { initializeFromBooking } = useBookingStore();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['booking-templates'],
    queryFn: bookingApi.getTemplates,
    enabled: open,
  });

  const handleSelect = (template: BookingTemplate) => {
    initializeFromBooking(template.payload);
    message.success(`Applied template: ${template.templateName}`);
    onCancel();
  };

  const columns = [
    { title: 'S.No', key: 'sno', width: 80, render: (_: any, __: any, index: number) => index + 1 },
    { title: 'Template Name', dataIndex: 'templateName' },
    { title: 'Origin', dataIndex: 'origin' },
    { title: 'Delivery', dataIndex: 'delivery' },
    { 
      title: 'Action', 
      key: 'action',
      render: (_: any, record: BookingTemplate) => (
        <Button type="primary" size="small" onClick={() => handleSelect(record)}>
          Select
        </Button>
      )
    },
  ];

  return (
    <AppModal
      title={<div style={{ color: '#fff' }}>Select Template</div>}
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
        dataSource={templates}
        rowKey="id"
        loading={isLoading}
        pagination={{
          showSizeChanger: false,
          showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
        }}
        bordered
        size="small"
        locale={{ emptyText: 'No templates available' }}
      />
    </AppModal>
  );
}
