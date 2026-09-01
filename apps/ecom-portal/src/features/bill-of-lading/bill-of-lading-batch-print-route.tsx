// Modified by Sekar Nagarajan (2026-08-31 15:25)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Card, Empty, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useBLBatchPrintMutation, useBLListQuery } from "./api/bl.queries";
import { BlModuleStyles } from "./components/bl-module-styles";
import type { BLListDTO } from "./types/bl.types";
import { BL_STATUS_LABELS } from "./types/bl.types";
import { getBLStatusColor } from "./utils/bl-status";

const { Text } = Typography;

function isBatchEligible(row: BLListDTO) {
  return row.status === "C" && row.printStatus === "Y" && !row.isLocked;
}

export function BillOfLadingBatchPrintRoute() {
  const navigate = useNavigate();
  const { data, isLoading } = useBLListQuery({});
  const rows = (data?.rows ?? []).filter(isBatchEligible);
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: batchPrint, isPending } = useBLBatchPrintMutation();

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <div className="bl-page-layout">
          <div className="bl-page-header">
            <ModuleScreenHeader
              icon={NavIcons.billOfLading}
              title="Batch Original Print"
              subtitle="Select confirmed B/Ls eligible for original print, then print in one batch."
              marginBottom={0}
              extra={
                <AppButton
                  danger
                  icon={
                    <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                  }
                  onClick={() => navigate({ to: "/app/bl" })}
                >
                  Back to B/L
                </AppButton>
              }
            />
          </div>

          <div className="bl-toolbar">
            <Space wrap>
              <Text type="secondary">{rows.length} eligible B/L(s)</Text>
              <Tag color="blue">{selected.length} selected</Tag>
            </Space>
            <Space wrap>
              <AppButton
                onClick={() => setSelected(rows.map((r) => r.blNo))}
                disabled={rows.length === 0}
              >
                Select All
              </AppButton>
              <AppButton
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
              >
                Clear
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
                loading={isPending}
                disabled={selected.length === 0}
                onClick={() => {
                  batchPrint(selected);
                  setSelected([]);
                }}
              >
                Print Selected ({selected.length})
              </AppButton>
            </Space>
          </div>

          <div className="bl-batch-page-body">
            {rows.length === 0 && !isLoading ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No confirmed B/Ls eligible for batch original print."
              />
            ) : (
              <Table<BLListDTO>
                rowKey="blNo"
                size="middle"
                loading={isLoading}
                pagination={false}
                dataSource={rows}
                scroll={{ y: "calc(100vh - 280px)" }}
                rowSelection={{
                  selectedRowKeys: selected,
                  onChange: (keys) => setSelected(keys as string[]),
                }}
                columns={[
                  {
                    title: "B/L No",
                    dataIndex: "blNo",
                    key: "blNo",
                    width: 140,
                  },
                  {
                    title: "Booking No",
                    dataIndex: "bookingNo",
                    key: "bookingNo",
                    width: 140,
                  },
                  {
                    title: "SI No",
                    dataIndex: "siNo",
                    key: "siNo",
                    width: 140,
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    width: 120,
                    render: (status: BLListDTO["status"]) => (
                      <Tag
                        className="bl-status-tag"
                        color={getBLStatusColor(status)}
                      >
                        {BL_STATUS_LABELS[status]}
                      </Tag>
                    ),
                  },
                  {
                    title: "Route",
                    key: "route",
                    render: (_, row) => (
                      <Text>
                        {row.origin} → {row.delivery}
                      </Text>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
