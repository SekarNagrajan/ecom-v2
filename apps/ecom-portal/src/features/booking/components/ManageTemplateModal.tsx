// Modified by Sekar Nagarajan (2026-09-01 20:14)
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

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
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
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
  const { t } = useTranslation(["booking", "common"]);
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
      toast.success(t("toasts.templateDeleted"));
      queryClient.invalidateQueries({ queryKey: ["booking-templates"] });
    },
    onError: () => {
      toast.error(t("toasts.templateDeleteFailed"));
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
      okText: t("common:actions.close"),
    });
  };

  const handleEdit = (template: BookingTemplate) => {
    initializeFromBooking(template.payload);
    onCancel();
    navigate({ to: "/app/booking/new" });
    toast.success(t("toasts.templateLoaded", { name: template.templateName }));
  };

  const handleDelete = (template: BookingTemplate) => {
    confirm.danger({
      title: t("confirms.deleteTemplateTitle"),
      content: t("confirms.deleteTemplateContent", { name: template.templateName }),
      okText: t("common:actions.delete"),
      cancelText: t("common:actions.cancel"),
      onOk: () => deleteMutation.mutateAsync(template.id),
    });
  };

  const columns: ColumnsType<BookingTemplate> = [
    {
      title: t("templates.columns.sno"),
      key: "sno",
      width: 72,
      align: "center",
      render: (_: unknown, __: BookingTemplate, index: number) => index + 1,
    },
    {
      title: t("templates.columns.templateName"),
      dataIndex: "templateName",
      ellipsis: true,
      render: (value: string) => <TemplateNameCell name={value} />,
    },
    {
      title: t("templates.columns.origin"),
      dataIndex: "origin",
      width: 180,
      ellipsis: true,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: t("templates.columns.delivery"),
      dataIndex: "delivery",
      width: 180,
      ellipsis: true,
      render: (value: string) => <TemplateRouteCell value={value} />,
    },
    {
      title: t("templates.columns.action"),
      key: "action",
      width: 132,
      align: "center",
      render: (_: unknown, record: BookingTemplate) => (
        <ListActionsRow>
          <ListActionButton
            title={t("common:actions.edit")}
            icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
            onClick={() => handleEdit(record)}
          />
          <ListActionButton
            title={t("common:actions.delete")}
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
      title={t("templates.manageTitle")}
      subtitle={t("templates.manageSubtitle")}
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
            t("templates.showingRange", { from: range[0], to: range[1], total }),
        }}
        bordered={false}
        size="middle"
        tableLayout="fixed"
        locale={{
          emptyText: (
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title={t("templates.emptyManage")}
              style={{ padding: 12 }}
            />
          ),
        }}
      />
    </BookingTemplateModalShell>
  );
}
