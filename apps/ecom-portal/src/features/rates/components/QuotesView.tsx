// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Card, Flex, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useQuotesQuery } from "../api/rates.queries";
import type { QuoteDTO } from "../types/rates.types";
import { QuoteRequestDrawer } from "./QuoteRequestDrawer";

const { Text } = Typography;

export function QuotesView() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: quotes = [], isLoading } = useQuotesQuery();

  const handleConvertBooking = (quote: QuoteDTO) => {
    toast.info(`Converting Quote ${quote.quoteNo} into e-Booking...`);
    navigate({ to: "/schedules" as never });
  };

  const columnDefs: DataViewColumn<QuoteDTO>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 120,
      pinned: "left",
      cellRenderer: (params: { data?: QuoteDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Space size={4}>
            <Tooltip title="Convert Quote into e-Booking">
              <AppButton
                type="text"
                size="small"
                disabled={
                  record.status === "EXPIRED" ||
                  record.status === "PENDING_REVIEW"
                }
                icon={
                  <AppIcon
                    icon={Icons.arrowRight}
                    size={16}
                    gridAction
                    tone="navigate"
                  />
                }
                onClick={() => handleConvertBooking(record)}
              />
            </Tooltip>
            <Tooltip title="View Quotation Terms & Conditions">
              <AppButton
                type="text"
                size="small"
                icon={
                  <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
                }
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      headerName: "Quote Ref No",
      field: "quoteNo",
      minWidth: 160,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <div className="rates-cell-stack">
          <Text className="rates-cell-title rates-cell-title--primary">
            {params.data?.quoteNo}
          </Text>
          <Text className="rates-cell-sub">{params.data?.createdAt}</Text>
        </div>
      ),
    },
    {
      headerName: "Customer Name",
      field: "customerName",
      minWidth: 180,
    },
    {
      headerName: "Shipment Route",
      field: "originPort",
      minWidth: 200,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Text className="rates-cell-body">
          {params.data?.originPort} → {params.data?.deliveryPort}
        </Text>
      ),
    },
    {
      headerName: "Equipment & Qty",
      field: "eqpType",
      minWidth: 180,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Space size={6}>
          <Tag color="blue">{params.data?.eqpType}</Tag>
          <Text strong>x{params.data?.eqpQuantity}</Text>
        </Space>
      ),
    },
    {
      headerName: "Quoted Rate (USD)",
      field: "quotedAmountUsd",
      minWidth: 160,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Text
          strong
          className={[
            "rates-amount",
            params.data?.quotedAmountUsd
              ? "text-amount-success"
              : "text-amount-warning",
          ].join(" ")}
        >
          {params.data?.quotedAmountUsd
            ? `$${params.data.quotedAmountUsd.toFixed(2)} USD`
            : "Pending Pricing"}
        </Text>
      ),
    },
    {
      headerName: "Status",
      field: "status",
      width: 140,
      cellRenderer: (params: { data?: QuoteDTO }) => {
        const status = params.data?.status;
        let color = "default";
        if (status === "QUOTED") color = "blue";
        if (status === "ACCEPTED") color = "green";
        if (status === "PENDING_REVIEW") color = "orange";
        if (status === "EXPIRED") color = "red";
        return <Tag color={color}>{status?.replace("_", " ")}</Tag>;
      },
    },
    {
      headerName: "Validity Window",
      field: "validFrom",
      minWidth: 180,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Text className="rates-cell-sub">
          {params.data?.validFrom} to {params.data?.validTo}
        </Text>
      ),
    },
  ];

  return (
    <div className="rates-stack">
      <Card className="rates-filter-card">
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <div className="rates-toolbar-copy">
            <Text className="rates-toolbar-copy__title">
              Spot Rate Inquiries & Quotes
            </Text>
            <Text type="secondary" className="rates-toolbar-copy__sub">
              Submit spot rate inquiries and convert approved quotes into
              e-Bookings.
            </Text>
          </div>

          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={() => setIsDrawerOpen(true)}
          >
            Request Spot Quote
          </AppButton>
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip="Loading quotation requests...">
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              data={quotes}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={10}
              className="rates-grid"
            />
          </div>
        </Card>
      </Spin>

      <QuoteRequestDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
