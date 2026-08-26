// Created by Sekar Nagarajan (2026-08-26 14:57)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  formatModuleScreenTitle,
  MODULE_TITLES,
} from "../../../../constants/module-titles";
import {
  useCRODetailQuery,
  useCRODownloadMutation,
} from "../../api/cro.queries";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
  isCroPrinted,
} from "../../utils/cro-status";
import { parsePortLabel } from "../../utils/cro.utils";
import { CroLoadingCenter } from "../cro-loading-center";

const { Text, Title } = Typography;

interface CroViewDrawerProps {
  croNo: string;
  onClose: () => void;
}

export function CroViewDrawer({ croNo, onClose }: CroViewDrawerProps) {
  const { data: croData, isLoading } = useCRODetailQuery(croNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useCRODownloadMutation();

  const originPort = parsePortLabel(croData?.loadPort || "");
  const deliveryPort = parsePortLabel(croData?.dischargePort || "");
  const printed = croData ? isCroPrinted(croData.printStatus) : false;
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;
  const eligibility = croData?.eligibility;
  const alertType = eligibility?.eligible ? "success" : "warning";

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{ body: "cro-drawer-body custom-scroll" }}
      title={
        <div className="cro-drawer-title">
          <AppIcon icon={Icons.container} size={22} />
          <div>
            <Title level={4} className="cro-drawer-title__text">
              {formatModuleScreenTitle(
                MODULE_TITLES.containerReleaseOrder,
                croNo,
              )}
            </Title>
            <Text type="secondary" className="cro-drawer-title__meta">
              Booking: <strong>{croData?.bookingNo || "—"}</strong>
            </Text>
            {croData ? (
              <div className="cro-drawer-title__tags">
                <Tag
                  className="cro-status-tag"
                  color={getCroReleaseStatusColor(croData.releaseStatus)}
                >
                  {croData.releaseStatus}
                </Tag>
                <Tag
                  className="cro-status-tag"
                  color={getCroPrintStatusColor(croData.printStatus)}
                >
                  {getCroPrintStatusLabel(croData.printStatus)}
                </Tag>
              </div>
            ) : null}
          </div>
        </div>
      }
      extra={
        <div className="cro-drawer-actions custom-scroll">
          <Tooltip title="Coming in P2">
            <AppButton type="default" disabled>
              Generate
            </AppButton>
          </Tooltip>
          <Tooltip title="Print Container Release Order">
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              loading={isDownloading}
              disabled={!croData}
              onClick={() => downloadDoc(croNo)}
            >
              Print
            </AppButton>
          </Tooltip>
        </div>
      }
    >
      {isLoading || !croData ? (
        <CroLoadingCenter />
      ) : (
        <>
          {eligibility ? (
            <Alert
              type={alertType}
              showIcon
              message={
                eligibility.eligible
                  ? "Eligible for empty container release"
                  : "Release blocked"
              }
              description={
                eligibility.reasons.length > 0 ? (
                  <ul className="cro-eligibility-reasons">
                    {eligibility.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null
              }
            />
          ) : null}

          <div className="cro-route-strip">
            <div className="cro-route-port cro-route-port--origin">
              <div className="cro-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} />
                Load Port
              </div>
              <Title
                level={4}
                className="cro-route-port__code cro-route-port__code--origin"
              >
                {originPort.code || "—"}
              </Title>
              {showOriginName ? (
                <Text className="cro-route-port__name">{originPort.name}</Text>
              ) : null}
            </div>

            <div className="cro-route-connector">
              <span className="cro-route-connector__label">Port to Port</span>
              <div className="cro-route-connector__line">
                <span className="cro-route-connector__dot cro-route-connector__dot--origin" />
                <span className="cro-route-connector__track" />
                <AppIcon icon={Icons.arrowRight} size={14} tone="navigate" />
                <span className="cro-route-connector__track" />
                <span className="cro-route-connector__dot cro-route-connector__dot--delivery" />
              </div>
              <AppIcon icon={Icons.ship} size={16} />
            </div>

            <div className="cro-route-port cro-route-port--delivery">
              <div className="cro-route-port__label">
                <AppIcon icon={Icons.truck} size={14} />
                Discharge
              </div>
              <Title
                level={4}
                className="cro-route-port__code cro-route-port__code--delivery"
              >
                {deliveryPort.code || "—"}
              </Title>
              {showDeliveryName ? (
                <Text className="cro-route-port__name">
                  {deliveryPort.name}
                </Text>
              ) : null}
            </div>
          </div>

          <div className="cro-meta-grid">
            <div className="cro-meta-item">
              <span className="form-field-label">Release No</span>
              <span className="cro-meta-item__value">{croData.croNo}</span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Booking No</span>
              <span className="cro-meta-item__value">
                {croData.bookingNo || "—"}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">CRO Date</span>
              <span className="cro-meta-item__value">
                {croData.croDate ? (
                  <FormattedDate value={croData.croDate} />
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">CRO Validity</span>
              <span className="cro-meta-item__value">
                {croData.validTo ? (
                  <FormattedDate value={croData.validTo} />
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Vessel</span>
              <span className="cro-meta-item__value">
                {croData.vessel || "—"}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Voyage</span>
              <span className="cro-meta-item__value">
                {croData.voyage || "—"}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Cont Type</span>
              <span className="cro-meta-item__value">
                {croData.eqpType || "—"}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Empty Release Depot</span>
              <span className="cro-meta-item__value">
                {croData.emptyReleaseDepot || "—"}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Qty Booked</span>
              <span className="cro-meta-item__value">{croData.qtyBooked}</span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Qty Released</span>
              <span className="cro-meta-item__value">
                {croData.qtyReleased}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Release Status</span>
              <span className="cro-meta-item__value">
                <Tag
                  className="cro-status-tag"
                  color={getCroReleaseStatusColor(croData.releaseStatus)}
                >
                  {croData.releaseStatus}
                </Tag>
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="form-field-label">Print Status</span>
              <span className="cro-meta-item__value">
                <Tag
                  className="cro-status-tag"
                  color={getCroPrintStatusColor(croData.printStatus)}
                >
                  {printed
                    ? getCroPrintStatusLabel("Y")
                    : getCroPrintStatusLabel("N")}
                </Tag>
              </span>
            </div>
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
            locale={{ emptyText: "No containers on this release" }}
          />
        </>
      )}
    </AppDrawer>
  );
}
