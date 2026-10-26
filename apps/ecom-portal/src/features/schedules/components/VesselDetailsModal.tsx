// Modified by Sekar Nagarajan (2026-10-26 16:05)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Table, Tag, Typography } from "antd";
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

type PortCall = NonNullable<VesselParticulars["portCalls"]>[number];

function portCallStatusLabel(
  status: PortCall["status"],
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

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="schedule-vessel-details__spec">
      <Text type="secondary" className="schedule-vessel-details__spec-label">
        {label}
      </Text>
      <Text strong className="schedule-vessel-details__spec-value">
        {value || "—"}
      </Text>
    </div>
  );
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
      width: 280,
      render: (code: string, record: PortCall) => (
        <span className="schedule-vessel-details__port-cell">
          <Tag color="blue">{code}</Tag>
          <Text strong ellipsis className="schedule-vessel-details__port-name">
            {record.portName}
          </Text>
        </span>
      ),
    },
    {
      title: t("vessel.columns.terminal"),
      dataIndex: "terminal",
      key: "terminal",
      ellipsis: true,
    },
    {
      title: t("calendar.eta"),
      dataIndex: "eta",
      key: "eta",
      width: 148,
    },
    {
      title: t("calendar.etd"),
      dataIndex: "etd",
      key: "etd",
      width: 148,
    },
    {
      title: t("vessel.columns.status"),
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: PortCall["status"]) => (
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
      dialogSize="lg"
      classNames={{
        header: "schedule-vessel-drawer__header-wrap",
        body: "schedule-drawer-body schedule-vessel-drawer__body custom-scroll",
        footer: "schedule-vessel-drawer__footer-wrap",
      }}
      title={
        <div className="schedule-drawer-title schedule-vessel-drawer__title">
          <span className="schedule-vessel-drawer__icon app-icon-inherit">
            <AppIcon icon={NavVesselIcon} size={22} />
          </span>
          <div className="schedule-vessel-drawer__title-copy">
            <Title level={5} className="schedule-drawer-title__text">
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
      <div className="schedule-vessel-details">
        <div className="schedule-vessel-details__chips" role="list">
          <span className="schedule-vessel-details__chip" role="listitem">
            <Text type="secondary">{t("vessel.fields.vesselCode")}</Text>
            <Text strong>{vessel.vesselCode || "—"}</Text>
          </span>
          <span className="schedule-vessel-details__chip" role="listitem">
            <Text type="secondary">{t("vessel.fields.flag")}</Text>
            <Text strong>{vessel.flag || "—"}</Text>
          </span>
          <span className="schedule-vessel-details__chip" role="listitem">
            <Text type="secondary">{t("vessel.fields.vesselType")}</Text>
            <Text strong>{vessel.vesselType || "—"}</Text>
          </span>
          <span className="schedule-vessel-details__chip" role="listitem">
            <Text type="secondary">{t("vessel.fields.teuNominal")}</Text>
            <Text strong>{vessel.teuNominal || "—"}</Text>
          </span>
          <span className="schedule-vessel-details__chip" role="listitem">
            <Text type="secondary">{t("vessel.fields.builtYear")}</Text>
            <Text strong>{vessel.builtYear || "—"}</Text>
          </span>
        </div>

        <section className="schedule-vessel-details__section">
          <Title level={5} className="schedule-vessel-details__section-title">
            {t("vessel.specifications")}
          </Title>
          <div className="schedule-vessel-details__spec-grid">
            <SpecRow
              label={t("vessel.fields.operator")}
              value={vessel.vesselOperator}
            />
            <SpecRow
              label={t("vessel.fields.owner")}
              value={vessel.vesselOwner}
            />
            <SpecRow
              label={t("vessel.fields.portOfRegistry")}
              value={vessel.portOfRegistry}
            />
            <SpecRow
              label={t("vessel.fields.lengthOverall")}
              value={vessel.lengthOverall}
            />
            <SpecRow
              label={t("vessel.fields.grossTonnage")}
              value={vessel.grossTonnage}
            />
            <SpecRow
              label={t("vessel.fields.netTonnage")}
              value={vessel.netTonnage}
            />
            <SpecRow
              label={t("vessel.fields.imoLloyds")}
              value={vessel.imoNumber}
            />
            <SpecRow
              label={t("vessel.fields.vesselCode")}
              value={vessel.vesselCode}
            />
          </div>
        </section>

        {vessel.portCalls && vessel.portCalls.length > 0 ? (
          <section className="schedule-vessel-details__section">
            <div className="schedule-vessel-details__section-head">
              <Title
                level={5}
                className="schedule-vessel-details__section-title"
              >
                {t("vessel.portCallSequence")}
              </Title>
              <Text type="secondary">
                {t("vessel.portCallCount", {
                  count: vessel.portCalls.length,
                })}
              </Text>
            </div>
            <div className="schedule-vessel-details__table-wrap custom-scroll">
              <Table
                className="schedule-vessel-details__table"
                dataSource={vessel.portCalls.map((item, idx) => ({
                  ...item,
                  key: `${item.portCode}-${idx}`,
                }))}
                columns={portCallColumns}
                pagination={{
                  pageSize: 10,
                }}
                
                size="small"
                scroll={{ x: 720 }}
              />
            </div>
          </section>
        ) : null}
      </div>
    </AppDrawer>
  );
}
