// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { AppButton, FormattedDate } from '@solverminds/shared-ui';
import { DataView, type DataViewColumn } from '@solverminds/shared-ui/data-view';
import type { RowDoubleClickedEvent } from 'ag-grid-community';
import { Col, DatePicker, Row, Space, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';

import { AppIcon, Icons, NavIcons } from '../../../components/icons';
import { ModuleScreenHeader } from '../../../components/shared/module-screen-header';
import { MODULE_TITLES } from '../../../constants/module-titles';
import { RESPONSIVE_COL } from '../../../constants/responsive-grid';
import {
  useArrivalNoticeDownloadMutation,
  useArrivalNoticeListQuery,
} from '../api/arrival-notice.queries';
import type { ArrivalNoticeListDTO } from '../types/arrival-notice.types';
import {
  ARN_PRINT_STATUS_LABELS,
  formatArrivalNoticeAmount,
  getArrivalNoticePrintStatusColor,
} from '../types/arrival-notice.types';

interface ArrivalNoticeListingProps {
  fromDate: string | undefined;
  toDate: string | undefined;
  activeFromDate: string | undefined;
  activeToDate: string | undefined;
  onFromDateChange: (value: string | undefined) => void;
  onToDateChange: (value: string | undefined) => void;
  onSearch: () => void;
  onView: (anNo: string) => void;
}

export function ArrivalNoticeListing({
  fromDate,
  toDate,
  activeFromDate,
  activeToDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onView,
}: ArrivalNoticeListingProps) {
  const { data: rows = [], isLoading } = useArrivalNoticeListQuery(
    activeFromDate,
    activeToDate
  );
  const { mutate: downloadDoc } = useArrivalNoticeDownloadMutation();

  const columns: DataViewColumn<ArrivalNoticeListDTO>[] = [
    {
      headerName: 'Actions',
      field: 'anNo',
      width: 100,
      pinned: 'left',
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        return (
          <Space size={6}>
            <Tooltip title="View Details">
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.eye} size={16} gridAction tone="view" />}
                onClick={() => onView(params.data!.anNo)}
              />
            </Tooltip>
            <Tooltip title="Print Arrival Notice">
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.printer} size={16} gridAction tone="print" />}
                onClick={() => downloadDoc(params.data!.anNo)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    { field: 'anNo', headerName: 'AN No', width: 130, pinned: 'left' },
    { field: 'blNumber', headerName: 'B/L Number', width: 140 },
    { field: 'vessel', headerName: 'Vessel', width: 140 },
    { field: 'voyage', headerName: 'Voyage', width: 100 },
    { field: 'dischargePort', headerName: 'Discharge', width: 160 },
    { field: 'terminal', headerName: 'Terminal', width: 120 },
    {
      field: 'etaDate',
      headerName: 'ETA',
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : '-',
    },
    {
      field: 'arrivalDate',
      headerName: 'Arrival',
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : '-',
    },
    {
      field: 'lastFreeDay',
      headerName: 'Last Free Day',
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : '-',
    },
    {
      field: 'chargesDue',
      headerName: 'Charges Due',
      width: 140,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        if (params.data.chargesDue <= 0) return '—';
        return formatArrivalNoticeAmount(params.data.chargesDue, params.data.currency);
      },
    },
    {
      headerName: 'Print',
      field: 'printStatus',
      width: 120,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="arn-status-tag"
            color={getArrivalNoticePrintStatusColor(params.data.printStatus)}
          >
            {ARN_PRINT_STATUS_LABELS[params.data.printStatus]}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="arn-page-layout">
      <div className="arn-page-header">
        <ModuleScreenHeader
          icon={NavIcons.arrivalNotice}
          title={MODULE_TITLES.arrivalNotice}
          subtitle={`${rows.length} arrival notice${rows.length === 1 ? '' : 's'} · Filter by date, review vessel and charges, and print notices.`}
          marginBottom={0}
        />
      </div>

      <div className="arn-search-panel">
        <div className="arn-search-panel__body">
          <Row gutter={[16, 16]} align="bottom">
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="arn-search-field">
                <span className="form-field-label">From Date</span>
                <DatePicker
                  size="large"
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(d) => onFromDateChange(d ? d.format('YYYY-MM-DD') : undefined)}
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="arn-search-field">
                <span className="form-field-label">To Date</span>
                <DatePicker
                  size="large"
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(d) => onToDateChange(d ? d.format('YYYY-MM-DD') : undefined)}
                  allowClear={false}
                />
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
              <div className="arn-search-actions-field">
                <span className="arn-search-actions-field__spacer form-field-label">Show</span>
                <div className="arn-search-actions">
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

      <div className="arn-grid-wrap responsive-table-wrap">
        <DataView
          rowData={rows}
          columnDefs={columns}
          loading={isLoading}
          allowedViewModes={['list']}
          defaultViewMode="list"
          renderToolbar={() => null}
          className="arn-data-view"
          listOptions={{
            showToolbar: false,
            gridOptions: {
              getRowId: (params: { data: ArrivalNoticeListDTO }) => params.data.anNo,
              onRowDoubleClicked: (event: RowDoubleClickedEvent<ArrivalNoticeListDTO>) => {
                const anNo = event.data?.anNo;
                if (anNo) onView(anNo);
              },
              overlayNoRowsTemplate: 'No arrival notices found.',
            },
          }}
        />
      </div>
    </div>
  );
}
