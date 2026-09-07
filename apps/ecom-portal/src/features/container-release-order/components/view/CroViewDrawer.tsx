// Modified by Sekar Nagarajan (2026-09-07 12:28)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Typography } from "antd";
import type { ReactNode } from "react";

import {
  AppIcon,
  Icons,
  NavDeliveryOrderIcon,
} from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import {
  useCRODetailQuery,
  useCRODownloadMutation,
} from "../../api/cro.queries";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
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
  const { data: croData, isLoading } = useCRODetailQuery(croNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useCRODownloadMutation();

  const originPort = parsePortLabel(croData?.loadPort || "");
  const deliveryPort = parsePortLabel(croData?.dischargePort || "");
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;
  const printLabel = croData
    ? getCroPrintStatusLabel(croData.printStatus)
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
              Container Release Order
            </Text>
            <Title
              level={5}
              className="cro-drawer-title__text"
              copyable={{
                text: croNo,
                tooltips: ["Copy CRO number", "Copied"],
              }}
            >
              {croNo}
            </Title>
            <div className="cro-drawer-title__meta-row">
              <Text type="secondary" className="cro-drawer-title__meta">
                Booking:{" "}
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
                    {croData.releaseStatus}
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
            Download PDF
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            disabled={!croData}
            onClick={handleDownload}
          >
            Print Container Release Order
          </AppButton>
        </div>
      }
    >
      {isLoading || !croData ? (
        <CroLoadingCenter />
      ) : (
        <>
          <div className="cro-route-strip">
            <Text className="cro-route-strip__eyebrow">Port to Port</Text>
            <div className="cro-route-strip__body">
              <div className="cro-route-port cro-route-port--origin">
                <div className="cro-route-port__label">
                  <span className="cro-route-port__pin cro-route-port__pin--origin app-icon-inherit">
                    <AppIcon icon={Icons.mapPin} size={15} />
                  </span>
                  Load Port
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
                <span className="cro-route-connector__label">Port to Port</span>
              </div>

              <div className="cro-route-port cro-route-port--delivery">
                <div className="cro-route-port__label">
                  <span className="cro-route-port__pin cro-route-port__pin--delivery app-icon-inherit">
                    <AppIcon icon={Icons.mapPin} size={15} />
                  </span>
                  Discharge
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
                Release Order Details
              </Text>
            </div>
            <div className="cro-meta-grid">
              <MetaField label="CRO Number">{croData.croNo}</MetaField>
              <MetaField label="Booking No">
                {croData.bookingNo || "—"}
              </MetaField>
              <MetaField label="CRO Date">
                {croData.croDate ? (
                  <FormattedDate value={croData.croDate} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label="CRO Validity">
                {croData.validTo ? (
                  <FormattedDate value={croData.validTo} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label="Release Status">
                <Tag
                  className="cro-status-tag"
                  color={getCroReleaseStatusColor(croData.releaseStatus)}
                >
                  {croData.releaseStatus}
                </Tag>
              </MetaField>
              <MetaField label="Print Status">
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
                Shipment Details
              </Text>
            </div>
            <div className="cro-meta-grid">
              <MetaField label="Vessel">{croData.vessel || "—"}</MetaField>
              <MetaField label="Voyage">{croData.voyage || "—"}</MetaField>
              <MetaField label="Cont Type">
                {croData.eqpType || "—"}
              </MetaField>
              <MetaField label="Empty Release Depot">
                {croData.emptyReleaseDepot || "—"}
              </MetaField>
              <MetaField label="Qty Booked">{croData.qtyBooked}</MetaField>
              <MetaField label="Qty Released">{croData.qtyReleased}</MetaField>
            </div>
          </section>

          <section className="cro-drawer-section">
            <div className="cro-drawer-section__head">
              <AppIcon icon={Icons.container} size={16} />
              <Text strong className="cro-drawer-section__title">
                Containers
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
                  title: "Container No",
                  dataIndex: "containerNo",
                  key: "containerNo",
                },
                {
                  title: "Size/Type",
                  dataIndex: "eqpSize",
                  key: "eqpSize",
                  width: 120,
                },
                {
                  title: "Seal No",
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
                    title="No containers on this release"
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
                <span>
                  This release order is valid until{" "}
                  <FormattedDate value={croData.validTo} />.
                </span>
              }
            />
          ) : null}
        </>
      )}
    </AppDrawer>
  );
}
