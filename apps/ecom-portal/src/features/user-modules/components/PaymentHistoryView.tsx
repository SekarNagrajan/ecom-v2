// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, DatePicker, Row, Space, Statistic, Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { usePaymentHistoryQuery } from "../api/user-modules.queries";
import type { PaymentHistoryRecord } from "../types/user-modules.types";
import { UmLoadingCenter } from "./um-loading-center";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export function PaymentHistoryView() {
  const toast = useToast();
  const { data: payments = [], isLoading } = usePaymentHistoryQuery();

  const handleDownloadReceipt = (rec: PaymentHistoryRecord) => {
    toast.info(
      `Downloading PDF payment receipt for ${rec.paymentRefNo}...`,
    );
  };

  const columnDefs: DataViewColumn<PaymentHistoryRecord>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 140,
      pinned: "left",
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        return rec.status === "SUCCESSFUL" ? (
          <Tooltip title="Download PDF Receipt">
            <AppButton
              type="primary"
              size="small"
              icon={
                <AppIcon
                  icon={Icons.download}
                  size={16}
                  gridAction
                  tone="download"
                />
              }
              onClick={() => handleDownloadReceipt(rec)}
            >
              PDF Receipt
            </AppButton>
          </Tooltip>
        ) : (
          <Text type="secondary">Pending</Text>
        );
      },
    },
    {
      headerName: "Payment Reference",
      field: "paymentRefNo",
      sortable: true,
      cellRenderer: (params: { value?: string }) => (
        <Space>
          <AppIcon icon={Icons.creditCard} size={16} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: "Invoice No / BL No",
      field: "invoiceNo",
      sortable: true,
      valueGetter: (params: { data?: PaymentHistoryRecord }) =>
        params.data
          ? `${params.data.invoiceNo} (${params.data.blNumber})`
          : "",
    },
    {
      headerName: "Payment Gateway",
      field: "gateway",
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const gw = params.value || "";
        const colorMap: Record<string, string> = {
          STRIPE: "purple",
          NGENIUS: "cyan",
          BANK_TRANSFER: "blue",
        };
        return <Tag color={colorMap[gw] || "default"}>{gw}</Tag>;
      },
    },
    {
      headerName: "Amount Paid",
      field: "amount",
      sortable: true,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => (
        <span className="um-amount-success">
          $
          {params.data?.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}{" "}
          {params.data?.currency}
        </span>
      ),
    },
    {
      headerName: "Payment Date",
      field: "paymentDate",
      sortable: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const st = params.value || "";
        const color =
          st === "SUCCESSFUL" ? "green" : st === "PENDING" ? "gold" : "red";
        return <Tag color={color}>{st}</Tag>;
      },
    },
  ];

  const totalPaidUsd = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = payments.filter(
    (p) => p.status === "SUCCESSFUL",
  ).length;

  return (
    <div className="um-page-layout">
      <ModuleScreenHeader
        icon={Icons.creditCard}
        title={MODULE_TITLES.paymentHistory}
        subtitle="Review Stripe / NGenius online payment history, invoice settlements, and PDF receipts"
        extra={<RangePicker size="large" className="um-range-picker" />}
      />

      <Row className="um-kpi-row" gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card um-kpi-card--success" type="inner">
            <Statistic
              title="Total Settled Payments"
              value={totalPaidUsd}
              precision={2}
              prefix={<AppIcon icon={Icons.dollarSign} size={16} />}
            />
          </Card>
        </Col>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card um-kpi-card--primary" type="inner">
            <Statistic
              title="Successful Transactions"
              value={successfulCount}
              prefix={<AppIcon icon={Icons.checkCircle} size={16} />}
            />
          </Card>
        </Col>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card" type="inner">
            <Statistic
              title="Total Transaction Records"
              value={payments.length}
            />
          </Card>
        </Col>
      </Row>

      {isLoading ? (
        <UmLoadingCenter />
      ) : (
        <div className="um-grid-wrap responsive-table-wrap">
          <DataView
            className="um-data-view"
            columnDefs={columnDefs}
            rowData={payments}
            loading={false}
            allowedViewModes={["list"]}
            listOptions={{
              gridOptions: {
                domLayout: "autoHeight",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
