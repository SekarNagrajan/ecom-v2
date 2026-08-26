// Modified by Sekar Nagarajan (2026-08-25 12:19)
import { AppButton, FormattedDate } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Col, DatePicker, Row, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useCRODownloadMutation, useCROSummaryQuery } from "../api/cro.queries";
import type { CROListDTO } from "../types/cro.types";
import { getCROReleaseStatusColor } from "../types/cro.types";

interface CROListingProps {
  fromDate: string | undefined;
  toDate: string | undefined;
  activeFromDate: string | undefined;
  activeToDate: string | undefined;
  onFromDateChange: (value: string | undefined) => void;
  onToDateChange: (value: string | undefined) => void;
  onSearch: () => void;
  onView: (croNo: string) => void;
}

export function CROListing({
  fromDate,
  toDate,
  activeFromDate,
  activeToDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onView,
}: CROListingProps) {
  const { data: rows = [], isLoading } = useCROSummaryQuery(
    activeFromDate,
    activeToDate,
  );
  const { mutate: downloadDoc } = useCRODownloadMutation();

  const columns: DataViewColumn<CROListDTO>[] = [
    {
      headerName: "Actions",
      field: "croNo",
      width: 100,
      pinned: "left",
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Space size={6}>
            <Tooltip title="View Details">
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.eye} size={16} gridAction tone="view" />}
                onClick={() => onView(params.data!.croNo)}
              />
            </Tooltip>
            <Tooltip title="Print Container Release Order">
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.printer} size={16} gridAction tone="print" />}
                onClick={() => downloadDoc(params.data!.croNo)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    { field: "croNo", headerName: "Release No", width: 130, pinned: "left" },
    { field: "bookingNo", headerName: "Booking No", width: 130 },
    {
      field: "croDate",
      headerName: "CRO Date",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    { field: "vessel", headerName: "Vessel", width: 140 },
    { field: "voyage", headerName: "Voyage", width: 100 },
    { field: "loadPort", headerName: "Load Port", width: 140 },
    { field: "dischargePort", headerName: "Discharge", width: 140 },
    { field: "eqpType", headerName: "Cont Type", width: 100 },
    { field: "qtyBooked", headerName: "Qty Booked", width: 110 },
    { field: "qtyReleased", headerName: "Qty Released", width: 120 },
    {
      field: "emptyReleaseDepot",
      headerName: "Empty Release Depot",
      width: 170,
    },
    {
      field: "validTo",
      headerName: "CRO Validity",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      headerName: "Status",
      field: "releaseStatus",
      width: 120,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="cro-status-tag"
            color={getCROReleaseStatusColor(params.data.releaseStatus)}
          >
            {params.data.releaseStatus}
          </Tag>
        );
      },
    },
    {
      headerName: "Print",
      field: "printStatus",
      width: 110,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        const isPrinted = params.data.printStatus === "Y";
        return (
          <Tag
            className="cro-status-tag"
            color={isPrinted ? "success" : "default"}
          >
            {isPrinted ? "Printed" : "Not Printed"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="cro-page-layout">
      <div className="cro-page-header">
        <ModuleScreenHeader
          icon={NavIcons.containerRelease}
          title={MODULE_TITLES.containerReleaseOrder}
          marginBottom={0}
        />
      </div>

      <div className="cro-search-panel">
        <div className="cro-search-panel__body">
          <Row gutter={[16, 16]} align="bottom">
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="cro-search-field">
                <span className="form-field-label">From Date</span>
                <DatePicker
                  size="large"
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(d) =>
                    onFromDateChange(d ? d.format("YYYY-MM-DD") : undefined)
                  }
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="cro-search-field">
                <span className="form-field-label">To Date</span>
                <DatePicker
                  size="large"
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(d) =>
                    onToDateChange(d ? d.format("YYYY-MM-DD") : undefined)
                  }
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="cro-search-actions-field">
                <span className="cro-search-actions-field__spacer form-field-label">
                  Show
                </span>
                <div className="cro-search-actions">
                  <AppButton
                    type="primary"
                    size="large"
                    icon={<AppIcon icon={Icons.search} size={16} />}
                    onClick={onSearch}
                  >
                    Show
                  </AppButton>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="cro-grid-wrap responsive-table-wrap">
        <DataView
          rowData={rows}
          columnDefs={columns}
          loading={isLoading}
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          className="cro-data-view"
          listOptions={{
            showToolbar: true,
            gridOptions: {
              getRowId: (params: { data: CROListDTO }) => params.data.croNo,
              onRowDoubleClicked: (
                event: RowDoubleClickedEvent<CROListDTO>,
              ) => {
                const croNo = event.data?.croNo;
                if (croNo) onView(croNo);
              },
            },
          }}
        />
      </div>
    </div>
  );
}
