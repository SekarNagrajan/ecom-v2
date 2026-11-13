// Modified by Sekar Nagarajan (2026-09-29 16:45)
import { Tag } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { ModuleRecordCardShell } from "../../../../components/shared/record-card";
import type { SIListDTO } from "../../types/si.types";
import { getSiStatusLabel, getSiStatusTagColor } from "../../utils/si-status";
import { SiListActions } from "./si-list-actions";

export interface SiListCardProps {
  record: SIListDTO;
  isSelected?: boolean;
  onOpenWizard: (id: string) => void;
  onView: (record: SIListDTO) => void;
  onCancel: (record: SIListDTO) => void;
}

interface MetaField {
  key: string;
  label: string;
  value: string;
}

export function SiListCard({
  record,
  isSelected,
  onOpenWizard,
  onView,
  onCancel,
}: SiListCardProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const title = record.siNo || record.bookingNo || record.blNo || record.id;
  const lane = `${record.origin} → ${record.delivery}`;

  const handleCardActivate = () => {
    if (record.status === "Create SI" || record.status === "Draft") {
      onOpenWizard(record.id);
      return;
    }
    onView(record);
  };

  const metaFields: MetaField[] = [
    {
      key: "booking",
      label: t("labels.booking"),
      value: record.bookingNo || "—",
    },
    {
      key: "bl",
      label: t("labels.blNo"),
      value: record.blNo || "—",
    },
    {
      key: "agency",
      label: t("labels.agencyRef"),
      value: record.agencyRefNo || "—",
    },
    {
      key: "created",
      label: t("labels.created"),
      value: record.createdDate || "—",
    },
    {
      key: "submitted",
      label: t("labels.submitted"),
      value: record.submittedDate || "—",
    },
  ];

  return (
    <ModuleRecordCardShell
      isSelected={isSelected}
      onClick={handleCardActivate}
      contentStyle={{ gap: 0, padding: 0 }}
      containerProps={{ className: "si-record-card" }}
    >
      <div className="si-record-card__body">
        <div className="si-record-card__header">
          <div className="si-record-card__title-row">
            <span className="si-record-card__title" title={title}>
              {title}
            </span>
            <Tag
              className="si-record-card__status module-status-tag"
              color={getSiStatusTagColor(record.status)}
            >
              {getSiStatusLabel(record.status, t)}
            </Tag>
          </div>
          <div className="si-record-card__lane" title={lane}>
            <AppIcon icon={Icons.mapPin} size={14} />
            <span>{lane}</span>
          </div>
        </div>

        <div className="si-record-card__meta">
          {metaFields.map((field) => (
            <div key={field.key} className="si-record-card__meta-item">
              <div className="si-record-card__meta-copy">
                <span className="si-record-card__meta-label">
                  {field.label}
                </span>
                <span
                  className="si-record-card__meta-value"
                  title={field.value}
                >
                  {field.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="si-record-card__footer"
        onClick={(event) => event.stopPropagation()}
      >
        <SiListActions
          record={record}
          onOpenWizard={onOpenWizard}
          onView={onView}
          onCancel={onCancel}
        />
      </div>
    </ModuleRecordCardShell>
  );
}
