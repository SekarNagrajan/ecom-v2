// Modified by Sekar Nagarajan (2026-08-25 19:15)
import { AppDrawer } from "@solverminds/shared-ui";
import type { TableProps } from "antd";
import { Card, Descriptions, Table, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContainerEquipment,
  ContainerMovementEvent,
} from "../types/tracking.types";

const { Title, Text } = Typography;

interface TrackingMovementDrawerProps {
  container: ContainerEquipment | null;
  open: boolean;
  onClose: () => void;
}

export function TrackingMovementDrawer({
  container,
  open,
  onClose,
}: TrackingMovementDrawerProps) {
  if (!container) return null;

  const columns: TableProps<ContainerMovementEvent>["columns"] = [
    {
      title: "Event Code & Name",
      dataIndex: "eventName",
      key: "eventName",
      render: (
        val: string,
        record: { eventCode: string; transportMode: string },
      ) => (
        <div>
          <Text className="tracking-event-name">{val}</Text>
          <Tag color="blue">{record.eventCode}</Tag>
        </div>
      ),
    },
    {
      title: "Location & Facility",
      dataIndex: "locationName",
      key: "locationName",
      render: (val: string, record: { facility: string }) => (
        <div>
          <Text className="tracking-event-loc">{val}</Text>
          <Text type="secondary" className="tracking-event-facility">
            {record.facility}
          </Text>
        </div>
      ),
    },
    {
      title: "Vessel / Voyage",
      dataIndex: "vesselName",
      key: "vesselName",
      render: (val: string, record: { voyage?: string }) =>
        val ? (
          <div>
            <Text className="tracking-event-loc">{val}</Text>
            <Tag color="purple">Voy: {record.voyage || "-"}</Tag>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Timestamp",
      dataIndex: "eventDate",
      key: "eventDate",
      render: (val: string) => <Tag color="green">{val}</Tag>,
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      classNames={{ body: "tracking-drawer-body custom-scroll" }}
      title={
        <div className="tracking-drawer-title">
          <AppIcon icon={Icons.history} size={20} tone="history" />
          <div>
            <Title level={4} className="tracking-drawer-title__text">
              Container Movement History & Events
            </Title>
            <Text type="secondary" className="tracking-drawer-title__meta">
              Container No: <strong>{container.containerNo}</strong> | Seal:{" "}
              {container.sealNo}
            </Text>
          </div>
        </div>
      }
    >
      <Card type="inner" className="tracking-drawer-panel">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Container No">
            <strong>{container.containerNo}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Size / Type">
            {container.containerType}
          </Descriptions.Item>
          <Descriptions.Item label="Seal No">{container.sealNo}</Descriptions.Item>
          <Descriptions.Item label="Tare Weight">
            {container.tareWeightKg} KG
          </Descriptions.Item>
          <Descriptions.Item label="Payload Weight">
            {container.payloadKg} KG
          </Descriptions.Item>
          <Descriptions.Item label="Current Status">
            <Tag color="cyan">{container.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={5} className="tracking-drawer-section-title">
        Chronological Event Log
      </Title>
      <div className="responsive-table-wrap custom-scroll">
        <Table
          columns={columns}
          dataSource={container.movements}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
    </AppDrawer>
  );
}
