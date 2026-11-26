// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { Table, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { BLChargesDTO } from "../types/bl.types";

const { Text, Title } = Typography;

interface BillOfLadingChargesProps {
  charges: BLChargesDTO | undefined;
  loading: boolean;
}

export function BillOfLadingCharges({
  charges,
  loading,
}: BillOfLadingChargesProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);

  if (loading) {
    return (
      <Text type="secondary">{t("status.loading", { ns: "common" })}</Text>
    );
  }

  if (!charges || charges.lines.length === 0) {
    return (
      <ModuleEmptyState
        artSize="sm"
        variant="blank"
        title={t("empty.noCharges")}
        style={{ padding: 12 }}
      />
    );
  }

  return (
    <div className="bl-charges-panel">
      <Title level={5}>
        {t("drawers.chargeSummary")} — {charges.blNo}
      </Title>
      <Table
        size="small"
        bordered
        pagination={false}
        loading={loading}
        rowKey="id"
        dataSource={charges.lines}
        scroll={{ y: 360, x: 800 }}
        columns={[
          {
            title: t("columns.code"),
            dataIndex: "chargeCode",
            width: 80,
          },
          { title: t("columns.description"), dataIndex: "description" },
          {
            title: t("columns.amount"),
            key: "amount",
            render: (_, row) => `${row.currency} ${row.amount.toFixed(2)}`,
          },
          {
            title: t("columns.pce"),
            dataIndex: "prepaidCollect",
            width: 90,
          },
          {
            title: t("columns.payor"),
            dataIndex: "payByCustType",
            width: 110,
          },
          {
            title: t("charges.prepaid"),
            key: "prepaid",
            width: 100,
            render: (_, row) =>
              row.prepaidAmount != null ? row.prepaidAmount.toFixed(2) : "-",
          },
          {
            title: t("charges.collect"),
            key: "collect",
            width: 100,
            render: (_, row) =>
              row.collectAmount != null ? row.collectAmount.toFixed(2) : "-",
          },
          {
            title: t("charges.payAt"),
            key: "payAt",
            width: 100,
            render: (_, row) =>
              row.payAtAmount != null ? row.payAtAmount.toFixed(2) : "-",
          },
        ]}
      />
      {charges.totals.map((total) => (
        <div key={total.currency} className="bl-charges-total-row">
          <Text>
            {t("charges.totalsLine", {
              currency: total.currency,
              prepaid: total.prepaid.toFixed(2),
              collect: total.collect.toFixed(2),
              payAt: total.payAt.toFixed(2),
              grand: total.grandTotal.toFixed(2),
            })}
          </Text>
        </div>
      ))}
    </div>
  );
}
