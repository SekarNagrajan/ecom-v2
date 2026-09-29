// Modified by Sekar Nagarajan (2026-09-08 15:03)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Tag, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavBillOfLadingIcon,
} from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { BLListDTO } from "../../types/bl.types";
import {
  canOpenBlWizard,
  getBLListStatusColor,
  getBLStatusLabel,
} from "../../utils/bl-status";
import { BlModuleStyles } from "../bl-module-styles";
import { BlDetailsViewer } from "./BlDetailsViewer";

const { Title, Text } = Typography;

interface BlViewDrawerProps {
  record: BLListDTO;
  onClose: () => void;
}

export function BlViewDrawer({ record, onClose }: BlViewDrawerProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const navigate = useNavigate();
  const showEdit = canOpenBlWizard(record);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/bl/${record.blNo}/edit` });
  };

  return (
    <>
      <BlModuleStyles />
      <AppDrawer
        open
        onClose={onClose}
        dialogSize="lg"
        classNames={{
          body: "bl-drawer-body custom-scroll",
          footer: "bl-drawer-footer-bar",
        }}
        title={
          <div className="bl-drawer-title">
            <AppIcon icon={NavBillOfLadingIcon} size={22} />
            <div className="bl-drawer-title__copy">
              <Title level={4} className="bl-drawer-title__text">
                {formatModuleScreenTitle(
                  t("drawers.viewBillOfLading"),
                  record.blNo,
                )}
              </Title>
              <div className="bl-drawer-title__row">
                <Text type="secondary" className="bl-drawer-title__meta">
                  {t("labels.booking")}: <strong>{record.bookingNo}</strong>
                  {record.agencyRefNo ? (
                    <>
                      {" "}
                      · {t("labels.agencyRef")}:{" "}
                      <strong>{record.agencyRefNo}</strong>
                    </>
                  ) : null}
                </Text>
                <div className="bl-drawer-title__tags">
                  <Tag
                    className="bl-status-tag"
                    color={getBLListStatusColor(record)}
                  >
                    {record.isLocked
                      ? t("status.locked")
                      : getBLStatusLabel(record.status, t)}
                  </Tag>
                  {record.mcnNo ? (
                    <Tag color="default">
                      {t("labels.mcn")}: {record.mcnNo}
                    </Tag>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <Flex
            justify="flex-end"
            align="center"
            gap="small"
            wrap
            className="bl-drawer-actions custom-scroll"
          >
            <Tooltip title={t("actions.close")}>
              <AppButton onClick={onClose}>{t("actions.close")}</AppButton>
            </Tooltip>
            {showEdit ? (
              <Tooltip title={t("actions.editBillOfLading")}>
                <AppButton
                  type="primary"
                  icon={
                    <AppIcon icon={Icons.squarePen} size={16} tone="edit" />
                  }
                  onClick={handleEdit}
                >
                  {t("actions.edit")}
                </AppButton>
              </Tooltip>
            ) : null}
          </Flex>
        }
      >
        <div className="bl-view-route-strip">
          <div className="bl-view-route-port bl-view-route-port--origin">
            <div className="bl-view-route-port__label">
              <AppIcon icon={Icons.mapPin} size={14} />
              {t("labels.origin")}
            </div>
            <Title level={4} className="bl-view-route-port__code">
              {record.origin}
            </Title>
          </div>

          <div className="bl-view-route-connector">
            <span className="bl-view-route-connector__label">
              {t("labels.route")}
            </span>
            <div className="bl-view-route-connector__line">
              <span className="bl-view-route-connector__track" />
              <AppIcon icon={Icons.arrowRight} size={14} />
              <span className="bl-view-route-connector__track" />
            </div>
            <AppIcon icon={Icons.ship} size={16} />
          </div>

          <div className="bl-view-route-port bl-view-route-port--delivery">
            <div className="bl-view-route-port__label">
              <AppIcon icon={Icons.mapPin} size={14} />
              {t("labels.delivery")}
            </div>
            <Title level={4} className="bl-view-route-port__code">
              {record.delivery}
            </Title>
          </div>
        </div>

        <div className="bl-summary-chips">
          <div className="bl-summary-chip">
            <span>
              <span className="bl-summary-chip__label">{t("columns.blNo")}</span>
              <span className="bl-summary-chip__value">{record.blNo}</span>
            </span>
          </div>
          <div className="bl-summary-chip">
            <span>
              <span className="bl-summary-chip__label">{t("columns.siNo")}</span>
              <span className="bl-summary-chip__value">
                {record.siNo || "—"}
              </span>
            </span>
          </div>
          <div className="bl-summary-chip">
            <span>
              <span className="bl-summary-chip__label">{t("labels.created")}</span>
              <span className="bl-summary-chip__value">
                {record.createdDate || "—"}
              </span>
            </span>
          </div>
          <div className="bl-summary-chip">
            <span>
              <span className="bl-summary-chip__label">
                {t("status.confirmed")}
              </span>
              <span className="bl-summary-chip__value">
                {record.confirmedDate || "—"}
              </span>
            </span>
          </div>
        </div>

        <BlDetailsViewer
          blNo={record.blNo}
          activityHints={{
            createdDate: record.createdDate,
            confirmedDate: record.confirmedDate,
            status: record.status,
            isLocked: record.isLocked,
          }}
        />
      </AppDrawer>
    </>
  );
}
