// Modified by Sekar Nagarajan (2026-09-07 12:22)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Tag, Typography } from "antd";
import type { ReactNode } from "react";

import {
  AppIcon,
  Icons,
  NavContainerReleaseIcon,
} from "../../../../components/icons";
import { useDODownloadMutation } from "../../api/delivery-order.queries";
import type { DOSummaryRow } from "../../types/delivery-order.types";
import {
  getDoPrintStatusColor,
  getDoPrintStatusLabel,
} from "../../utils/do-status";
import { parsePortLabel } from "../../utils/do.utils";

const { Text, Title } = Typography;

interface DoViewDrawerProps {
  record: DOSummaryRow;
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
    <div className="do-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="do-meta-item__value">{children}</span>
    </div>
  );
}

export function DoViewDrawer({ record, onClose }: DoViewDrawerProps) {
  const { mutate: downloadDoc, isPending: isDownloading } =
    useDODownloadMutation();

  const originPort = parsePortLabel(record.loadport || "");
  const deliveryPort = parsePortLabel(record.dischargeport || "");
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;
  const statusLabel = getDoPrintStatusLabel(record.printstatus);
  const statusColor = getDoPrintStatusColor(record.printstatus);

  const handleDownload = () => {
    downloadDoc(record.delordno);
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "do-drawer-body custom-scroll",
        footer: "do-drawer-footer",
      }}
      title={
        <div className="do-drawer-title">
          <span className="do-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavContainerReleaseIcon} size={22} />
          </span>
          <div className="do-drawer-title__copy">
            <Text className="do-drawer-title__eyebrow">Delivery Order</Text>
            <Title
              level={5}
              className="do-drawer-title__text"
              copyable={{
                text: record.delordno,
                tooltips: ["Copy DO number", "Copied"],
              }}
            >
              {record.delordno}
            </Title>
            <div className="do-drawer-title__meta-row">
              <Text type="secondary" className="do-drawer-title__meta">
                B/L:{" "}
                <span className="do-drawer-title__bl">
                  {record.blnumber || "—"}
                </span>
              </Text>
              <Tag className="do-status-tag" color={statusColor}>
                {statusLabel}
              </Tag>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="do-drawer-actions custom-scroll">
          <AppButton
            type="default"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
            loading={isDownloading}
            onClick={handleDownload}
          >
            Download PDF
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            onClick={handleDownload}
          >
            Print Delivery Order
          </AppButton>
        </div>
      }
    >
      <div className="do-route-strip">
        <Text className="do-route-strip__eyebrow">Port to Port</Text>
        <div className="do-route-strip__body">
          <div className="do-route-port do-route-port--origin">
            <div className="do-route-port__label">
              <span className="do-route-port__pin do-route-port__pin--origin app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={15} />
              </span>
              Origin
            </div>
            <Title
              level={3}
              className="do-route-port__code do-route-port__code--origin"
            >
              {originPort.code || "—"}
            </Title>
            <Text className="do-route-port__name">
              {showOriginName ? originPort.name : originPort.code || "—"}
            </Text>
          </div>

          <div className="do-route-connector" aria-hidden>
            <div className="do-route-connector__line">
              <span className="do-route-connector__dot do-route-connector__dot--origin" />
              <span className="do-route-connector__track do-route-connector__track--origin" />
              <span className="do-route-connector__ship app-icon-inherit">
                <AppIcon icon={Icons.ship} size={16} />
              </span>
              <span className="do-route-connector__track do-route-connector__track--delivery" />

              <span className="do-route-connector__dot do-route-connector__dot--delivery" />
            </div>
            <span className="do-route-connector__label">Port to Port</span>
          </div>

          <div className="do-route-port do-route-port--delivery">
            <div className="do-route-port__label">
              <span className="do-route-port__pin do-route-port__pin--delivery app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={15} />
              </span>
              Delivery
            </div>
            <Title
              level={3}
              className="do-route-port__code do-route-port__code--delivery"
            >
              {deliveryPort.code || "—"}
            </Title>
            <Text className="do-route-port__name">
              {showDeliveryName ? deliveryPort.name : deliveryPort.code || "—"}
            </Text>
          </div>
        </div>
      </div>

      <section className="do-drawer-section">
        <div className="do-drawer-section__head">
          <AppIcon icon={Icons.fileText} size={16} />
          <Text strong className="do-drawer-section__title">
            Delivery Order Details
          </Text>
        </div>
        <div className="do-meta-grid">
          <MetaField label="DO Number">{record.delordno}</MetaField>
          <MetaField label="DO Date">
            {record.delorddate ? (
              <FormattedDate value={record.delorddate} />
            ) : (
              "—"
            )}
          </MetaField>
          <MetaField label="Valid Until">
            {record.dovaliditydate ? (
              <FormattedDate value={record.dovaliditydate} />
            ) : (
              "—"
            )}
          </MetaField>
          <MetaField label="Print Status">
            <Tag className="do-status-tag" color={statusColor}>
              {statusLabel}
            </Tag>
          </MetaField>
        </div>
      </section>

      <section className="do-drawer-section">
        <div className="do-drawer-section__head">
          <AppIcon icon={Icons.ship} size={16} />
          <Text strong className="do-drawer-section__title">
            Shipment Details
          </Text>
        </div>
        <div className="do-meta-grid">
          <MetaField label="B/L Number">{record.blnumber || "—"}</MetaField>
          <MetaField label="Terminal">{record.terminal || "—"}</MetaField>
          <MetaField label="Vessel">{record.vessel || "—"}</MetaField>
          <MetaField label="Voyage">{record.voyage || "—"}</MetaField>
          <MetaField label="Bound">{record.bound || "—"}</MetaField>
          <MetaField label="Arrival Date">
            {record.arrdate ? <FormattedDate value={record.arrdate} /> : "—"}
          </MetaField>
        </div>
      </section>

      {record.dovaliditydate ? (
        <Alert
          type="info"
          showIcon
          className="do-drawer-alert"
          icon={<AppIcon icon={Icons.info} size={16} />}
          message={
            <span>
              This delivery order is valid until{" "}
              <FormattedDate value={record.dovaliditydate} />.
            </span>
          }
        />
      ) : null}
    </AppDrawer>
  );
}
