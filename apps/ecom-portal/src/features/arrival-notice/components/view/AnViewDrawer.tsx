// Modified by Sekar Nagarajan (2026-09-07 12:17)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Typography } from "antd";
import type { ReactNode } from "react";

import {
  AppIcon,
  Icons,
  NavArrivalNoticeIcon,
} from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import {
  useArrivalNoticeDetailQuery,
  useArrivalNoticeDownloadMutation,
} from "../../api/arrival-notice.queries";
import type { ArrivalNoticeChargeLine } from "../../types/arrival-notice.types";
import {
  formatArnAmount,
  getArnPrintStatusColor,
  getArnPrintStatusLabel,
} from "../../utils/arn-status";
import { parsePortLabel } from "../../utils/arn.utils";
import { ArnLoadingCenter } from "../arn-loading-center";

const { Text, Title } = Typography;

interface AnViewDrawerProps {
  anNo: string;
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
    <div className="arn-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="arn-meta-item__value">{children}</span>
    </div>
  );
}

export function AnViewDrawer({ anNo, onClose }: AnViewDrawerProps) {
  const { data: arnData, isLoading } = useArrivalNoticeDetailQuery(anNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useArrivalNoticeDownloadMutation();

  const dischargePort = parsePortLabel(arnData?.dischargePort || "");
  const showDischargeName = dischargePort.name !== dischargePort.code;
  const chargeLines = arnData?.chargeLines ?? [];
  const freeTime = arnData?.freeTime;
  const statusLabel = arnData
    ? getArnPrintStatusLabel(arnData.printStatus)
    : "";
  const statusColor = arnData
    ? getArnPrintStatusColor(arnData.printStatus)
    : "default";
  const lastFreeDay = freeTime?.lastFreeDay || arnData?.lastFreeDay;

  const handleDownload = () => {
    downloadDoc(anNo);
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "arn-drawer-body custom-scroll",
        footer: "arn-drawer-footer",
      }}
      title={
        <div className="arn-drawer-title">
          <span className="arn-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavArrivalNoticeIcon} size={22} />
          </span>
          <div className="arn-drawer-title__copy">
            <Text className="arn-drawer-title__eyebrow">Arrival Notice</Text>
            <Title
              level={5}
              className="arn-drawer-title__text"
              copyable={{
                text: anNo,
                tooltips: ["Copy AN number", "Copied"],
              }}
            >
              {anNo}
            </Title>
            <div className="arn-drawer-title__meta-row">
              <Text type="secondary" className="arn-drawer-title__meta">
                B/L:{" "}
                <span className="arn-drawer-title__bl">
                  {arnData?.blNumber || "—"}
                </span>
              </Text>
              {arnData ? (
                <Tag className="arn-status-tag" color={statusColor}>
                  {statusLabel}
                </Tag>
              ) : null}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="arn-drawer-actions custom-scroll">
          <AppButton
            type="default"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
            loading={isDownloading}
            disabled={!arnData}
            onClick={handleDownload}
          >
            Download PDF
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            disabled={!arnData}
            onClick={handleDownload}
          >
            Print Arrival Notice
          </AppButton>
        </div>
      }
    >
      {isLoading || !arnData ? (
        <ArnLoadingCenter />
      ) : (
        <>
          <div className="arn-route-strip">
            <Text className="arn-route-strip__eyebrow">Vessel to Port</Text>
            <div className="arn-route-strip__body">
              <div className="arn-route-port arn-route-port--vessel">
                <div className="arn-route-port__label">
                  <span className="arn-route-port__pin arn-route-port__pin--vessel app-icon-inherit">
                    <AppIcon icon={Icons.ship} size={15} />
                  </span>
                  Vessel
                </div>
                <Title
                  level={3}
                  className="arn-route-port__code arn-route-port__code--vessel"
                >
                  {arnData.vessel || "—"}
                </Title>
                <Text className="arn-route-port__name">
                  {arnData.voyage || "—"}
                </Text>
              </div>

              <div className="arn-route-connector" aria-hidden>
                <div className="arn-route-connector__line">
                  <span className="arn-route-connector__dot arn-route-connector__dot--vessel" />
                  <span className="arn-route-connector__track arn-route-connector__track--vessel" />
                  <span className="arn-route-connector__ship app-icon-inherit">
                    <AppIcon icon={Icons.bell} size={16} />
                  </span>
                  <span className="arn-route-connector__track arn-route-connector__track--discharge" />
                  <span className="arn-route-connector__dot arn-route-connector__dot--discharge" />
                </div>
                <span className="arn-route-connector__label">Arriving</span>
              </div>

              <div className="arn-route-port arn-route-port--discharge">
                <div className="arn-route-port__label">
                  <span className="arn-route-port__pin arn-route-port__pin--discharge app-icon-inherit">
                    <AppIcon icon={Icons.mapPin} size={15} />
                  </span>
                  Discharge
                </div>
                <Title
                  level={3}
                  className="arn-route-port__code arn-route-port__code--discharge"
                >
                  {dischargePort.code || "—"}
                </Title>
                <Text className="arn-route-port__name">
                  {showDischargeName
                    ? dischargePort.name
                    : dischargePort.code || "—"}
                </Text>
              </div>
            </div>
          </div>

          <section className="arn-drawer-section">
            <div className="arn-drawer-section__head">
              <AppIcon icon={Icons.bell} size={16} />
              <Text strong className="arn-drawer-section__title">
                Arrival Notice Details
              </Text>
            </div>
            <div className="arn-meta-grid">
              <MetaField label="AN Number">{arnData.anNo}</MetaField>
              <MetaField label="B/L Number">
                {arnData.blNumber || "—"}
              </MetaField>
              <MetaField label="ETA">
                {arnData.etaDate ? (
                  <FormattedDate value={arnData.etaDate} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label="Arrival Date">
                {arnData.arrivalDate ? (
                  <FormattedDate value={arnData.arrivalDate} />
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label="Charges Due">
                {arnData.chargesDue > 0
                  ? formatArnAmount(arnData.chargesDue, arnData.currency)
                  : "—"}
              </MetaField>
              <MetaField label="Print Status">
                <Tag className="arn-status-tag" color={statusColor}>
                  {statusLabel}
                </Tag>
              </MetaField>
            </div>
          </section>

          <section className="arn-drawer-section">
            <div className="arn-drawer-section__head">
              <AppIcon icon={Icons.ship} size={16} />
              <Text strong className="arn-drawer-section__title">
                Shipment Details
              </Text>
            </div>
            <div className="arn-meta-grid">
              <MetaField label="Vessel">{arnData.vessel || "—"}</MetaField>
              <MetaField label="Voyage">{arnData.voyage || "—"}</MetaField>
              <MetaField label="Terminal">{arnData.terminal || "—"}</MetaField>
              <MetaField label="Consignee">
                {arnData.consignee || "—"}
              </MetaField>
              <MetaField label="Notify Party">
                {arnData.notifyParty || "—"}
              </MetaField>
              <MetaField label="Manifest / IGM">
                {arnData.manifestRef || arnData.igmNo || "—"}
              </MetaField>
            </div>
          </section>

          {freeTime ? (
            <section className="arn-drawer-section">
              <div className="arn-drawer-section__head">
                <AppIcon icon={Icons.clock} size={16} />
                <Text strong className="arn-drawer-section__title">
                  Free Time
                </Text>
              </div>
              <div className="arn-meta-grid arn-meta-grid--free-time">
                <MetaField label="Free Days">{freeTime.days}</MetaField>
                <MetaField label="Last Free Day">
                  <FormattedDate value={freeTime.lastFreeDay} />
                </MetaField>
                {arnData.demurrageFrom ? (
                  <MetaField label="Demurrage From">
                    <FormattedDate value={arnData.demurrageFrom} />
                  </MetaField>
                ) : null}
              </div>
            </section>
          ) : null}

          {chargeLines.length > 0 ? (
            <section className="arn-drawer-section">
              <div className="arn-drawer-section__head">
                <AppIcon icon={Icons.fileText} size={16} />
                <Text strong className="arn-drawer-section__title">
                  Charges
                </Text>
              </div>
              <Table<ArrivalNoticeChargeLine>
                className="arn-charges-table"
                size="small"
                pagination={false}
                rowKey={(row) => `${row.chargeCode}-${row.description}`}
                dataSource={chargeLines}
                columns={[
                  {
                    title: "Code",
                    dataIndex: "chargeCode",
                    key: "chargeCode",
                    width: 100,
                  },
                  {
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                  },
                  {
                    title: "Amount",
                    key: "amount",
                    width: 140,
                    render: (_value, row) =>
                      formatArnAmount(row.amount, row.currency),
                  },
                ]}
              />
            </section>
          ) : null}

          <section className="arn-drawer-section">
            <div className="arn-drawer-section__head">
              <AppIcon icon={Icons.container} size={16} />
              <Text strong className="arn-drawer-section__title">
                Containers
              </Text>
            </div>
            <Table
              className="arn-containers-table"
              size="small"
              pagination={false}
              rowKey="containerNo"
              dataSource={arnData.containers}
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
                    title="No containers on this notice"
                    style={{ padding: 12 }}
                  />
                ),
              }}
            />
          </section>

          {lastFreeDay ? (
            <Alert
              type="info"
              showIcon
              className="arn-drawer-alert"
              icon={<AppIcon icon={Icons.info} size={16} />}
              message={
                <span>
                  Free time ends on <FormattedDate value={lastFreeDay} />.
                </span>
              }
            />
          ) : null}
        </>
      )}
    </AppDrawer>
  );
}
