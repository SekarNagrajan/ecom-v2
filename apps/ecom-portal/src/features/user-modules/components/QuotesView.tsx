// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useNavigate } from "@tanstack/react-router";
import { Card, Col, Row, Space, Statistic, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  useCreateQuoteMutation,
  useQuotesQuery,
} from "../api/user-modules.queries";
import type {
  CreateQuoteRequestPayload,
  QuoteItem,
} from "../types/user-modules.types";
import { createQuoteRequestSchema } from "../types/user-modules.types";
import { UmLoadingCenter } from "./um-loading-center";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const POL_OPTIONS = [
  { value: "Port of New York (USNYC)", label: "USNYC - Port of New York" },
  { value: "Port of Rotterdam (NLRTM)", label: "NLRTM - Port of Rotterdam" },
  { value: "Hamburg Port (DEHAM)", label: "DEHAM - Hamburg Port" },
];

const POD_OPTIONS = [
  { value: "Port of Singapore (SGSIN)", label: "SGSIN - Port of Singapore" },
  { value: "Shanghai Port (CNSHA)", label: "CNSHA - Shanghai Port" },
  { value: "Jebel Ali (AEJEA)", label: "AEJEA - Jebel Ali Port" },
];

const EQUIPMENT_OPTIONS = [
  {
    value: "20ft Standard Container (20GP)",
    label: "20ft Standard Container (20GP)",
  },
  {
    value: "40ft High Cube Container (40HC)",
    label: "40ft High Cube Container (40HC)",
  },
  {
    value: "40ft Reefer Container (40RF)",
    label: "40ft Reefer Container (40RF)",
  },
];

const QUOTE_DEFAULTS: CreateQuoteRequestPayload = {
  polPort: "",
  podPort: "",
  equipmentType: "",
  commodity: "",
  targetDate: "",
  remarks: "",
};

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

export function QuotesView() {
  const navigate = useNavigate();
  const { data: quotes = [], isLoading } = useQuotesQuery();
  const { mutateAsync: createQuote, isPending: isSubmitting } =
    useCreateQuoteMutation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const form = useForm<CreateQuoteRequestPayload>({
    resolver: zodResolver(
      createQuoteRequestSchema,
    ) as Resolver<CreateQuoteRequestPayload>,
    defaultValues: QUOTE_DEFAULTS,
  });

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    form.reset(QUOTE_DEFAULTS);
  };

  const handleCreateQuote = form.handleSubmit(async (values) => {
    await createQuote(values);
    handleCloseDrawer();
  });

  const columnDefs: DataViewColumn<QuoteItem>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 120,
      pinned: "left",
      cellRenderer: (params: { data?: QuoteItem }) => {
        const rec = params.data;
        if (!rec) return null;
        return rec.status === "QUOTED" ? (
          <Tooltip title="Convert Quote into e-Booking">
            <AppButton
              type="primary"
              size="small"
              icon={
                <AppIcon
                  icon={Icons.arrowRight}
                  size={14}
                  gridAction
                  tone="navigate"
                />
              }
              onClick={() => {
                navigate({ to: "/app/schedules" });
              }}
            >
              Book
            </AppButton>
          </Tooltip>
        ) : (
          <Tooltip title="View Quotation Details">
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: "Quote Reference",
      field: "quoteNo",
      sortable: true,
      cellRenderer: (params: { value?: string }) => (
        <Space>
          <AppIcon icon={Icons.fileText} size={16} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: "Route (POL → POD)",
      field: "polCode",
      sortable: false,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.polCode} → ${params.data.podCode}` : "",
    },
    {
      headerName: "Equipment & Commodity",
      field: "equipmentType",
      sortable: true,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data
          ? `${params.data.equipmentType} (${params.data.commodity})`
          : "",
    },
    {
      headerName: "Quoted Amount",
      field: "totalAmountUSD",
      sortable: true,
      cellRenderer: (params: { value?: number }) => (
        <span className="um-amount-primary">
          $
          {params.value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}{" "}
          USD
        </span>
      ),
    },
    {
      headerName: "Validity Period",
      field: "validTo",
      sortable: true,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.validFrom} to ${params.data.validTo}` : "",
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const st = params.value || "";
        const colorMap: Record<string, string> = {
          QUOTED: "blue",
          ACCEPTED: "green",
          PENDING_REVIEW: "gold",
          EXPIRED: "red",
        };
        return <Tag color={colorMap[st] || "default"}>{st}</Tag>;
      },
    },
  ];

  const activeCount = quotes.filter((q) => q.status === "QUOTED").length;
  const acceptedCount = quotes.filter((q) => q.status === "ACCEPTED").length;

  return (
    <div className="um-page-layout">
      <ModuleScreenHeader
        icon={Icons.edit}
        title={MODULE_TITLES.quotes}
        subtitle="Request ocean freight quotations, view active tariff quotes, and book containers"
        extra={
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={() => setIsDrawerOpen(true)}
          >
            Request New Rate Quote
          </AppButton>
        }
      />

      <Row className="um-kpi-row" gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card um-kpi-card--primary" type="inner">
            <Statistic title="Active Quoted Offers" value={activeCount} />
          </Card>
        </Col>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card um-kpi-card--success" type="inner">
            <Statistic title="Accepted / Booked Quotes" value={acceptedCount} />
          </Card>
        </Col>
        <Col {...RESPONSIVE_COL.third}>
          <Card className="um-kpi-card" type="inner">
            <Statistic title="Total RFQ Quotations" value={quotes.length} />
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
            rowData={quotes}
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

      <AppDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        dialogSize="md"
        destroyOnClose
        maskClosable={!isSubmitting}
        keyboard={!isSubmitting}
        classNames={{
          body: "um-drawer-body custom-scroll",
          footer: "um-drawer-footer-bar",
        }}
        styles={{ body: { padding: 0 } }}
        title="Submit New Rate Quotation Request"
        footer={
          <div className="um-drawer-footer form-step-footer">
            <AppButton onClick={handleCloseDrawer} disabled={isSubmitting}>
              Cancel
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.send} size={16} />}
              loading={isSubmitting}
              onClick={handleCreateQuote}
            >
              Submit
            </AppButton>
          </div>
        }
      >
        <div className="um-form-section">
          <Row gutter={[16, 16]}>
            <Col {...RESPONSIVE_COL.formHalf}>
              <FormSelect
                control={form.control}
                name="polPort"
                label={reqLabel("Port of Loading (POL)")}
                size="large"
                placeholder="Select origin port"
                options={POL_OPTIONS}
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <FormSelect
                control={form.control}
                name="podPort"
                label={reqLabel("Port of Discharge (POD)")}
                size="large"
                placeholder="Select destination port"
                options={POD_OPTIONS}
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <FormSelect
                control={form.control}
                name="equipmentType"
                label={reqLabel("Equipment Type")}
                size="large"
                placeholder="Select container type"
                options={EQUIPMENT_OPTIONS}
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <FormInput
                control={form.control}
                name="commodity"
                label={reqLabel("Commodity Description")}
                size="large"
                placeholder="e.g. General Cargo, Electronics"
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            <Col {...RESPONSIVE_COL.full}>
              <FormDatePicker
                control={form.control}
                name="targetDate"
                label={reqLabel("Target Departure Date")}
                size="large"
                valueFormat="calendar-date"
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            <Col {...RESPONSIVE_COL.full}>
              <FormTextarea
                control={form.control}
                name="remarks"
                label={optLabel("Additional Shipment Remarks")}
                rows={4}
                placeholder="Enter any special handling notes, target rates, or commodity specs..."
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
          </Row>
        </div>
      </AppDrawer>
    </div>
  );
}
