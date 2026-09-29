// Modified by Sekar Nagarajan (2026-09-08 14:23)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Card, Flex, Space, Spin, Tag, Typography } from "antd";
import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useQuotesQuery } from "../api/rates.queries";
import type { QuoteDTO } from "../types/rates.types";
import { QuoteRequestDrawer } from "./QuoteRequestDrawer";

const { Text } = Typography;

function quoteStatusLabel(
  status: QuoteDTO["status"] | undefined,
  t: TFunction<"rates">,
): string {
  if (!status) return "";
  switch (status) {
    case "DRAFT":
      return t("quotes.status.DRAFT");
    case "PENDING_REVIEW":
      return t("quotes.status.PENDING_REVIEW");
    case "QUOTED":
      return t("quotes.status.QUOTED");
    case "ACCEPTED":
      return t("quotes.status.ACCEPTED");
    case "EXPIRED":
      return t("quotes.status.EXPIRED");
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function QuotesView() {
  const { t } = useTranslation(["rates", "common", "modules"]);
  const toast = useToast();
  const navigate = useNavigate();
  const { profileHandlers } = useLocalGridProfiles("rates-rfq");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: quotes = [], isLoading, isError, refetch } = useQuotesQuery();

  const handleConvertBooking = (quote: QuoteDTO) => {
    toast.info(t("toasts.convertingQuote", { quoteNo: quote.quoteNo }));
    navigate({ to: "/app/schedules" });
  };

  const columnDefs: DataViewColumn<QuoteDTO>[] = [
    buildActionsColumn<QuoteDTO>({
      field: "id",
      width: 120,
      cellRenderer: (params: { data?: QuoteDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <ListActionsRow>
            <ListActionButton
              title={t("actions.convertQuote")}
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
            <ListActionButton
              title={t("actions.viewQuoteTerms")}
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => undefined}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: t("quotes.columns.quoteRefNo"),
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
      headerName: t("quotes.columns.customerName"),
      field: "customerName",
      minWidth: 180,
    },
    {
      headerName: t("quotes.columns.shipmentRoute"),
      field: "originPort",
      minWidth: 200,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Text className="rates-cell-body">
          {params.data?.originPort} → {params.data?.deliveryPort}
        </Text>
      ),
    },
    {
      headerName: t("quotes.columns.equipmentQty"),
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
      headerName: t("quotes.columns.quotedRateUsd"),
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
            ? t("quotes.amountUsd", {
                amount: params.data.quotedAmountUsd.toFixed(2),
              })
            : t("quotes.pendingPricing")}
        </Text>
      ),
    },
    {
      headerName: t("quotes.columns.status"),
      field: "status",
      width: 140,
      cellRenderer: (params: { data?: QuoteDTO }) => {
        const status = params.data?.status;
        let color = "default";
        if (status === "QUOTED") color = "blue";
        if (status === "ACCEPTED") color = "green";
        if (status === "PENDING_REVIEW") color = "orange";
        if (status === "EXPIRED") color = "red";
        return <Tag color={color}>{quoteStatusLabel(status, t)}</Tag>;
      },
    },
    {
      headerName: t("quotes.columns.validityWindow"),
      field: "validFrom",
      minWidth: 180,
      cellRenderer: (params: { data?: QuoteDTO }) => (
        <Text className="rates-cell-sub">
          {t("quotes.validityRange", {
            from: params.data?.validFrom,
            to: params.data?.validTo,
          })}
        </Text>
      ),
    },
  ];

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("errors.quotesLoadTitle")}
      message={t("errors.loadFailedMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="blank"
      title={t("empty.quotesTitle")}
      message={t("empty.quotesMessage")}
    />
  );

  return (
    <div className="rates-stack">
      <Card className="rates-filter-card">
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <div className="rates-toolbar-copy">
            <Text className="rates-toolbar-copy__title">
              {t("quotes.toolbarTitle")}
            </Text>
            <Text type="secondary" className="rates-toolbar-copy__sub">
              {t("quotes.toolbarSub")}
            </Text>
          </div>

          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={() => setIsDrawerOpen(true)}
          >
            {t("actions.requestSpotQuote")}
          </AppButton>
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip={t("quotes.loading")}>
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              rowData={quotes}
              emptyState={emptyState}
              columnDefs={columnDefs}
              listOptions={{
                ...profileHandlers,
                showToolbar: { showTotalCount: true, fullScreen: true },
                sideBar: true,
                pagination: true,
                paginationPageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                defaultColDef: { filter: true },
              }}
              className="rates-grid"
              renderToolbar={() => null}
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
