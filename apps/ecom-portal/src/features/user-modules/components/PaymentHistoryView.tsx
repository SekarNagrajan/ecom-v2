// Modified by Sekar Nagarajan (2026-08-26 16:20)
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { DatePicker, Space, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { usePaymentHistoryQuery } from "../api/user-modules.queries";
import type { PaymentHistoryRecord } from "../types/user-modules.types";
import { UmPanelHeader } from "./um-panel-header";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_META: Record<
  PaymentHistoryRecord["status"],
  { color: string; label: string }
> = {
  SUCCESSFUL: { color: "green", label: "Successful" },
  PENDING: { color: "gold", label: "Pending" },
  FAILED: { color: "red", label: "Failed" },
  REFUNDED: { color: "purple", label: "Refunded" },
};

const GATEWAY_META: Record<
  PaymentHistoryRecord["gateway"],
  { color: string; label: string }
> = {
  STRIPE: { color: "purple", label: "Stripe" },
  NGENIUS: { color: "cyan", label: "NGenius" },
  BANK_TRANSFER: { color: "blue", label: "Bank Transfer" },
};

function formatMoney(amount: number, currency: string) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })} ${currency}`;
}

export function PaymentHistoryView() {
  const toast = useToast();
  const { data: payments = [], isLoading, isFetching } = usePaymentHistoryQuery();

  const handleDownloadReceipt = (rec: PaymentHistoryRecord) => {
    toast.info(`Downloading PDF receipt for ${rec.paymentRefNo}...`);
  };

  const settledTotal = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + p.amount, 0);
  const successfulCount = payments.filter(
    (p) => p.status === "SUCCESSFUL",
  ).length;

  const columnDefs: DataViewColumn<PaymentHistoryRecord>[] = [
    buildActionsColumn<PaymentHistoryRecord>({
      field: "id",
      width: 90,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        if (rec.status !== "SUCCESSFUL") {
          return <Text type="secondary">—</Text>;
        }
        return (
          <ListActionsRow>
            <ListActionButton
              title="Download PDF Receipt"
              icon={
                <AppIcon icon={Icons.download} size={16} tone="download" />
              }
              onClick={(event) => {
                event.stopPropagation();
                handleDownloadReceipt(rec);
              }}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Payment Ref",
      field: "paymentRefNo",
      sortable: true,
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: { value?: string }) => (
        <Space size={6}>
          <AppIcon icon={Icons.creditCard} size={16} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: "Invoice / BL",
      field: "invoiceNo",
      sortable: true,
      flex: 1,
      minWidth: 150,
      valueGetter: (params: { data?: PaymentHistoryRecord }) =>
        params.data
          ? `${params.data.invoiceNo} · ${params.data.blNumber}`
          : "",
    },
    {
      headerName: "Gateway",
      field: "gateway",
      sortable: true,
      width: 130,
      cellRenderer: (params: { value?: PaymentHistoryRecord["gateway"] }) => {
        const gw = params.value;
        if (!gw) return null;
        const meta = GATEWAY_META[gw];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      width: 140,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        return (
          <span className="um-amount-success">
            {formatMoney(rec.amount, rec.currency)}
          </span>
        );
      },
    },
    {
      headerName: "Paid On",
      field: "paymentDate",
      sortable: true,
      width: 120,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      width: 120,
      cellRenderer: (params: { value?: PaymentHistoryRecord["status"] }) => {
        const st = params.value;
        if (!st) return null;
        const meta = STATUS_META[st];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  return (
    <div className="um-page-layout">
      <UmPanelHeader
        icon={Icons.creditCard}
        title={MODULE_TITLES.paymentHistory}
        description="Review online payments, invoice settlements, and download PDF receipts."
        extra={
          <RangePicker size="large" className="um-range-picker" allowClear />
        }
      />

      <div className="um-summary-strip" aria-label="Payment summary">
        <div className="um-summary-chip um-summary-chip--success">
          <span className="um-summary-chip__label">Settled</span>
          <span className="um-summary-chip__value">
            {formatMoney(settledTotal, "USD")}
          </span>
        </div>
        <div className="um-summary-chip um-summary-chip--primary">
          <span className="um-summary-chip__label">Successful</span>
          <span className="um-summary-chip__value">{successfulCount}</span>
        </div>
        <div className="um-summary-chip">
          <span className="um-summary-chip__label">Total</span>
          <span className="um-summary-chip__value">{payments.length}</span>
        </div>
      </div>

      <div className="um-grid-wrap um-payments-grid responsive-table-wrap custom-scroll">
        <DataView
          className="um-data-view"
          columnDefs={columnDefs}
          rowData={payments}
          loading={isLoading || isFetching}
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          listOptions={{
            showToolbar: false,
            gridOptions: {
              domLayout: "autoHeight",
              overlayNoRowsTemplate: "No payment records found for this period.",
              suppressCellFocus: true,
            },
          }}
        />
      </div>
    </div>
  );
}
