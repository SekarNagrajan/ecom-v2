// Modified by Sekar Nagarajan (2026-08-28 00:35)
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { AppIcon, Icons } from "../../../components/icons";
import {
    BookingTemplateModalShell,
    TemplateNameCell,
    TemplateRouteCell,
} from "../../../components/shared/booking-template-modal-shell";
import {
    ListActionButton,
    ListActionsRow,
} from "../../../components/shared/list-action-button";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import type { BookingTemplate } from "../types/booking.types";

const { Text } = Typography;

interface ManageTemplateModalProps {
  open: boolean;
  onCancel: () => void;
}

export function ManageTemplateModal({
  open,
  onCancel,
}: ManageTemplateModalProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { initializeFromBooking } = useBookingStore();

  const { data, isLoading } = useQuery({
    queryKey: ["booking-templates"],
    queryFn: bookingApi.getTemplates,
    enabled: open,
  });
  const templates = Array.isArray(data) ? data : [];

  const deleteMutation = useMutation({
    mutationFn: bookingApi.deleteTemplate,
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["booking-templates"] });
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  const handleView = (template: BookingTemplate) => {
    confirm.info({
      title: template.templateName,
      content: (
        <div className="booking-template-modal__confirm-content">
          <Text>
            <Text strong>Origin:</Text> {template.origin}
          </Text>
          <Text>
            <Text strong>Delivery:</Text> {template.delivery}
          </Text>
        </div>
      ),
      okText: "Close",
    });
  };

  const handleEdit = (template: BookingTemplate) => {
    initializeFromBooking(template.payload);
    onCancel();
    navigate({ to: "/app/booking/new" });
    toast.success(`Loaded template: ${template.templateName}`);
  };

  const handleDelete = (template: BookingTemplate) => {
    confirm.danger({
      title: "Delete Template",
      content: `Are you sure you want to delete "${template.templateName}"? This action cannot be undone.`,
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutateAsync(template.id),
    });
  };

  const columns: ColumnsType<BookingTemplate> = [
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
      width: 200,
      render: (value: string) => <TemplateNameCell name={value} />,
    },
    {
      title: "Origin",
      dataIndex: "origin",
      width: 140,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: "Delivery",
      dataIndex: "delivery",
      width: 140,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_: unknown, record: BookingTemplate) => (
        <ListActionsRow>
          <ListActionButton
            title="View"
            icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
            onClick={() => handleView(record)}
          />
          <ListActionButton
            title="Edit"
            icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
            onClick={() => handleEdit(record)}
          />
          <ListActionButton
            title="Delete"
            icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
            danger
            disabled={deleteMutation.isPending}
            onClick={() => handleDelete(record)}
          />
        </ListActionsRow>
      ),
    },
  ];

  return (
    <BookingTemplateModalShell
      open={open}
      onClose={onCancel}
      icon={Icons.settings}
      title="Manage Booking Templates"
      subtitle="View, edit, or remove your saved booking templates"
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
        scroll={{ x: 720 }}
        locale={{
          emptyText: (
            <Flex
              vertical
              align="center"
              gap={8}
              className="booking-template-modal__empty"
            >
              <AppIcon icon={Icons.inbox} size={28} />
              <Text type="secondary">No templates saved yet</Text>
            </Flex>
          ),
        }}
      />
    </BookingTemplateModalShell>
  );
}
