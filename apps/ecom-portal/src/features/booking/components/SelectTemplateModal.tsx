// Modified by Sekar Nagarajan (2026-09-01 20:14)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["booking", "common"]);
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
    toast.success(t("toasts.templateApplied", { name: template.templateName }));
    onCancel();
  };

  const columns: ColumnsType<BookingTemplate> = [
    {
      title: t("templates.columns.action"),
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
          {t("common:actions.select")}
        </AppButton>
      ),
    },
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
  ];

  return (
    <BookingTemplateModalShell
      open={open}
      onClose={onCancel}
      icon={Icons.clipboardList}
      title={t("templates.selectTitle")}
      subtitle={t("templates.selectSubtitle")}
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
              title={t("templates.emptySelect")}
              style={{ padding: 12 }}
            />
          ),
        }}
      />
    </BookingTemplateModalShell>
  );
}
