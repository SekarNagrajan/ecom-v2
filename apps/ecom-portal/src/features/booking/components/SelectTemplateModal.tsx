// Modified by Sekar Nagarajan (2026-08-28 00:35)
import { AppButton } from '@solverminds/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { Flex, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { useToast } from '@solverminds/shared-ui/hooks';
import {
  BookingTemplateModalShell,
  TemplateNameCell,
  TemplateRouteCell,
} from '../../../components/shared/booking-template-modal-shell';
import { AppIcon, Icons } from '../../../components/icons';
import { bookingApi } from '../api/booking.api';
import { useBookingStore } from '../stores/booking.store';
import type { BookingTemplate } from '../types/booking.types';

const { Text } = Typography;

interface SelectTemplateModalProps {
  open: boolean;
  onCancel: () => void;
}

export function SelectTemplateModal({ open, onCancel }: SelectTemplateModalProps) {
  const toast = useToast();
  const { initializeFromBooking } = useBookingStore();

  const { data, isLoading } = useQuery({
    queryKey: ['booking-templates'],
    queryFn: bookingApi.getTemplates,
    enabled: open,
  });
  const templates = Array.isArray(data) ? data : [];

  const handleSelect = (template: BookingTemplate) => {
    initializeFromBooking(template.payload);
    toast.success(`Applied template: ${template.templateName}`);
    onCancel();
  };

  const columns: ColumnsType<BookingTemplate> = [
    {
      title: 'Action',
      key: 'action',
      width: 70,
      fixed: 'left',
      render: (_: unknown, record) => (
        <AppButton
          type="primary"
          size="small"
          icon={<AppIcon icon={Icons.check} size={14} />}
          onClick={() => handleSelect(record)}
        >
          Select
        </AppButton>
      ),
    },
    {
      title: 'S.No',
      key: 'sno',
      width: 72,
      align: 'center',
      render: (_: unknown, __: BookingTemplate, index: number) => index + 1,
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      width: 160,
      render: (value: string) => <TemplateNameCell name={value} />,
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      width: 120,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: 'Delivery',
      dataIndex: 'delivery',
      width: 120,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
  ];

  return (
    <BookingTemplateModalShell
      open={open}
      onClose={onCancel}
      icon={Icons.clipboardList}
      title="Select Booking Template"
      subtitle="Choose a saved template to pre-fill your booking form"
    >
      <Table
        className="booking-template-modal__table"
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
        }}
        bordered={false}
        size="middle"
        scroll={{ x: 640 }}
        locale={{
          emptyText: (
            <Flex vertical align="center" gap={8} className="booking-template-modal__empty">
              <AppIcon icon={Icons.inbox} size={28} />
              <Text type="secondary">No templates available</Text>
            </Flex>
          ),
        }}
      />
    </BookingTemplateModalShell>
  );
}
