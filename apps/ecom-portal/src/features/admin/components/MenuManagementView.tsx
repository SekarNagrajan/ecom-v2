// Modified by Sekar Nagarajan (2026-08-26 16:38)
import { AppButton, AppSwitch } from "@solverminds/shared-ui";
import { Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { MenuConfig } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

interface MenuManagementViewProps {
  menus: MenuConfig[];
  onSave: (menus: MenuConfig[]) => void | Promise<void>;
}

function menusSignature(items: MenuConfig[]) {
  return items
    .map(
      (item) =>
        `${item.refNo}:${item.isEnabled}:${item.orderNo}:${item.category}`,
    )
    .join("|");
}

export function MenuManagementView({
  menus,
  onSave,
}: MenuManagementViewProps) {
  const [draft, setDraft] = useState<MenuConfig[]>(menus);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    menusSignature(menus),
  );
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = menusSignature(menus);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(menus);
  }

  const enabledCount = draft.filter((item) => item.isEnabled).length;
  const restrictedCount = draft.filter((item) => item.category === "P").length;
  const sortedDraft = [...draft].sort((a, b) => a.orderNo - b.orderNo);

  const handleToggle = (refNo: string, checked: boolean) => {
    setDraft((prev) =>
      prev.map((item) =>
        item.refNo === refNo ? { ...item, isEnabled: checked } : item,
      ),
    );
  };

  const handleCancel = () => {
    setDraft(menus);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnsType<MenuConfig> = [
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "left",
      render: (_: unknown, record: MenuConfig) => (
        <Tooltip
          title={record.isEnabled ? "Disable Menu Item" : "Enable Menu Item"}
        >
          <span className="admin-menu-action">
            <AppSwitch
              checked={record.isEnabled}
              aria-label={
                record.isEnabled ? "Disable Menu Item" : "Enable Menu Item"
              }
              onChange={(checked) => handleToggle(record.refNo, checked)}
            />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 80,
    },
    {
      title: "Ref Code",
      dataIndex: "refNo",
      key: "refNo",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: "Resource Key / Label",
      dataIndex: "labelValue",
      key: "labelValue",
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: MenuConfig["category"]) => (
        <Tag
          className="admin-status-tag"
          color={cat === "D" ? "success" : "warning"}
        >
          {cat === "D" ? "Default Access" : "Permission Restricted"}
        </Tag>
      ),
    },
    {
      title: "Icon Class",
      dataIndex: "classValue",
      key: "classValue",
      render: (val: string) => <Text type="secondary">{val}</Text>,
    },
    {
      title: "Route Target",
      dataIndex: "attrValue",
      key: "attrValue",
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      key: "isEnabled",
      render: (enabled: boolean) => (
        <Tag
          className="admin-status-tag"
          color={enabled ? "success" : "default"}
        >
          {enabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.list}
      title="Global Menu Management"
      subtitle="Configure menu hierarchy, visibility, and category entitlement rules."
    >
      <div className="admin-menu-form">
        <div className="admin-menu-summary" aria-label="Menu summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.list} size={14} />
            <Text>
              {draft.length} Item{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.checkCircle} size={14} />
            <Text>{enabledCount} Enabled</Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--warning">
            <AppIcon icon={Icons.lock} size={14} />
            <Text>{restrictedCount} Restricted</Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<MenuConfig>
            dataSource={sortedDraft}
            columns={columns}
            rowKey="refNo"
            pagination={false}
            scroll={{ x: true }}
            size="middle"
          />
        </div>

        <div className="admin-form-footer form-step-footer">
          <AppButton onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSaving}
            onClick={handleUpdate}
          >
            Update
          </AppButton>
        </div>
      </div>
    </AdminPanelShell>
  );
}
