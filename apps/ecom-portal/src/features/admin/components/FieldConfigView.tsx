// Modified by Sekar Nagarajan (2026-08-26 16:57)
import { AppButton, AppSwitch } from "@solverminds/shared-ui";
import { Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { FieldConfig } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

interface FieldConfigViewProps {
  fields: FieldConfig[];
  onSave: (fields: FieldConfig[]) => void | Promise<void>;
}

function fieldsSignature(items: FieldConfig[]) {
  return items
    .map((item) => `${item.id}:${item.isVisible}:${item.isRequired}`)
    .join("|");
}

export function FieldConfigView({ fields, onSave }: FieldConfigViewProps) {
  const [draft, setDraft] = useState<FieldConfig[]>(fields);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    fieldsSignature(fields),
  );
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = fieldsSignature(fields);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(fields);
  }

  const visibleCount = draft.filter((item) => item.isVisible).length;
  const requiredCount = draft.filter((item) => item.isRequired).length;
  const moduleCount = new Set(draft.map((item) => item.formName)).size;

  const handleToggle = (
    id: string,
    prop: "isVisible" | "isRequired",
    checked: boolean,
  ) => {
    setDraft((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [prop]: checked } : item)),
    );
  };

  const handleCancel = () => {
    setDraft(fields);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnsType<FieldConfig> = [
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "left",
      render: (_: unknown, record: FieldConfig) => (
        <div className="admin-field-actions">
          <Tooltip title={record.isVisible ? "Hide Field" : "Show Field"}>
            <span className="admin-field-actions__item">
              <Text type="secondary" className="admin-field-actions__label">
                Visible
              </Text>
              <AppSwitch
                checked={record.isVisible}
                aria-label={record.isVisible ? "Hide Field" : "Show Field"}
                onChange={(checked) =>
                  handleToggle(record.id, "isVisible", checked)
                }
              />
            </span>
          </Tooltip>
          <Tooltip
            title={record.isRequired ? "Make Optional" : "Make Required"}
          >
            <span className="admin-field-actions__item">
              <Text type="secondary" className="admin-field-actions__label">
                Required
              </Text>
              <AppSwitch
                checked={record.isRequired}
                aria-label={
                  record.isRequired ? "Make Optional" : "Make Required"
                }
                onChange={(checked) =>
                  handleToggle(record.id, "isRequired", checked)
                }
              />
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Form Module",
      dataIndex: "formName",
      key: "formName",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: "Field Identifier",
      dataIndex: "fieldId",
      key: "fieldId",
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: "Field Display Label",
      dataIndex: "fieldLabel",
      key: "fieldLabel",
    },
    {
      title: "Visible",
      dataIndex: "isVisible",
      key: "isVisible",
      render: (val: boolean) => (
        <Tag className="admin-status-tag" color={val ? "success" : "default"}>
          {val ? "Visible" : "Hidden"}
        </Tag>
      ),
    },
    {
      title: "Mandatory",
      dataIndex: "isRequired",
      key: "isRequired",
      render: (val: boolean) => (
        <Tag className="admin-status-tag" color={val ? "warning" : "default"}>
          {val ? "Required" : "Optional"}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.formInput}
      title="Form Field Configuration"
      subtitle="Dynamically manage form field visibility and mandatory rules across all forms."
    >
      <div className="admin-field-form">
        <div className="admin-menu-summary" aria-label="Field config summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.formInput} size={14} />
            <Text>
              {draft.length} Field{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.layoutGrid} size={14} />
            <Text>
              {moduleCount} Module{moduleCount === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.eye} size={14} />
            <Text>{visibleCount} Visible</Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--warning">
            <AppIcon icon={Icons.lock} size={14} />
            <Text>{requiredCount} Required</Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<FieldConfig>
            dataSource={draft}
            columns={columns}
            rowKey="id"
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
