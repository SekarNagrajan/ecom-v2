// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Card, Descriptions, Table, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { VesselParticulars } from "../types/schedules.types";

const { Text, Title } = Typography;

interface VesselDetailsModalProps {
  vessel: VesselParticulars | null;
  open: boolean;
  onClose: () => void;
}

export function VesselDetailsModal({
  vessel,
  open,
  onClose,
}: VesselDetailsModalProps) {
  if (!vessel) return null;

  const portCallColumns = [
    {
      title: "Port Code & Name",
      dataIndex: "portCode",
      key: "portCode",
      render: (code: string, record: { portName: string }) => (
        <span>
          <Tag color="blue">{code}</Tag> <b>{record.portName}</b>
        </span>
      ),
    },
    { title: "Terminal", dataIndex: "terminal", key: "terminal" },
    { title: "ETA", dataIndex: "eta", key: "eta" },
    { title: "ETD", dataIndex: "etd", key: "etd" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "COMPLETED"
              ? "green"
              : status === "IN_PORT"
                ? "processing"
                : "default"
          }
        >
          {status}
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
          <AppIcon icon={Icons.compass} size={20} />
          <div>
            <Title level={4} className="schedule-drawer-title__text">
              {vessel.vesselName}
            </Title>
            <Text type="secondary" className="schedule-drawer-title__meta">
              IMO: {vessel.imoNumber} | Call Sign: {vessel.callSign}
            </Text>
          </div>
        </div>
      }
      footer={
        <div className="schedule-drawer-footer">
          <AppButton danger onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
          >
            Download Specs PDF
          </AppButton>
        </div>
      }
    >
      <Card title="Vessel Specifications" className="schedule-panel">
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Vessel Code">
            {vessel.vesselCode}
          </Descriptions.Item>
          <Descriptions.Item label="Flag">{vessel.flag}</Descriptions.Item>
          <Descriptions.Item label="Vessel Type">
            {vessel.vesselType}
          </Descriptions.Item>
          <Descriptions.Item label="Operator">
            {vessel.vesselOperator}
          </Descriptions.Item>
          <Descriptions.Item label="Owner">
            {vessel.vesselOwner}
          </Descriptions.Item>
          <Descriptions.Item label="Built Year">
            {vessel.builtYear}
          </Descriptions.Item>
          <Descriptions.Item label="Port of Registry">
            {vessel.portOfRegistry}
          </Descriptions.Item>
          <Descriptions.Item label="Length Overall">
            {vessel.lengthOverall}
          </Descriptions.Item>
          <Descriptions.Item label="TEU Nominal">
            {vessel.teuNominal}
          </Descriptions.Item>
          <Descriptions.Item label="Gross Tonnage">
            {vessel.grossTonnage}
          </Descriptions.Item>
          <Descriptions.Item label="Net Tonnage">
            {vessel.netTonnage}
          </Descriptions.Item>
          <Descriptions.Item label="IMO / Lloyd's">
            {vessel.imoNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {vessel.portCalls && vessel.portCalls.length > 0 ? (
        <Card title="Voyage Port Call Sequence" className="schedule-panel">
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
