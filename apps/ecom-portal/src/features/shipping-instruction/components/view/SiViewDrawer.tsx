// Modified by Sekar Nagarajan (2026-09-29 16:45)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Tag, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavShippingInstructionIcon,
} from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { SIListDTO } from "../../types/si.types";
import {
  canOpenSiWizard,
  getSiBlStatusLabel,
  getSiStatusLabel,
  getSiStatusTagColor,
} from "../../utils/si-status";
import { SiDetailsViewer } from "./SiDetailsViewer";

const { Title, Text } = Typography;

interface SiViewDrawerProps {
  record: SIListDTO;
  onClose: () => void;
}

export function SiViewDrawer({ record, onClose }: SiViewDrawerProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const navigate = useNavigate();
  const showEdit = canOpenSiWizard(record.status);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/shipping-instruction/wizard/${record.id}` });
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{
        body: "si-drawer-body custom-scroll",
        footer: "si-drawer-footer-bar",
      }}
      title={
        <div className="si-drawer-title">
          <AppIcon icon={NavShippingInstructionIcon} size={22} />
          <div className="si-drawer-title__copy">
            <Title level={4} className="si-drawer-title__text">
              {formatModuleScreenTitle(
                t("drawer.viewTitle"),
                record.siNo || record.bookingNo,
              )}
            </Title>
            <div className="si-drawer-title__row">
              <Text type="secondary" className="si-drawer-title__meta">
                {t("labels.booking")}: <strong>{record.bookingNo}</strong>
                {record.agencyRefNo ? (
                  <>
                    {" "}
                    · {t("labels.agencyRef")}:{" "}
                    <strong>{record.agencyRefNo}</strong>
                  </>
                ) : null}
              </Text>
              <div className="si-drawer-title__tags">
                <Tag color={getSiStatusTagColor(record.status)}>
                  {getSiStatusLabel(record.status, t)}
                </Tag>
                {record.blStatus ? (
                  <Tag color="default">
                    {t("drawer.blStatusTag", {
                      status: getSiBlStatusLabel(record.blStatus, t),
                    })}
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
          className="si-drawer-actions custom-scroll"
        >
          <Tooltip title={t("common:actions.close")}>
            <AppButton onClick={onClose}>
              {t("common:actions.close")}
            </AppButton>
          </Tooltip>
          {showEdit ? (
            <Tooltip title={t("actions.editShippingInstruction")}>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                onClick={handleEdit}
              >
                {t("actions.editSi")}
              </AppButton>
            </Tooltip>
          ) : null}
        </Flex>
      }
    >
      <div className="si-route-strip">
        <div className="si-route-port si-route-port--origin">
          <div className="si-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            {t("labels.origin")}
          </div>
          <Title level={4} className="si-route-port__code">
            {record.origin}
          </Title>
        </div>

        <div className="si-route-connector">
          <span className="si-route-connector__label">
            {t("labels.portToPort")}
          </span>
          <div className="si-route-connector__line">
            <span className="si-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="si-route-connector__track" />
          </div>
          <AppIcon icon={Icons.ship} size={16} />
        </div>

        <div className="si-route-port si-route-port--delivery">
          <div className="si-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            {t("labels.delivery")}
          </div>
          <Title level={4} className="si-route-port__code">
            {record.delivery}
          </Title>
        </div>
      </div>

      <div className="si-summary-chips">
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">{t("labels.siNo")}</span>
            <span className="si-summary-chip__value">{record.siNo || "—"}</span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">{t("labels.blNo")}</span>
            <span className="si-summary-chip__value">{record.blNo || "—"}</span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">
              {t("labels.created")}
            </span>
            <span className="si-summary-chip__value">
              {record.createdDate || "—"}
            </span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">
              {t("labels.submitted")}
            </span>
            <span className="si-summary-chip__value">
              {record.submittedDate || "—"}
            </span>
          </span>
        </div>
      </div>

      <SiDetailsViewer
        siId={record.id}
        activityHints={{
          createdDate: record.createdDate,
          submittedDate: record.submittedDate,
          status: record.status,
        }}
      />
    </AppDrawer>
  );
}
