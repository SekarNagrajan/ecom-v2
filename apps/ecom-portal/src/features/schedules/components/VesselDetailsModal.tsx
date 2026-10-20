// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Card, Descriptions, Table, Tag, Typography } from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { NavVesselIcon } from "../../../components/icons/nav-svg-icons";
import type { VesselParticulars } from "../types/schedules.types";

const { Text, Title } = Typography;

interface VesselDetailsModalProps {
  vessel: VesselParticulars | null;
  open: boolean;
  onClose: () => void;
}

function portCallStatusLabel(
  status: NonNullable<VesselParticulars["portCalls"]>[number]["status"],
  t: TFunction<"schedules">,
): string {
  switch (status) {
    case "COMPLETED":
      return t("vessel.status.COMPLETED");
    case "IN_PORT":
      return t("vessel.status.IN_PORT");
    case "EXPECTED":
      return t("vessel.status.EXPECTED");
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function VesselDetailsModal({
  vessel,
  open,
  onClose,
}: VesselDetailsModalProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  if (!vessel) return null;

  const portCallColumns = [
    {
      title: t("vessel.columns.portCodeName"),
      dataIndex: "portCode",
      key: "portCode",
      render: (code: string, record: { portName: string }) => (
        <span>
          <Tag color="blue">{code}</Tag> <b>{record.portName}</b>
        </span>
      ),
    },
    {
      title: t("vessel.columns.terminal"),
      dataIndex: "terminal",
      key: "terminal",
    },
    { title: t("calendar.eta"), dataIndex: "eta", key: "eta" },
    { title: t("calendar.etd"), dataIndex: "etd", key: "etd" },
    {
      title: t("vessel.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (
        status: NonNullable<VesselParticulars["portCalls"]>[number]["status"],
      ) => (
        <Tag
          color={
            status === "COMPLETED"
              ? "green"
              : status === "IN_PORT"
                ? "processing"
                : "default"
          }
        >
          {portCallStatusLabel(status, t)}
        </Tag>
      ),
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      title={
        <div className="schedule-drawer-title">
          <AppIcon icon={NavVesselIcon} size={20} />
          <div>
            <Title level={4} className="schedule-drawer-title__text">
              {vessel.vesselName}
            </Title>
            <Text type="secondary" className="schedule-drawer-title__meta">
              {t("vessel.imoCallSign", {
                imo: vessel.imoNumber,
                callSign: vessel.callSign,
              })}
            </Text>
          </div>
        </div>
      }
      footer={
        <div className="schedule-drawer-footer">
          <AppButton danger onClick={onClose}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
          >
            {t("actions.downloadSpecsPdf")}
          </AppButton>
        </div>
      }
    >
      <Card title={t("vessel.specifications")} className="schedule-panel">
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label={t("vessel.fields.vesselCode")}>
            {vessel.vesselCode}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.flag")}>
            {vessel.flag}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.vesselType")}>
            {vessel.vesselType}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.operator")}>
            {vessel.vesselOperator}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.owner")}>
            {vessel.vesselOwner}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.builtYear")}>
            {vessel.builtYear}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.portOfRegistry")}>
            {vessel.portOfRegistry}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.lengthOverall")}>
            {vessel.lengthOverall}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.teuNominal")}>
            {vessel.teuNominal}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.grossTonnage")}>
            {vessel.grossTonnage}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.netTonnage")}>
            {vessel.netTonnage}
          </Descriptions.Item>
          <Descriptions.Item label={t("vessel.fields.imoLloyds")}>
            {vessel.imoNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {vessel.portCalls && vessel.portCalls.length > 0 ? (
        <Card title={t("vessel.portCallSequence")} className="schedule-panel">
          <div className="responsive-table-wrap custom-scroll">
            <Table
              dataSource={vessel.portCalls.map((item, idx) => ({
                ...item,
                key: idx,
              }))}
              columns={portCallColumns}
              pagination={false}
              size="small"
            />
          </div>
        </Card>
      ) : null}
    </AppDrawer>
  );
}
