// Modified by Sekar Nagarajan (2026-09-07 12:28)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavDeliveryOrderIcon,
} from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import { useModuleTitles } from "../../../../i18n/use-module-titles";
import {
  useCRODetailQuery,
  useCRODownloadMutation,
} from "../../api/cro.queries";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
  getCroReleaseStatusLabel,
} from "../../utils/cro-status";
import { parsePortLabel } from "../../utils/cro.utils";
import { CroLoadingCenter } from "../cro-loading-center";

const { Text, Title } = Typography;

interface CroViewDrawerProps {
  croNo: string;
  onClose: () => void;
}

function MetaField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="cro-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="cro-meta-item__value">{children}</span>
    </div>
  );
}

export function CroViewDrawer({ croNo, onClose }: CroViewDrawerProps) {
  const { t } = useTranslation([
    "container-release-order",
    "common",
    "modules",
  ]);
  const MODULE_TITLES = useModuleTitles();
  const { data: croData, isLoading } = useCRODetailQuery(croNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useCRODownloadMutation();

  const originPort = parsePortLabel(croData?.loadPort || "");
  const deliveryPort = parsePortLabel(croData?.dischargePort || "");
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;
  const printLabel = croData
    ? getCroPrintStatusLabel(croData.printStatus, t)
    : "";
  const printColor = croData
    ? getCroPrintStatusColor(croData.printStatus)
    : "default";

  const handleDownload = () => {
    downloadDoc(croNo);
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "cro-drawer-body custom-scroll",
        footer: "cro-drawer-footer",
      }}
      title={
        <div className="cro-drawer-title">
          <span className="cro-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavDeliveryOrderIcon} size={22} />
          </span>
          <div className="cro-drawer-title__copy">
            <Text className="cro-drawer-title__eyebrow">
              {MODULE_TITLES.containerReleaseOrder}
            </Text>
            <Title
              level={5}
              className="cro-drawer-title__text"
              copyable={{
                text: croNo,
                tooltips: [t("actions.copyCroNumber"), t("actions.copied")],
              }}
            >
              {croNo}
            </Title>
            <div className="cro-drawer-title__meta-row">
              <Text type="secondary" className="cro-drawer-title__meta">
                {t("drawer.bookingPrefix")}{" "}
                <span className="cro-drawer-title__bl">
                  {croData?.bookingNo || "—"}
                </span>
              </Text>
              {croData ? (
                <>
                  <Tag
                    className="cro-status-tag"
                    color={getCroReleaseStatusColor(croData.releaseStatus)}
                  >
                    {getCroReleaseStatusLabel(croData.releaseStatus, t)}
                  </Tag>
                  <Tag className="cro-status-tag" color={printColor}>
                    {printLabel}
                  </Tag>
                </>
              ) : null}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="cro-drawer-actions custom-scroll">
          <AppButton
            type="default"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
            loading={isDownloading}
            disabled={!croData}
            onClick={handleDownload}
          >
            {t("actions.downloadPdf")}
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            disabled={!croData}
            onClick={handleDownload}
          >
            {t("actions.printContainerReleaseOrder")}
          </AppButton>
        </div>
      }
    >
      {isLoading || !croData ? (
        <CroLoadingCenter />
      ) : (
        <>
          <div className="cro-route-strip">
            <Text className="cro-route-strip__eyebrow">
              {t("drawer.routeEyebrow")}
            </Text>
            <div className="cro-route-strip__body">
              <div className="cro-route-port cro-route-port--origin">
                <div className="cro-route-port__label">
                  <span className="cro-route-port__pin cro-route-port__pin--origin app-icon-inherit">
                    <AppIcon icon={Icons.mapPin} size={15} />
                  </span>
                  {t("drawer.loadPort")}
                </div>
                <Title
                  level={3}
                  className="cro-route-port__code cro-route-port__code--origin"
                >
                  {originPort.code || "—"}
                </Title>
                <Text className="cro-route-port__name">
                  {showOriginName ? originPort.name : originPort.code || "—"}
                </Text>
              </div>

              <div className="cro-route-connector" aria-hidden>
                <div className="cro-route-connector__line">
                  <span className="cro-route-connector__dot cro-route-connector__dot--origin" />
                  <span className="cro-route-connector__track cro-route-connector__track--origin" />
                  <span className="cro-route-connector__ship app-icon-inherit">
                    <AppIcon icon={Icons.ship} size={16} />
                  </span>
                  <span className="cro-route-connector__track cro-route-connector__track--delivery" />
                  <span className="cro-route-connector__dot cro-route-connector__dot--delivery" />
                </div>
                <span className="cro-route-connector__label">
                  {t("drawer.routeEyebrow")}
                </span>
              </div>

              <div className="cro-route-port cro-route-port--delivery">
                <div className="cro-route-port__label">
                  <span className="cro-route-port__pin cro-route-port__pin--delivery app-icon-inherit">
                    <AppIcon icon={Icons.mapPin} size={15} />
                  </span>
                  {t("drawer.discharge")}
                </div>
                <Title
                  level={3}
                  className="cro-route-port__code cro-route-port__code--delivery"
                >
                  {deliveryPort.code || "—"}
                </Title>
                <Text className="cro-route-port__name">
                  {showDeliveryName
                    ? deliveryPort.name
                    : deliveryPort.code || "—"}
                </Text>
              </div>
            </div>
          </div>

          <section className="cro-drawer-section">
            <div className="cro-drawer-section__head">
              <AppIcon icon={Icons.fileText} size={16} />
              <Text strong className="cro-drawer-section__title">
                {t("drawer.sections.details")}
              </Text>
            </div>
            <div className="cro-meta-grid">
              <MetaField label={t("drawer.labels.croNumber")}>
                {croData.croNo}
              </MetaField>
              <MetaField label={t("drawer.labels.bookingNo")}>
                {croData.bookingNo || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.croDate")}>
                {croData.croDate ? (
                  <FormattedDate value={croData.croDate} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label={t("drawer.labels.croValidity")}>
                {croData.validTo ? (
                  <FormattedDate value={croData.validTo} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label={t("drawer.labels.releaseStatus")}>
                <Tag
                  className="cro-status-tag"
                  color={getCroReleaseStatusColor(croData.releaseStatus)}
                >
                  {getCroReleaseStatusLabel(croData.releaseStatus, t)}
                </Tag>
              </MetaField>
              <MetaField label={t("drawer.labels.printStatus")}>
                <Tag className="cro-status-tag" color={printColor}>
                  {printLabel}
                </Tag>
              </MetaField>
            </div>
          </section>

          <section className="cro-drawer-section">
            <div className="cro-drawer-section__head">
              <AppIcon icon={Icons.ship} size={16} />
              <Text strong className="cro-drawer-section__title">
                {t("drawer.sections.shipment")}
              </Text>
            </div>
            <div className="cro-meta-grid">
              <MetaField label={t("drawer.labels.vessel")}>
                {croData.vessel || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.voyage")}>
                {croData.voyage || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.contType")}>
                {croData.eqpType || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.emptyReleaseDepot")}>
                {croData.emptyReleaseDepot || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.qtyBooked")}>
                {croData.qtyBooked}
              </MetaField>
              <MetaField label={t("drawer.labels.qtyReleased")}>
                {croData.qtyReleased}
              </MetaField>
            </div>
          </section>

          <section className="cro-drawer-section">
            <div className="cro-drawer-section__head">
              <AppIcon icon={Icons.container} size={16} />
              <Text strong className="cro-drawer-section__title">
                {t("drawer.sections.containers")}
              </Text>
            </div>
            <Table
              className="cro-containers-table"
              size="small"
              pagination={false}
              rowKey="containerNo"
              dataSource={croData.containers}
              columns={[
                {
                  title: t("drawer.containerColumns.containerNo"),
                  dataIndex: "containerNo",
                  key: "containerNo",
                },
                {
                  title: t("drawer.containerColumns.sizeType"),
                  dataIndex: "eqpSize",
                  key: "eqpSize",
                  width: 120,
                },
                {
                  title: t("drawer.containerColumns.sealNo"),
                  dataIndex: "sealNo",
                  key: "sealNo",
                  width: 120,
                },
              ]}
              locale={{
                emptyText: (
                  <ModuleEmptyState
                    artSize="sm"
                    variant="blank"
                    title={t("empty.noContainers")}
                    style={{ padding: 12 }}
                  />
                ),
              }}
            />
          </section>

          {croData.validTo ? (
            <Alert
              type="info"
              showIcon
              className="cro-drawer-alert"
              icon={<AppIcon icon={Icons.info} size={16} />}
              message={
                <Trans
                  i18nKey="drawer.alerts.validUntil"
                  ns="container-release-order"
                  components={{
                    date: <FormattedDate value={croData.validTo} />,
                  }}
                />
              }
            />
          ) : null}
        </>
      )}
    </AppDrawer>
  );
}
