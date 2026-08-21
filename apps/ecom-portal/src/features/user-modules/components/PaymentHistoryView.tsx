// Modified by Antigravity (2026-08-21)
import React, { useEffect, useState } from 'react';
import { Card, Tag, Space, Typography, DatePicker, Row, Col, Statistic, theme } from 'antd';
import { CreditCardOutlined, DownloadOutlined, CheckCircleOutlined, SyncOutlined, DollarOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { useToast } from '@solverminds/shared-ui/hooks';
import { userModulesApi } from '../api/user-modules.api';
import type { PaymentHistoryRecord } from '../types/user-modules.types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export function PaymentHistoryView() {
  const { token } = theme.useToken();
  const toast = useToast();
  const [payments, setPayments] = useState<PaymentHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userModulesApi
      .getPaymentHistory()
      .then((data) => setPayments(data))
      .catch(() => toast.error('Failed to load payment transaction history'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleDownloadReceipt = (rec: PaymentHistoryRecord) => {
    toast.info(`Downloading PDF payment receipt for ${rec.paymentRefNo}...`);
  };

  const columnDefs: DataViewColumn<PaymentHistoryRecord>[] = [
    {
      headerName: 'Payment Reference',
      field: 'paymentRefNo',
      sortable: true,
      cellRenderer: (params: { value?: string }) => (
        <Space>
          <CreditCardOutlined style={{ color: token.colorPrimary }} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: 'Invoice No / BL No',
      field: 'invoiceNo',
      sortable: true,
      valueGetter: (params: { data?: PaymentHistoryRecord }) =>
        params.data ? `${params.data.invoiceNo} (${params.data.blNumber})` : '',
    },
    {
      headerName: 'Payment Gateway',
      field: 'gateway',
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const gw = params.value || '';
        const colorMap: Record<string, string> = {
          STRIPE: 'purple',
          NGENIUS: 'cyan',
          BANK_TRANSFER: 'blue',
        };
        return <Tag color={colorMap[gw] || 'default'}>{gw}</Tag>;
      },
    },
    {
      headerName: 'Amount Paid',
      field: 'amount',
      sortable: true,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => (
        <strong style={{ color: token.colorSuccess, fontSize: 14 }}>
          ${params.data?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {params.data?.currency}
        </strong>
      ),
    },
    {
      headerName: 'Payment Date',
      field: 'paymentDate',
      sortable: true,
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const st = params.value || '';
        const color = st === 'SUCCESSFUL' ? 'green' : st === 'PENDING' ? 'gold' : 'red';
        return <Tag color={color}>{st}</Tag>;
      },
    },
    {
      headerName: 'Receipt',
      field: 'id',
      sortable: false,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        return rec.status === 'SUCCESSFUL' ? (
          <AppButton
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReceipt(rec)}
          >
            PDF Receipt
          </AppButton>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Pending Approval</Text>
        );
      },
    },
  ];

  const totalPaidUSD = payments
    .filter((p) => p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = payments.filter((p) => p.status === 'SUCCESSFUL').length;

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <CreditCardOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Payment Transaction History & Invoice Receipts
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Review Stripe / NGenius online payment history, invoice settlements, and official PDF receipts
          </Text>
        </div>

        <RangePicker size="large" style={{ width: 280 }} />
      </div>

      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic
              title="Total Settled Payments"
              value={totalPaidUSD}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic
              title="Successful Transactions"
              value={successfulCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Total Transaction Records" value={payments.length} />
          </Card>
        </Col>
      </Row>

      {/* AG Grid DataView */}
      <DataView
        style={{ height: 480 }}
        columnDefs={columnDefs}
        rowData={payments}
        loading={loading}
        allowedViewModes={['list']}
        listOptions={{
          gridOptions: {
            domLayout: 'autoHeight',
          },
        }}
      />
    </Card>
  );
}
