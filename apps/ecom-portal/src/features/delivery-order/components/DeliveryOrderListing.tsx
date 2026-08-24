// Created by Sekar Nagarajan (2026-08-24 14:46)
import { PrinterOutlined, ArrowLeftOutlined, SearchOutlined, EyeFilled } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Button, DatePicker, Flex, Space, Tag, Typography, theme, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import type { DOSummaryRow } from '../types/delivery-order.types';
import { useDOSummaryQuery, useDODownloadMutation } from '../api/delivery-order.queries';
import { FormattedDate } from '@solverminds/shared-ui';
import dayjs from 'dayjs'; // Antd DatePicker uses dayjs by default in v5+

const { Text, Title } = Typography;

interface DeliveryOrderListingProps {
  onView: (delOrdNo: string) => void;
  onBack: () => void;
}

export function DeliveryOrderListing({ onView, onBack }: DeliveryOrderListingProps) {
  const { token } = theme.useToken();
  const [fromDate, setFromDate] = useState<string | undefined>(
    DateTime.now().minus({ days: 60 }).toISODate() ?? undefined
  );
  const [toDate, setToDate] = useState<string | undefined>(
    DateTime.now().toISODate() ?? undefined
  );
  
  // To trigger refetch only when clicking 'Show'
  const [activeFilters, setActiveFilters] = useState({ fromDate, toDate });

  const { data: rows = [], isLoading } = useDOSummaryQuery(activeFilters.fromDate, activeFilters.toDate);
  const { mutate: downloadDoc, isPending: isDownloading } = useDODownloadMutation();

  const handleSearch = () => {
    setActiveFilters({ fromDate, toDate });
  };

  const columns: DataViewColumn<DOSummaryRow>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'delordno' as any,
        width: 100,
        pinned: 'left',
        cellRenderer: (params: { data?: DOSummaryRow }) => {
          if (!params.data) return null;
          return (
            <Space size={6}>
              <Tooltip title="View Details">
                <AppButton
                  type="text"
                  size="small"
                  icon={<EyeFilled style={{ color: token.colorPrimary, fontSize: 16 }} />}
                  onClick={() => onView(params.data!.delordno)}
                />
              </Tooltip>
              <Tooltip title="Print Delivery Order">
                <AppButton
                  type="text"
                  size="small"
                  icon={<PrinterOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />}
                  onClick={() => downloadDoc(params.data!.delordno)}
                />
              </Tooltip>
            </Space>
          );
        },
      },
      { field: 'delordno', headerName: 'DO No', width: 140, pinned: 'left' },
      { 
        field: 'delorddate', 
        headerName: 'DO Date', 
        width: 140,
        cellRenderer: (p: any) => p.value ? <FormattedDate value={p.value} /> : '-'
      },
      { field: 'blnumber', headerName: 'B/L Number', width: 150 },
      { field: 'vessel', headerName: 'Vessel', width: 150 },
      { field: 'voyage', headerName: 'Voyage', width: 100 },
      { field: 'loadport', headerName: 'POL', width: 100 },
      { field: 'dischargeport', headerName: 'POD', width: 100 },
      { field: 'terminal', headerName: 'Terminal', width: 130 },
      { 
        field: 'arrdate', 
        headerName: 'Arrival', 
        width: 140,
        cellRenderer: (p: any) => p.value ? <FormattedDate value={p.value} /> : '-'
      },
      { 
        field: 'dovaliditydate', 
        headerName: 'Valid Till', 
        width: 140,
        cellRenderer: (p: any) => p.value ? <FormattedDate value={p.value} /> : '-'
      },
      {
        headerName: 'Status',
        field: 'printstatus',
        width: 120,
        cellRenderer: (params: { data?: DOSummaryRow }) => {
          if (!params.data) return null;
          const isPrinted = params.data.printstatus === 'Y';
          return (
            <Tag color={isPrinted ? 'success' : 'default'} style={{ margin: 0, borderRadius: 12 }}>
              {isPrinted ? 'Printed' : 'Not Printed'}
            </Tag>
          );
        },
      },
    ],
    [onView, downloadDoc, token]
  );

  return (
    <Flex vertical style={{ height: '100%', flex: 1, minHeight: 0 }}>
      {/* Header and Filters */}
      <Flex align="center" justify="space-between" style={{ padding: '16px 24px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Space size={16} align="center">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} />
          <Title level={4} style={{ margin: 0 }}>Delivery Order Summary</Title>
        </Space>
        
        <Space size={12}>
          <Flex align="center" gap={8}>
            <Text type="secondary" style={{ fontSize: 13 }}>From Date:</Text>
            <DatePicker 
              value={fromDate ? dayjs(fromDate) : null} 
              onChange={(d) => setFromDate(d ? d.format('YYYY-MM-DD') : undefined)} 
              allowClear={false}
            />
          </Flex>
          <Flex align="center" gap={8}>
            <Text type="secondary" style={{ fontSize: 13 }}>To Date:</Text>
            <DatePicker 
              value={toDate ? dayjs(toDate) : null} 
              onChange={(d) => setToDate(d ? d.format('YYYY-MM-DD') : undefined)} 
              allowClear={false}
            />
          </Flex>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Show
          </Button>
        </Space>
      </Flex>

      {/* Grid */}
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <DataView
          rowData={rows}
          columnDefs={columns}
          loading={isLoading}
        />
      </div>
    </Flex>
  );
}
