// Ongoing Shipments table — AG Grid DataView implementation
// Elimination of double-nested Card & empty gap
// Parity with enhancedDashboard.jsp #enhOngoingTable
// Follows agenct.md and shared-ui data-view rules
// Modified by sekar nagarajan (2026-08-21)

import { ArrowRightOutlined, EyeOutlined, FileAddOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Flex, Input, Space, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { DashboardShipment } from '../api/dashboard.api';

const { Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  C: { label: 'Confirmed', color: 'success' },
  D: { label: 'Draft', color: 'blue' },
  V: { label: 'Cancelled', color: 'error' },
  I: { label: 'Issued', color: 'warning' },
};

interface DashboardOngoingTableProps {
  shipments: DashboardShipment[];
  activeFilter: string;
  filterLabel: string;
  onViewBooking?: (bookNo: string, refNo: string) => void;
  onViewBl?: (blNo: string, bookNo: string) => void;
  onCreateSi?: (bookNo: string) => void;
}

export function DashboardOngoingTable({
  shipments,
  activeFilter,
  filterLabel,
  onViewBooking,
  onViewBl,
  onCreateSi,
}: DashboardOngoingTableProps) {
  const { token } = theme.useToken();
  const [searchText, setSearchText] = useState('');

  // Filter logic: parity with enhDetailPanel JS filter logic
  const filteredShipments = useMemo(() => {
    let data = shipments;
    if (activeFilter && activeFilter !== 'all') {
      if (activeFilter === 'siPending') {
        data = data.filter((s) => !s.siNo && !s.blNo);
      } else if (activeFilter === 'bkConfirmed') {
        data = data.filter((s) => s.status === 'C' || s.status === 'I');
      } else if (activeFilter === 'payPending') {
        data = data.filter((s) => s.amtBal > 0);
      }
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (s) =>
          s.bookNo.toLowerCase().includes(q) ||
          s.blNo.toLowerCase().includes(q) ||
          s.onlineRefNo.toLowerCase().includes(q) ||
          s.originPortDesc.toLowerCase().includes(q) ||
          s.finalPortDesc.toLowerCase().includes(q)
      );
    }
    return data;
  }, [shipments, activeFilter, searchText]);

  // AG Grid DataView Column Definitions — Actions Column FIRST per agenct.md
  const columnDefs: DataViewColumn<DashboardShipment>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'bookNo',
        sortable: false,
        width: 140,
        pinned: 'left',
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec) return null;
          return (
            <Space size={6}>
              {rec.bookNo && (
                <Tooltip title="View Booking Details">
                  <AppButton
                    type="text"
                    size="small"
                    icon={<EyeOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
                    onClick={() => onViewBooking?.(rec.bookNo, rec.onlineRefNo)}
                  />
                </Tooltip>
              )}
              {rec.blNo ? (
                <Tooltip title="View Bill of Lading">
                  <AppButton
                    type="text"
                    size="small"
                    icon={<FileTextOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />}
                    onClick={() => onViewBl?.(rec.blNo, rec.bookNo)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Create Shipping Instruction (SI)">
                  <AppButton
                    type="text"
                    size="small"
                    icon={<FileAddOutlined style={{ color: token.colorWarning, fontSize: 16 }} />}
                    onClick={() => onCreateSi?.(rec.bookNo)}
                  />
                </Tooltip>
              )}
            </Space>
          );
        },
      },
      {
        headerName: 'Booking No',
        field: 'bookNo',
        sortable: true,
        width: 140,
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec?.bookNo) return <Text type="secondary">-</Text>;
          return (
            <AppButton
              type="link"
              size="small"
              style={{ padding: 0, fontWeight: 700 }}
              onClick={() => onViewBooking?.(rec.bookNo, rec.onlineRefNo)}
            >
              {rec.bookNo}
            </AppButton>
          );
        },
      },
      {
        headerName: 'BL Number',
        field: 'blNo',
        sortable: true,
        width: 140,
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec?.blNo) return <Text type="secondary">-</Text>;
          return (
            <AppButton
              type="link"
              size="small"
              style={{ padding: 0 }}
              onClick={() => onViewBl?.(rec.blNo, rec.bookNo)}
            >
              {rec.blNo}
            </AppButton>
          );
        },
      },
      {
        headerName: 'Online Ref No',
        field: 'onlineRefNo',
        sortable: true,
        width: 140,
        cellRenderer: (params: { value?: string }) => params.value || <Text type="secondary">-</Text>,
      },
      {
        headerName: 'Origin Port',
        field: 'originPortDesc',
        sortable: true,
        width: 180,
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec) return '-';
          const label = rec.originPortId && rec.originPortDesc ? `${rec.originPortId} - ${rec.originPortDesc}` : rec.originPortId || '-';
          return (
            <Tooltip title={label}>
              <Text ellipsis style={{ maxWidth: 160 }}>{label}</Text>
            </Tooltip>
          );
        },
      },
      {
        headerName: 'Delivery Port',
        field: 'finalPortDesc',
        sortable: true,
        width: 180,
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec) return '-';
          const label = rec.finalPortId && rec.finalPortDesc ? `${rec.finalPortId} - ${rec.finalPortDesc}` : rec.finalPortId || '-';
          return (
            <Tooltip title={label}>
              <Text ellipsis style={{ maxWidth: 160 }}>{label}</Text>
            </Tooltip>
          );
        },
      },
      {
        headerName: 'Departure Date',
        field: 'polAt',
        sortable: true,
        width: 130,
        cellRenderer: (params: { value?: string }) => params.value || <Text type="secondary">-</Text>,
      },
      {
        headerName: 'BL Status',
        field: 'status',
        sortable: true,
        width: 120,
        cellRenderer: (params: { value?: string }) => {
          const val = params.value || '';
          const st = STATUS_MAP[val];
          return st ? <Tag color={st.color}>{st.label}</Tag> : <Text type="secondary">-</Text>;
        },
      },
      {
        headerName: 'Container No',
        field: 'containerNo',
        sortable: true,
        width: 140,
        cellRenderer: (params: { value?: string }) => params.value || <Text type="secondary">-</Text>,
      },
      {
        headerName: 'TEUs',
        field: 'teus',
        sortable: true,
        width: 80,
        cellRenderer: (params: { value?: string }) => params.value || <Text type="secondary">-</Text>,
      },
      {
        headerName: 'SI Status',
        field: 'siNo',
        sortable: false,
        width: 120,
        cellRenderer: (params: { data?: DashboardShipment }) => {
          const rec = params.data;
          if (!rec) return <Text type="secondary">-</Text>;
          if (rec.siNo) {
            return (
              <Space size={4}>
                <FileTextOutlined style={{ color: token.colorSuccess }} />
                <Text style={{ fontSize: 12 }}>{rec.siNo}</Text>
              </Space>
            );
          }
          if (!rec.blNo && rec.bookNo) {
            return (
              <Tooltip title="Create SI">
                <AppButton
                  type="text"
                  size="small"
                  icon={<FileAddOutlined style={{ color: token.colorPrimary }} />}
                  onClick={() => onCreateSi?.(rec.bookNo)}
                />
              </Tooltip>
            );
          }
          return <Text type="secondary">-</Text>;
        },
      },
      {
        headerName: 'Outstanding Bal (USD)',
        field: 'amtBal',
        sortable: true,
        width: 160,
        cellRenderer: (params: { value?: number }) => {
          const val = params.value || 0;
          return val > 0 ? (
            <Text style={{ color: token.colorError, fontWeight: 700, fontSize: 13 }}>
              ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          ) : (
            <Text type="secondary">$0.00</Text>
          );
        },
      },
    ],
    [onViewBooking, onViewBl, onCreateSi, token]
  );

  return (
    <div style={{ background: token.colorBgContainer, borderRadius: 16, padding: '16px 20px' }}>
      <DataView
        style={{ height: 320 }}
        columnDefs={columnDefs}
        rowData={filteredShipments}
        allowedViewModes={['list']}
        renderToolbar={() => (
          <Flex align="center" justify="space-between" wrap gap="small" style={{ marginBottom: 12 }}>
            <Space align="center">
              <ArrowRightOutlined style={{ color: token.colorPrimary }} />
              <Text strong style={{ fontSize: 15 }}>
                Ongoing Transactions {filterLabel !== 'Total Shipments' ? `— ${filterLabel}` : ''}
              </Text>
            </Space>
            <Input
              placeholder="Search bookings..."
              prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
              allowClear
              style={{ width: 240 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Flex>
        )}
        listOptions={{
          gridOptions: {
            domLayout: 'autoHeight',
            animateRows: true,
            pagination: true,
            paginationPageSize: 10,
          },
        }}
      />
    </div>
  );
}
