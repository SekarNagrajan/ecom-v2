// Created by Sekar Nagarajan (2026-08-26 14:26)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import { useDODownloadMutation } from "../../api/delivery-order.queries";
import type { DOSummaryRow } from "../../types/delivery-order.types";
import {
  getDoPrintStatusColor,
  getDoPrintStatusLabel,
  isDoPrinted,
} from "../../utils/do-status";
import { parsePortLabel } from "../../utils/do.utils";

const { Text, Title } = Typography;

interface DoViewDrawerProps {
  record: DOSummaryRow;
  onClose: () => void;
}

export function DoViewDrawer({ record, onClose }: DoViewDrawerProps) {
  const { mutate: downloadDoc, isPending: isDownloading } =
    useDODownloadMutation();

  const originPort = parsePortLabel(record.loadport || "");
  const deliveryPort = parsePortLabel(record.dischargeport || "");
  const printed = isDoPrinted(record.printstatus);
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="sm"
      classNames={{ body: "do-drawer-body custom-scroll" }}
      title={
        <div className="do-drawer-title">
          <AppIcon icon={Icons.packageCheck} size={22} />
          <div>
            <Title level={4} className="do-drawer-title__text">
              {formatModuleScreenTitle("Delivery Order", record.delordno)}
            </Title>
            <Text type="secondary" className="do-drawer-title__meta">
              B/L: <strong>{record.blnumber || "—"}</strong>
            </Text>
            <div className="do-drawer-title__tags">
              <Tag
                className="do-status-tag"
                color={getDoPrintStatusColor(record.printstatus)}
              >
                {getDoPrintStatusLabel(record.printstatus)}
              </Tag>
            </div>
          </div>
        </div>
      }
      extra={
        <div className="do-drawer-actions custom-scroll">
          <Tooltip title="Print Delivery Order">
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              loading={isDownloading}
              onClick={() => downloadDoc(record.delordno)}
            >
              Print
            </AppButton>
          </Tooltip>
        </div>
      }
    >
      <div className="do-route-strip">
        <div className="do-route-port do-route-port--origin">
          <div className="do-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Origin
          </div>
          <Title
            level={4}
            className="do-route-port__code do-route-port__code--origin"
          >
            {originPort.code || "—"}
          </Title>
          {showOriginName ? (
            <Text className="do-route-port__name">{originPort.name}</Text>
          ) : null}
        </div>

        <div className="do-route-connector">
          <span className="do-route-connector__label">Port to Port</span>
          <div className="do-route-connector__line">
            <span className="do-route-connector__dot do-route-connector__dot--origin" />
            <span className="do-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="do-route-connector__track" />
            <span className="do-route-connector__dot do-route-connector__dot--delivery" />
          </div>
          <AppIcon icon={Icons.truck} size={16} />
        </div>

        <div className="do-route-port do-route-port--delivery">
          <div className="do-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Delivery
          </div>
          <Title
            level={4}
            className="do-route-port__code do-route-port__code--delivery"
          >
            {deliveryPort.code || "—"}
          </Title>
          {showDeliveryName ? (
            <Text className="do-route-port__name">{deliveryPort.name}</Text>
          ) : null}
        </div>
      </div>

      <div className="do-meta-grid">
        <div className="do-meta-item">
          <span className="do-meta-item__label">DO No</span>
          <span className="do-meta-item__value">{record.delordno}</span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">DO Date</span>
          <span className="do-meta-item__value">
            {record.delorddate ? (
              <FormattedDate value={record.delorddate} />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">B/L Number</span>
          <span className="do-meta-item__value">
            {record.blnumber || "—"}
          </span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Terminal</span>
          <span className="do-meta-item__value">
            {record.terminal || "—"}
          </span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Vessel</span>
          <span className="do-meta-item__value">{record.vessel || "—"}</span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Voyage</span>
          <span className="do-meta-item__value">{record.voyage || "—"}</span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Bound</span>
          <span className="do-meta-item__value">{record.bound || "—"}</span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Arrival Date</span>
          <span className="do-meta-item__value">
            {record.arrdate ? <FormattedDate value={record.arrdate} /> : "—"}
          </span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Valid Till</span>
          <span className="do-meta-item__value">
            {record.dovaliditydate ? (
              <FormattedDate value={record.dovaliditydate} />
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="do-meta-item">
          <span className="do-meta-item__label">Print Status</span>
          <span className="do-meta-item__value">
            <Tag
              className="do-status-tag"
              color={getDoPrintStatusColor(record.printstatus)}
            >
              {getDoPrintStatusLabel(record.printstatus)}
            </Tag>
          </span>
        </div>
      </div>
    </AppDrawer>
  );
}
