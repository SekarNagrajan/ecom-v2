// Modified by Sekar Nagarajan (2026-08-26 16:57)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormInput,
  FormInputNumber,
} from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Image, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import type { BannerConfig } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const bannerCreateSchema = z.object({
  title: z.string().min(1, "Banner title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  sortOrder: z.number().min(1),
});

type BannerCreateForm = z.infer<typeof bannerCreateSchema>;

const DEFAULT_BANNER_FORM: BannerCreateForm = {
  title: "",
  imageUrl: "/hero-bg.png",
  sortOrder: 1,
};

interface BannerManagerViewProps {
  banners: BannerConfig[];
  onCreate: (banner: Omit<BannerConfig, "id">) => Promise<BannerConfig>;
}

function bannersSignature(items: BannerConfig[]) {
  return items
    .map((item) => `${item.id}:${item.isActive}:${item.sortOrder}:${item.title}`)
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

export function BannerManagerView({
  banners,
  onCreate,
}: BannerManagerViewProps) {
  const toast = useToast();
  const [draft, setDraft] = useState<BannerConfig[]>(banners);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    bannersSignature(banners),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = bannersSignature(banners);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(banners);
  }

  const form = useForm<BannerCreateForm>({
    resolver: zodResolver(bannerCreateSchema) as Resolver<BannerCreateForm>,
    defaultValues: DEFAULT_BANNER_FORM,
    mode: "onChange",
  });

  const activeCount = draft.filter((item) => item.isActive).length;
  const sortedDraft = [...draft].sort((a, b) => a.sortOrder - b.sortOrder);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    form.reset(DEFAULT_BANNER_FORM);
  };

  const handleSave = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await onCreate({
        title: values.title.trim(),
        imageUrl: values.imageUrl.trim(),
        sortOrder: values.sortOrder,
        isActive: true,
      });
      toast.success("Banner uploaded successfully");
      closeDrawer();
    } catch {
      toast.error("Failed to create banner");
    } finally {
      setIsSaving(false);
    }
  });

  const columns: ColumnsType<BannerConfig> = [
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "left",
      render: (_: unknown, record: BannerConfig) => (
        <Tag
          className="admin-status-tag"
          color={record.isActive ? "success" : "default"}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Sort",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 80,
      render: (val: number) => (
        <Tag className="admin-code-tag" color="blue">
          #{val}
        </Tag>
      ),
    },
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) => (
        <Image
          src={url}
          width={100}
          height={45}
          className="admin-banner-thumb"
        />
      ),
    },
    { title: "Banner Title", dataIndex: "title", key: "title" },
    {
      title: "Image Asset Path",
      dataIndex: "imageUrl",
      key: "path",
      render: (val: string) => <Text code>{val}</Text>,
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.image}
      title="Banner & Asset Manager"
      subtitle="Manage landing hero slides, promotional carousels, and priority media assets."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.upload} size={16} />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Upload New Banner
        </AppButton>
      }
    >
      <div className="admin-banner-form">
        <div className="admin-menu-summary" aria-label="Banner summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.image} size={14} />
            <Text>
              {draft.length} Banner{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.checkCircle} size={14} />
            <Text>{activeCount} Active</Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<BannerConfig>
            dataSource={sortedDraft}
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
        title="Upload Landing Hero Banner"
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
          <FormInput
            control={form.control}
            name="title"
            label={reqLabel("Banner Title")}
            size="large"
            placeholder="e.g. SOLAS VGM Digital Filing"
            formItemProps={FIELD_ITEM_PROPS}
          />
          <FormInput
            control={form.control}
            name="imageUrl"
            label={optLabel("Image Asset URL")}
            size="large"
            formItemProps={FIELD_ITEM_PROPS}
          />
          <FormInputNumber
            control={form.control}
            name="sortOrder"
            label={reqLabel("Carousel Sequence Rank")}
            size="large"
            min={1}
            numericMode="positive-integer"
            className="admin-stack-full"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </div>
      </AppDrawer>
    </AdminPanelShell>
  );
}
