// Modified by Sekar Nagarajan (2026-08-26 16:57)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import type { CustomerAdvisory } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const SEVERITY_OPTIONS = [
  { label: "Info (General Update)", value: "INFO" },
  { label: "Warning (Operational Delay)", value: "WARNING" },
  { label: "Urgent (Port Closure / Severe Weather)", value: "URGENT" },
] as const;

const advisoryCreateSchema = z.object({
  severity: z.enum(["INFO", "WARNING", "URGENT"]),
  title: z.string().min(1, "Advisory headline is required"),
  message: z.string().min(1, "Announcement message is required"),
});

type AdvisoryCreateForm = z.infer<typeof advisoryCreateSchema>;

const DEFAULT_ADVISORY_FORM: AdvisoryCreateForm = {
  severity: "WARNING",
  title: "",
  message: "",
};

interface CustomerAdvisoryViewProps {
  advisories: CustomerAdvisory[];
  onCreate: (adv: Omit<CustomerAdvisory, "id">) => Promise<CustomerAdvisory>;
}

function advisoriesSignature(items: CustomerAdvisory[]) {
  return items
    .map(
      (item) =>
        `${item.id}:${item.isActive}:${item.severity}:${item.title}:${item.message}`,
    )
    .join("|");
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

export function CustomerAdvisoryView({
  advisories,
  onCreate,
}: CustomerAdvisoryViewProps) {
  const toast = useToast();
  const [draft, setDraft] = useState<CustomerAdvisory[]>(advisories);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    advisoriesSignature(advisories),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = advisoriesSignature(advisories);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(advisories);
  }

  const form = useForm<AdvisoryCreateForm>({
    resolver: zodResolver(advisoryCreateSchema) as Resolver<AdvisoryCreateForm>,
    defaultValues: DEFAULT_ADVISORY_FORM,
    mode: "onChange",
  });

  const activeCount = draft.filter((item) => item.isActive).length;
  const urgentCount = draft.filter((item) => item.severity === "URGENT").length;

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    form.reset(DEFAULT_ADVISORY_FORM);
  };

  const handleSave = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await onCreate({
        title: values.title.trim(),
        message: values.message.trim(),
        severity: values.severity,
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "2026-12-31",
        isActive: true,
      });
      toast.success("Operational advisory published successfully");
      closeDrawer();
    } catch {
      toast.error("Failed to publish advisory");
    } finally {
      setIsSaving(false);
    }
  });

  const columns: ColumnsType<CustomerAdvisory> = [
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "left",
      render: (_: unknown, record: CustomerAdvisory) => (
        <Tag
          className="admin-status-tag"
          color={record.isActive ? "success" : "default"}
        >
          {record.isActive ? "Active" : "Expired"}
        </Tag>
      ),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (sev: CustomerAdvisory["severity"]) => {
        const colorMap = {
          INFO: "blue",
          WARNING: "orange",
          URGENT: "red",
        } as const;
        const labelMap = {
          INFO: "Info",
          WARNING: "Warning",
          URGENT: "Urgent",
        } as const;
        return (
          <Tag className="admin-status-tag" color={colorMap[sev]}>
            {labelMap[sev]}
          </Tag>
        );
      },
    },
    {
      title: "Advisory Title",
      dataIndex: "title",
      key: "title",
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: "Announcement Content",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Effective Period",
      key: "period",
      render: (_: unknown, record: CustomerAdvisory) =>
        `${record.effectiveFrom} ~ ${record.effectiveTo}`,
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.bell}
      title="Customer Advisory Admin"
      subtitle="Publish operational advisories, port congestion alerts, and announcements."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.plus} size={16} />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Publish New Advisory
        </AppButton>
      }
    >
      <div className="admin-advisory-form">
        <div className="admin-menu-summary" aria-label="Advisory summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.bell} size={14} />
            <Text>
              {draft.length} Advisor{draft.length === 1 ? "y" : "ies"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.checkCircle} size={14} />
            <Text>{activeCount} Active</Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--warning">
            <AppIcon icon={Icons.stopCircle} size={14} />
            <Text>{urgentCount} Urgent</Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<CustomerAdvisory>
            dataSource={draft}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
            size="middle"
          />
        </div>
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Publish Operational Advisory"
        placement="right"
        dialogSize="md"
        destroyOnClose
        maskClosable={!isSaving}
        keyboard={!isSaving}
        classNames={{
          body: "custom-scroll",
          footer: "admin-drawer-footer-bar",
        }}
        footer={
          <div className="admin-drawer-actions form-step-footer">
            <AppButton onClick={closeDrawer} disabled={isSaving}>
              Cancel
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.save} size={16} />}
              loading={isSaving}
              onClick={handleSave}
            >
              Save
            </AppButton>
          </div>
        }
      >
        <div className="admin-drawer-body">
          <FormSelect
            control={form.control}
            name="severity"
            label={optLabel("Alert Severity")}
            size="large"
            options={[...SEVERITY_OPTIONS]}
            className="admin-stack-full"
            formItemProps={FIELD_ITEM_PROPS}
          />
          <FormInput
            control={form.control}
            name="title"
            label={reqLabel("Advisory Headline")}
            size="large"
            placeholder="e.g. Typhoon Delay at Shanghai Port"
            formItemProps={FIELD_ITEM_PROPS}
          />
          <FormTextarea
            control={form.control}
            name="message"
            label={reqLabel("Detailed Announcement Message")}
            rows={4}
            className="custom-scroll"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </div>
      </AppDrawer>
    </AdminPanelShell>
  );
}
