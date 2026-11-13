// Modified by Sekar Nagarajan (2026-09-15 12:10)
import { FormattedDate } from "@solverminds/shared-ui";
import { Tag } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { ModuleRecordCardShell } from "../../../../components/shared/record-card";
import type { BLListDTO, BLPrintType } from "../../types/bl.types";
import { getBLListStatusColor, getBLStatusLabel } from "../../utils/bl-status";
import { BillOfLadingRowActions } from "../BillOfLadingRowActions";

export interface BlListCardProps {
  row: BLListDTO;
  isSelected?: boolean;
  onView: (blNo: string) => void;
  onEdit: (blNo: string) => void;
  onPrint: (blNo: string, type: BLPrintType) => void;
  onVerify: (blNo: string) => void;
  onCancel: (blNo: string) => void;
  onCharges: (blNo: string) => void;
  onManifest: (blNo: string, mcnNo: string | null) => void;
  showChargeSummary?: boolean;
  showNnPrint?: boolean;
  showReadyToConfirm?: boolean;
  enableTermsOnConfirmedEdit?: boolean;
  hideAgencyRef?: boolean;
}

interface MetaField {
  key: string;
  label: string;
  value: ReactNode;
  valueTitle?: string;
  // icon: ReactNode;
}

export function BlListCard({
  row,
  isSelected,
  onView,
  onEdit,
  onPrint,
  onVerify,
  onCancel,
  onCharges,
  onManifest,
  showChargeSummary = true,
  showNnPrint = true,
  showReadyToConfirm = false,
  enableTermsOnConfirmedEdit = true,
  hideAgencyRef = false,
}: BlListCardProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const lane = `${row.origin} → ${row.delivery}`;
  const statusLabel = row.isLocked
    ? t("status.locked")
    : getBLStatusLabel(row.status, t);

  const metaFields: MetaField[] = [
    {
      key: "booking",
      label: t("card.booking"),
      value: row.bookingNo || "—",
      valueTitle: row.bookingNo || undefined,
      // icon: <AppIcon icon={NavIcons.booking} size={14} />,
    },
    {
      key: "mcn",
      label: t("card.mcn"),
      value: row.mcnNo || "—",
      valueTitle: row.mcnNo || undefined,
      // icon: <AppIcon icon={Icons.clipboardList} size={14} />,
    },
    ...(hideAgencyRef
      ? []
      : [
          {
            key: "agency",
            label: t("card.agencyRef"),
            value: row.agencyRefNo || "—",
            valueTitle: row.agencyRefNo || undefined,
            // icon: <AppIcon icon={Icons.building} size={14} />,
          },
        ]),
    {
      key: "load",
      label: t("card.load"),
      value: row.loadPort || "—",
      valueTitle: row.loadPort || undefined,
      // icon: <AppIcon icon={Icons.mapPin} size={14} />,
    },
    {
      key: "discharge",
      label: t("card.discharge"),
      value: row.dischargePort || "—",
      valueTitle: row.dischargePort || undefined,
      // icon: <AppIcon icon={Icons.anchor} size={14} />,
    },
    {
      key: "created",
      label: t("card.created"),
      value: row.createdDate ? <FormattedDate value={row.createdDate} /> : "—",
      // icon: <AppIcon icon={Icons.calendar} size={14} />,
    },
  ];

  return (
    <ModuleRecordCardShell
      isSelected={isSelected}
      onClick={() => onView(row.blNo)}
      contentStyle={{ gap: 0, padding: 0 }}
      containerProps={{ className: "bl-record-card" }}
    >
      <div className="bl-record-card__body">
        <div className="bl-record-card__header">
          <div className="bl-record-card__title-row">
            <span className="bl-record-card__title" title={row.blNo}>
              {row.blNo}
            </span>
            <Tag
              className="bl-record-card__status bl-status-tag module-status-tag"
              color={getBLListStatusColor(row)}
            >
              {statusLabel}
            </Tag>
          </div>
          <div className="bl-record-card__lane" title={lane}>
            <AppIcon icon={Icons.mapPin} size={14} />
            <span>{lane}</span>
          </div>
        </div>

        <div className="bl-record-card__meta">
          {metaFields.map((field) => (
            <div key={field.key} className="bl-record-card__meta-item">
              <span className="bl-record-card__meta-icon">{field.icon}</span>
              <div className="bl-record-card__meta-copy">
                <span className="bl-record-card__meta-label">
                  {field.label}
                </span>
                <span
                  className="bl-record-card__meta-value"
                  title={field.valueTitle}
                >
                  {field.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bl-record-card__footer"
        onClick={(event) => event.stopPropagation()}
      >
        <BillOfLadingRowActions
          row={row}
          onView={onView}
          onEdit={onEdit}
          onPrint={onPrint}
          onVerify={onVerify}
          onCancel={onCancel}
          onCharges={onCharges}
          onManifest={onManifest}
          showChargeSummary={showChargeSummary}
          showNnPrint={showNnPrint}
          showReadyToConfirm={showReadyToConfirm}
          enableTermsOnConfirmedEdit={enableTermsOnConfirmedEdit}
        />
      </div>
    </ModuleRecordCardShell>
  );
}
