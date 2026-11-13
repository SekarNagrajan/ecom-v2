// Modified by Sekar Nagarajan (2026-10-19 14:33)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Space, Tag, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBillOfLadingIcon } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../../constants/module-titles";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import type { BLDTO, BLRowStatus } from "../types/bl.types";
import { getBLStatusColor, getBLStatusLabel } from "../utils/bl-status";
import { BlLoadingCenter } from "./bl-loading-center";
import { BlDetailsViewer } from "./view/BlDetailsViewer";

const { Text } = Typography;

const TIMELINE_STATUS_KEYS: BLRowStatus[] = ["D", "S", "C", "I"];

interface BillOfLadingViewProps {
  detail: BLDTO | undefined;
  loading: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onVerify?: () => void;
  onCancel?: () => void;
  onPrint?: (type: "draft" | "original" | "nn") => void;
  onCharges?: () => void;
  extra?: ReactNode;
}

interface HeaderMetaItem {
  key: string;
  label: string;
  value: string;
}

/**
 * Full-page B/L view: header card (title · actions · status + lifecycle
 * stepper · key references) followed by the shared read-only details body.
 */
export function BillOfLadingView({
  detail,
  loading,
  onBack,
  onEdit,
  onVerify,
  onCancel,
  onPrint,
  onCharges,
  extra,
}: BillOfLadingViewProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();

  if (loading) {
    return <BlLoadingCenter fill />;
  }

  if (!detail) {
    return <Text type="danger">{t("empty.blNotFound")}</Text>;
  }

  const statusIndex = TIMELINE_STATUS_KEYS.indexOf(detail.status);
  const showDraftPrint = Boolean(onPrint) && detail.status !== "I";
  const showOriginalPrint =
    Boolean(onPrint) && detail.status === "C" && detail.printCount > 0;
  const showAccept = Boolean(onVerify) && detail.status === "D";
  const showCancel = Boolean(onCancel) && detail.status === "S";
  const showEdit = Boolean(onEdit) && detail.status !== "I";

  const metaItems: HeaderMetaItem[] = [
    { key: "booking", label: t("labels.booking"), value: detail.bookingNo },
    { key: "si", label: t("columns.siNo"), value: detail.siNo || "—" },
    ...(detail.mcnNo
      ? [{ key: "mcn", label: t("labels.mcn"), value: detail.mcnNo }]
      : []),
    ...(detail.agencyRefNo
      ? [
          {
            key: "agencyRef",
            label: t("labels.agencyRef"),
            value: detail.agencyRefNo,
          },
        ]
      : []),
  ];

  return (
    <Space direction="vertical" size="large" className="feature-page-stack">
      <Card className="feature-page-card bl-view-header-card" bordered={false}>
        <ModuleScreenHeader
          icon={NavBillOfLadingIcon}
          title={formatModuleScreenTitle(
            MODULE_TITLES.billOfLading,
            detail.blNo,
          )}
          marginBottom={0}
          extra={
            <div className="bl-view-actions custom-scroll">
              <AppButton
                icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
                onClick={onBack}
              >
                {t("actions.back")}
              </AppButton>
              {onCharges ? (
                <Tooltip title={t("drawers.chargeSummary")}>
                  <AppButton
                    icon={<AppIcon icon={Icons.dollarSign} size={16} />}
                    onClick={onCharges}
                  >
                    {t("actions.charges")}
                  </AppButton>
                </Tooltip>
              ) : null}
              {showDraftPrint && onPrint ? (
                <AppButton
                  icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
                  onClick={() => onPrint("draft")}
                >
                  {t("actions.draftPrint")}
                </AppButton>
              ) : null}
              {showEdit && onEdit ? (
                <Tooltip title={t("actions.editBillOfLading")}>
                  <AppButton
                    icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                    onClick={onEdit}
                  >
                    {t("actions.edit")}
                  </AppButton>
                </Tooltip>
              ) : null}
              {extra}
              {showCancel && onCancel ? (
                <AppButton
                  danger
                  icon={<AppIcon icon={Icons.circleX} size={16} tone="delete" />}
                  onClick={onCancel}
                >
                  {t("actions.cancel")}
                </AppButton>
              ) : null}
              {showAccept && onVerify ? (
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.checkCircle} size={16} />}
                  onClick={onVerify}
                >
                  {t("actions.accept")}
                </AppButton>
              ) : null}
              {showOriginalPrint && onPrint ? (
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.printer} size={16} />}
                  onClick={() => onPrint("original")}
                >
                  {t("actions.originalPrint")}
                </AppButton>
              ) : null}
            </div>
          }
        />

        <div className="bl-view-summary">
          <div className="bl-view-summary__meta">
            <Tag
              className="bl-status-tag"
              color={getBLStatusColor(detail.status)}
            >
              {getBLStatusLabel(detail.status, t)}
            </Tag>
            {metaItems.map((item) => (
              <span key={item.key} className="bl-view-meta">
                <span className="bl-view-meta__label">{item.label}</span>
                <span className="bl-view-meta__value">{item.value}</span>
              </span>
            ))}
          </div>

          <ol
            className="bl-status-stepper"
            aria-label={t("labels.statusProgress")}
          >
            {TIMELINE_STATUS_KEYS.map((key, index) => {
              const isDone = index < statusIndex;
              const isCurrent = index === statusIndex;
              return (
                <li
                  key={key}
                  className={[
                    "bl-status-stepper__step",
                    isDone ? "is-done" : "",
                    isCurrent ? "is-current" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="bl-status-stepper__dot app-icon-inherit">
                    {isDone ? (
                      <AppIcon icon={Icons.check} size={12} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <span className="bl-status-stepper__label">
                    {getBLStatusLabel(key, t)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <Card className="feature-page-card bl-view-body-card" bordered={false}>
        <BlDetailsViewer
          blNo={detail.blNo}
          activityHints={{ status: detail.status }}
        />
      </Card>
    </Space>
  );
}
