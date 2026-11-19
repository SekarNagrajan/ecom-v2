// Modified by Sekar Nagarajan (2026-08-31 15:25)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Card, Space, Table, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavIcons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useBLBatchPrintMutation, useBLListQuery } from "./api/bl.queries";
import { BlModuleStyles } from "./components/bl-module-styles";
import type { BLListDTO } from "./types/bl.types";
import { getBLStatusColor, getBLStatusLabel } from "./utils/bl-status";

const { Text } = Typography;

function isBatchEligible(row: BLListDTO) {
  return row.status === "C" && row.printStatus === "Y" && !row.isLocked;
}

export function BillOfLadingBatchPrintRoute() {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const navigate = useNavigate();
  const { data, isLoading } = useBLListQuery({});
  const rows = (data?.rows ?? []).filter(isBatchEligible);
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: batchPrint, isPending } = useBLBatchPrintMutation();

  const columns = useMemo(
    () => [
      {
        title: t("columns.blNo"),
        dataIndex: "blNo",
        key: "blNo",
        width: 140,
      },
      {
        title: t("columns.bookingNo"),
        dataIndex: "bookingNo",
        key: "bookingNo",
        width: 140,
      },
      {
        title: t("columns.siNo"),
        dataIndex: "siNo",
        key: "siNo",
        width: 140,
      },
      {
        title: t("columns.status"),
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: BLListDTO["status"]) => (
          <Tag className="bl-status-tag" color={getBLStatusColor(status)}>
            {getBLStatusLabel(status, t)}
          </Tag>
        ),
      },
      {
        title: t("columns.route"),
        key: "route",
        render: (_: unknown, row: BLListDTO) => (
          <Text>
            {row.origin} → {row.delivery}
          </Text>
        ),
      },
    ],
    [t],
  );

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <div className="bl-page-layout">
          <div className="bl-page-header">
            <ModuleScreenHeader
              icon={NavIcons.billOfLading}
              title={t("batchPrint.title")}
              subtitle={t("batchPrint.subtitle")}
              marginBottom={0}
              extra={
                <AppButton
                  danger
                  icon={
                    <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                  }
                  onClick={() => navigate({ to: "/app/bl" })}
                >
                  {t("actions.back")}
                </AppButton>
              }
            />
          </div>

          <div className="bl-toolbar">
            <Space wrap>
              <Text type="secondary">
                {t("batchPrint.eligibleCount", { count: rows.length })}
              </Text>
              <Tag color="blue">
                {t("actions.printSelected", { count: selected.length })}
              </Tag>
            </Space>
            <Space wrap>
              <AppButton
                onClick={() => setSelected(rows.map((r) => r.blNo))}
                disabled={rows.length === 0}
              >
                {t("actions.selectAll")}
              </AppButton>
              <AppButton
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
              >
                {t("common:actions.clear")}
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
                {t("actions.printSelected", { count: selected.length })}
              </AppButton>
            </Space>
          </div>

          <div className="bl-batch-page-body">
            {rows.length === 0 && !isLoading ? (
              <ModuleEmptyState
                variant="blank"
                title={t("empty.batchPrintTitle")}
                message={t("empty.batchPrintMessage")}
                artSize="md"
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
                columns={columns}
              />
            )}
          </div>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
