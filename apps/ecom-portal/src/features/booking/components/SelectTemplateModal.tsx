// Modified by Sekar Nagarajan (2026-09-01 20:14)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { AppIcon, Icons } from "../../../components/icons";
import {
  BookingTemplateModalShell,
  TemplateNameCell,
  TemplateRouteCell,
} from "../../../components/shared/booking-template-modal-shell";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import type { BookingTemplate } from "../types/booking.types";

interface SelectTemplateModalProps {
  open: boolean;
  onCancel: () => void;
}

export function SelectTemplateModal({
  open,
  onCancel,
}: SelectTemplateModalProps) {
  const toast = useToast();
  const { initializeFromBooking } = useBookingStore();

  const { data, isLoading } = useQuery({
    queryKey: ["booking-templates"],
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
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
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
      title: "S.No",
      key: "sno",
      width: 72,
      align: "center",
      render: (_: unknown, __: BookingTemplate, index: number) => index + 1,
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      ellipsis: true,
      render: (value: string) => <TemplateNameCell name={value} />,
    },
    {
      title: "Origin",
      dataIndex: "origin",
      width: 180,
      ellipsis: true,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: "Delivery",
      dataIndex: "delivery",
      width: 180,
      ellipsis: true,
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
      dialogSize="lg"
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
        tableLayout="fixed"
        locale={{
          emptyText: (
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title="No templates available"
              style={{ padding: 12 }}
            />
          ),
        }}
      />
    </BookingTemplateModalShell>
  );
}
