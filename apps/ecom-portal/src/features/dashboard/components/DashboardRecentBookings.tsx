// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Table, Tag, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";

import { AppIcon, Icons } from "../../../components/icons";
import type { RecentBookingRow } from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

const STATUS_COLORS: Record<RecentBookingRow["status"], string> = {
  Confirmed: "blue",
  "SI Pending": "orange",
  "In Transit": "processing",
  Pending: "default",
  "B/L Issued": "success",
  Completed: "default",
};

interface DashboardRecentBookingsProps {
  bookings: RecentBookingRow[];
}

export function DashboardRecentBookings({
  bookings,
}: DashboardRecentBookingsProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const columns: ColumnsType<RecentBookingRow> = [
    {
      title: "Booking No.",
      dataIndex: "bookingNo",
      key: "bookingNo",
      width: 140,
      render: (value: string) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Vessel / Voyage",
      key: "vessel",
      width: 220,
      render: (_, row) => (
        <div>
          <Text strong style={{ display: "block", fontSize: 13 }}>
            {row.vessel}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Voy. {row.voyage}
          </Text>
        </div>
      ),
    },
    {
      title: "Route",
      key: "route",
      render: (_, row) => (
        <div>
          <Text style={{ fontSize: 13 }}>
            {row.polName} → {row.podName}
          </Text>
          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
            {row.pol} → {row.pod}
          </Text>
        </div>
      ),
    },
    {
      title: "ETD",
      dataIndex: "etd",
      key: "etd",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: RecentBookingRow["status"]) => (
        <Tag
          color={STATUS_COLORS[status]}
          style={{ margin: 0, borderRadius: 12 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: () => (
        <AppButton
          type="link"
          size="small"
          icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
          onClick={() => navigate({ to: "/app/booking" })}
        >
          View
        </AppButton>
      ),
    },
  ];

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: 12,
        border: `1px solid ${token.colorBorder}`,
        padding: "16px 20px",
      }}
    >
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Recent Bookings
        </Title>
        <AppButton
          type="link"
          style={{ color: token.colorPrimary }}
          size="small"
          onClick={() => navigate({ to: "/app/booking" })}
        >
          View all
        </AppButton>
      </Flex>
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        pagination={false}
        size="middle"
        scroll={{ x: 800 }}
      />
      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginTop: 12 }}
      >
        Showing {bookings.length} of 24 active bookings — last updated 21 Aug
        2026, 06:17 SGT
      </Text>
    </div>
  );
}
