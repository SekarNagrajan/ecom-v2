// Modified by Sekar Nagarajan (2026-09-15 12:15)
import { Tag } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import { ModuleRecordCardShell } from "../../../../components/shared/record-card";
import type { SIListDTO } from "../../types/si.types";
import { getSiStatusTagColor } from "../../utils/si-status";
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
  // icon: ReactNode;
}

export function SiListCard({
  record,
  isSelected,
  onOpenWizard,
  onView,
  onCancel,
}: SiListCardProps) {
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
      label: "Booking",
      value: record.bookingNo || "—",
      // icon: <AppIcon icon={NavIcons.booking} size={14} />,
    },
    {
      key: "bl",
      label: "B/L No",
      value: record.blNo || "—",
      // icon: <AppIcon icon={NavIcons.billOfLading} size={14} />,
    },
    {
      key: "agency",
      label: "Agency Ref",
      value: record.agencyRefNo || "—",
      // icon: <AppIcon icon={Icons.building} size={14} />,
    },
    {
      key: "created",
      label: "Created",
      value: record.createdDate || "—",
      // icon: <AppIcon icon={Icons.calendar} size={14} />,
    },
    {
      key: "submitted",
      label: "Submitted",
      value: record.submittedDate || "—",
      // icon: <AppIcon icon={Icons.clock} size={14} />,
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
              {record.status}
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
              <span className="si-record-card__meta-icon">{field.icon}</span>
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
