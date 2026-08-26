// Modified by Sekar Nagarajan (2026-08-26 16:57)
import { AppButton } from "@solverminds/shared-ui";
import { InputNumber, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { CutoffConfig } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

type CutoffHourField =
  | "vgmCutoffHours"
  | "siCutoffHours"
  | "bookingCutoffHours";

interface CutoffConfigViewProps {
  cutoffConfigs: CutoffConfig[];
  onSave: (items: CutoffConfig[]) => void | Promise<void>;
}

function cutoffSignature(items: CutoffConfig[]) {
  return items
    .map(
      (item) =>
        `${item.id}:${item.vgmCutoffHours}:${item.siCutoffHours}:${item.bookingCutoffHours}`,
    )
    .join("|");
}

export function CutoffConfigView({
  cutoffConfigs,
  onSave,
}: CutoffConfigViewProps) {
  const [draft, setDraft] = useState<CutoffConfig[]>(cutoffConfigs);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    cutoffSignature(cutoffConfigs),
  );
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = cutoffSignature(cutoffConfigs);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(cutoffConfigs);
  }

  const portCount = new Set(draft.map((item) => item.portCode)).size;

  const handleHourChange = (
    id: string,
    field: CutoffHourField,
    val: number | null,
  ) => {
    const fallback =
      field === "vgmCutoffHours" ? 12 : field === "siCutoffHours" ? 24 : 48;
    setDraft((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: val || fallback } : item,
      ),
    );
  };

  const handleCancel = () => {
    setDraft(cutoffConfigs);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnsType<CutoffConfig> = [
    {
      title: "Actions",
      key: "actions",
      width: 320,
      fixed: "left",
      render: (_: unknown, record: CutoffConfig) => (
        <div className="admin-cutoff-actions">
          <label className="admin-cutoff-actions__field">
            <Text type="secondary" className="admin-cutoff-actions__label">
              VGM
            </Text>
            <InputNumber
              size="large"
              min={1}
              className="admin-cutoff-input"
              value={record.vgmCutoffHours}
              aria-label="VGM Cut-off Hours"
              onChange={(newVal) =>
                handleHourChange(record.id, "vgmCutoffHours", newVal)
              }
            />
          </label>
          <label className="admin-cutoff-actions__field">
            <Text type="secondary" className="admin-cutoff-actions__label">
              SI
            </Text>
            <InputNumber
              size="large"
              min={1}
              className="admin-cutoff-input"
              value={record.siCutoffHours}
              aria-label="SI Cut-off Hours"
              onChange={(newVal) =>
                handleHourChange(record.id, "siCutoffHours", newVal)
              }
            />
          </label>
          <label className="admin-cutoff-actions__field">
            <Text type="secondary" className="admin-cutoff-actions__label">
              Booking
            </Text>
            <InputNumber
              size="large"
              min={1}
              className="admin-cutoff-input"
              value={record.bookingCutoffHours}
              aria-label="Booking Cut-off Hours"
              onChange={(newVal) =>
                handleHourChange(record.id, "bookingCutoffHours", newVal)
              }
            />
          </label>
        </div>
      ),
    },
    {
      title: "Port Code",
      dataIndex: "portCode",
      key: "portCode",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: "Vessel Name",
      dataIndex: "vesselName",
      key: "vesselName",
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: "Voyage No",
      dataIndex: "voyageNo",
      key: "voyageNo",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="geekblue">
          {val}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.clock}
      title="Cut-off Time Configuration"
      subtitle="Set port and vessel call cut-off thresholds for VGM, SI, and Booking submissions."
    >
      <div className="admin-cutoff-form">
        <div className="admin-menu-summary" aria-label="Cut-off summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.clock} size={14} />
            <Text>
              {draft.length} Vessel Call{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.mapPin} size={14} />
            <Text>
              {portCount} Port{portCount === 1 ? "" : "s"}
            </Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<CutoffConfig>
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
