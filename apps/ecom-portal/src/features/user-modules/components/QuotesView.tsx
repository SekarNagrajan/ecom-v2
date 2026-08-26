// Modified by Sekar Nagarajan (2026-08-26 16:15)
import { AppButton } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useNavigate } from "@tanstack/react-router";
import { Space, Tag } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { useQuotesQuery } from "../api/user-modules.queries";
import type { QuoteItem } from "../types/user-modules.types";
import { QuotesCreateDrawer } from "./quotes-create-drawer";
import { QuotesViewDrawer } from "./quotes-view-drawer";
import { UmPanelHeader } from "./um-panel-header";

const STATUS_META: Record<
  QuoteItem["status"],
  { color: string; label: string }
> = {
  QUOTED: { color: "blue", label: "Quoted" },
  ACCEPTED: { color: "green", label: "Accepted" },
  PENDING_REVIEW: { color: "gold", label: "Pending Review" },
  EXPIRED: { color: "red", label: "Expired" },
};

function formatUsd(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })} USD`;
}

export function QuotesView() {
  const navigate = useNavigate();
  const { data: quotes = [], isLoading, isFetching } = useQuotesQuery();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);

  const activeCount = quotes.filter((q) => q.status === "QUOTED").length;
  const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;

  const columnDefs: DataViewColumn<QuoteItem>[] = [
    buildActionsColumn<QuoteItem>({
      field: "id",
      width: 100,
      cellRenderer: (params: { data?: QuoteItem }) => {
        const rec = params.data;
        if (!rec) return null;
        return (
          <ListActionsRow>
            <ListActionButton
              title="View Quote Details"
              icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedQuote(rec);
              }}
            />
            {rec.status === "QUOTED" ? (
              <ListActionButton
                title="Book This Quote"
                icon={
                  <AppIcon icon={Icons.notebook} size={16} tone="navigate" />
                }
                onClick={(event) => {
                  event.stopPropagation();
                  navigate({ to: "/app/booking/new" });
                }}
              />
            ) : null}
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Quote No",
      field: "quoteNo",
      sortable: true,
      flex: 1,
      minWidth: 140,
      cellRenderer: (params: { value?: string }) => (
        <Space size={6}>
          <AppIcon icon={Icons.fileText} size={16} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: "Route",
      field: "polCode",
      sortable: false,
      flex: 1,
      minWidth: 130,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.polCode} → ${params.data.podCode}` : "",
    },
    {
      headerName: "Equipment",
      field: "equipmentType",
      sortable: true,
      flex: 1.2,
      minWidth: 160,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data
          ? `${params.data.equipmentType} · ${params.data.commodity}`
          : "",
    },
    {
      headerName: "Amount",
      field: "totalAmountUSD",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? (
          "—"
        ) : (
          <span className="um-amount-primary">{formatUsd(params.value)}</span>
        ),
    },
    {
      headerName: "Valid Until",
      field: "validTo",
      sortable: true,
      width: 120,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      width: 130,
      cellRenderer: (params: { value?: QuoteItem["status"] }) => {
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
        icon={Icons.fileText}
        title={MODULE_TITLES.quotes}
        description="Request a rate, review quotes, and book when an offer is ready."
        extra={
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Request Quote
          </AppButton>
        }
      />

      <div className="um-grid-wrap um-quotes-grid responsive-table-wrap custom-scroll">
        <DataView
          className="um-data-view"
          columnDefs={columnDefs}
          rowData={quotes}
          loading={isLoading || isFetching}
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          listOptions={{
            showToolbar: false,
            gridOptions: {
              domLayout: "autoHeight",
              overlayNoRowsTemplate:
                "No quotes yet. Request a rate to get started.",
              suppressCellFocus: true,
            },
          }}
        />
      </div>

      <QuotesCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <QuotesViewDrawer
        quote={selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />
    </div>
  );
}
