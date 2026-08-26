// Modified by Sekar Nagarajan (2026-08-26 16:41)
import { AppButton, AppCheckbox } from "@solverminds/shared-ui";
import { Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SpecialPrivilege } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

type PrivilegeFlag =
  | "canView"
  | "canCreate"
  | "canEdit"
  | "canDelete"
  | "canApprove";

const PRIVILEGE_FLAGS: {
  field: PrivilegeFlag;
  label: string;
}[] = [
  { field: "canView", label: "View" },
  { field: "canCreate", label: "Create" },
  { field: "canEdit", label: "Edit" },
  { field: "canDelete", label: "Delete" },
  { field: "canApprove", label: "Approve" },
];

interface SpecialPrivilegesViewProps {
  privileges: SpecialPrivilege[];
  onSave: (privs: SpecialPrivilege[]) => void | Promise<void>;
}

function rowKey(item: SpecialPrivilege) {
  return `${item.roleId}_${item.moduleCode}`;
}

function privilegesSignature(items: SpecialPrivilege[]) {
  return items
    .map(
      (item) =>
        `${rowKey(item)}:${item.canView}:${item.canCreate}:${item.canEdit}:${item.canDelete}:${item.canApprove}`,
    )
    .join("|");
}

function grantCount(item: SpecialPrivilege) {
  return PRIVILEGE_FLAGS.filter(({ field }) => item[field]).length;
}

export function SpecialPrivilegesView({
  privileges,
  onSave,
}: SpecialPrivilegesViewProps) {
  const [draft, setDraft] = useState<SpecialPrivilege[]>(privileges);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    privilegesSignature(privileges),
  );
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = privilegesSignature(privileges);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(privileges);
  }

  const roleCount = new Set(draft.map((item) => item.roleId)).size;
  const moduleCount = new Set(draft.map((item) => item.moduleCode)).size;
  const fullAccessCount = draft.filter(
    (item) => grantCount(item) === PRIVILEGE_FLAGS.length,
  ).length;

  const handleCheck = (
    key: string,
    field: PrivilegeFlag,
    checked: boolean,
  ) => {
    setDraft((prev) =>
      prev.map((item) =>
        rowKey(item) === key ? { ...item, [field]: checked } : item,
      ),
    );
  };

  const handleCancel = () => {
    setDraft(privileges);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnsType<SpecialPrivilege> = [
    {
      title: "Actions",
      key: "actions",
      width: 280,
      fixed: "left",
      render: (_: unknown, record: SpecialPrivilege) => (
        <div className="admin-priv-actions custom-scroll">
          {PRIVILEGE_FLAGS.map(({ field, label }) => (
            <Tooltip key={field} title={`${label} Permission`}>
              <span className="admin-priv-actions__item">
                <AppCheckbox
                  checked={record[field]}
                  aria-label={`${label} Permission`}
                  onChange={(event) =>
                    handleCheck(rowKey(record), field, event.target.checked)
                  }
                >
                  {label}
                </AppCheckbox>
              </span>
            </Tooltip>
          ))}
        </div>
      ),
    },
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="purple">
          {val}
        </Tag>
      ),
    },
    {
      title: "Module Code",
      dataIndex: "moduleCode",
      key: "moduleCode",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: "Grants",
      key: "grants",
      width: 110,
      render: (_: unknown, record: SpecialPrivilege) => {
        const count = grantCount(record);
        const isFull = count === PRIVILEGE_FLAGS.length;
        return (
          <Tag
            className="admin-status-tag"
            color={isFull ? "success" : count === 0 ? "default" : "processing"}
          >
            {count}/{PRIVILEGE_FLAGS.length}
            {isFull ? " Full" : ""}
          </Tag>
        );
      },
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.key}
      title="Special Privileges Matrix"
      subtitle="Assign granular action permissions for internal agency and vendor roles."
    >
      <div className="admin-priv-form">
        <div className="admin-menu-summary" aria-label="Privileges summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.users} size={14} />
            <Text>
              {roleCount} Role{roleCount === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.layoutGrid} size={14} />
            <Text>
              {moduleCount} Module{moduleCount === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.shieldCheck} size={14} />
            <Text>{fullAccessCount} Full Access</Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.key} size={14} />
            <Text>
              {draft.length} Matrix Row{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<SpecialPrivilege>
            dataSource={draft}
            columns={columns}
            rowKey={rowKey}
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
