// Modified by sekar nagarajan (2026-08-21 23:40)

import { ArrowRightOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { AppButton, useToast } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { useNavigate } from '@tanstack/react-router';
import { Card, Flex, Space, Spin, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useQuotesQuery } from '../api/rates.queries';
import { QuoteDTO } from '../types/rates.types';
import { QuoteRequestDrawer } from './QuoteRequestDrawer';

const { Text } = Typography;

export function QuotesView() {
  const { token } = theme.useToken();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: quotes = [], isLoading } = useQuotesQuery();

  const handleConvertBooking = (quote: QuoteDTO) => {
    showToast(`Converting Quote ${quote.quoteNo} into e-Booking...`, 'info');
    navigate({ to: '/schedules' as any });
  };

  const columnDefs: DataViewColumn<QuoteDTO>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        sortable: false,
        width: 120,
        pinned: 'left',
        cellRenderer: (params: { data?: QuoteDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Space size={4}>
              <Tooltip title="Convert Quote into e-Booking">
                <AppButton
                  type="text"
                  size="small"
                  disabled={record.status === 'EXPIRED' || record.status === 'PENDING_REVIEW'}
                  icon={<ArrowRightOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
                  onClick={() => handleConvertBooking(record)}
                />
              </Tooltip>
              <Tooltip title="View Quotation Terms & Conditions">
                <AppButton
                  type="text"
                  size="small"
                  icon={<EyeOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />}
                />
              </Tooltip>
            </Space>
          );
        },
      },
      {
        headerName: 'Quote Ref No',
        field: 'quoteNo',
        minWidth: 160,
        cellRenderer: (params: { data?: QuoteDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: token.colorPrimary }}>{params.data?.quoteNo}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{params.data?.createdAt}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Customer Name',
        field: 'customerName',
        minWidth: 180,
      },
      {
        headerName: 'Shipment Route',
        field: 'originPort',
        minWidth: 200,
        cellRenderer: (params: { data?: QuoteDTO }) => (
          <Text style={{ fontSize: 13 }}>
            {params.data?.originPort} → {params.data?.deliveryPort}
          </Text>
        ),
      },
      {
        headerName: 'Equipment & Qty',
        field: 'eqpType',
        minWidth: 180,
        cellRenderer: (params: { data?: QuoteDTO }) => (
          <Space size={6}>
            <Tag color="blue">{params.data?.eqpType}</Tag>
            <Text strong>x{params.data?.eqpQuantity}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Quoted Rate (USD)',
        field: 'quotedAmountUsd',
        minWidth: 160,
        cellRenderer: (params: { data?: QuoteDTO }) => (
          <Text strong style={{ color: params.data?.quotedAmountUsd ? '#3f8600' : '#faad14', fontSize: 14 }}>
            {params.data?.quotedAmountUsd ? `$${params.data.quotedAmountUsd.toFixed(2)} USD` : 'Pending Pricing'}
          </Text>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 140,
        cellRenderer: (params: { data?: QuoteDTO }) => {
          const status = params.data?.status;
          let color = 'default';
          if (status === 'QUOTED') color = 'blue';
          if (status === 'ACCEPTED') color = 'green';
          if (status === 'PENDING_REVIEW') color = 'orange';
          if (status === 'EXPIRED') color = 'red';
          return <Tag color={color}>{status?.replace('_', ' ')}</Tag>;
        },
      },
      {
        headerName: 'Validity Window',
        field: 'validFrom',
        minWidth: 180,
        cellRenderer: (params: { data?: QuoteDTO }) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {params.data?.validFrom} to {params.data?.validTo}
          </Text>
        ),
      },
    ],
    [token.colorPrimary]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Toolbar */}
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: 16 }}>Spot Rate Inquiries & Quotes</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>Submit spot rate inquiries and convert approved quotes into e-Bookings.</Text>
          </Space>

          <AppButton type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            Request Spot Quote
          </AppButton>
        </Flex>
      </Card>

      {/* Quotes AG Grid DataView with CRM Spin Overlay */}
      <Spin spinning={isLoading} tip="Loading quotation requests...">
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <DataView
            data={quotes}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={10}
            style={{ height: 480 }}
          />
        </Card>
      </Spin>

      {/* Quote Request Drawer */}
      <QuoteRequestDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </Space>
  );
}
