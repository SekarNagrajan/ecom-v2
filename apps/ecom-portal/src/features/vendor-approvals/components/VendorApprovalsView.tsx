// Modified by Antigravity (2026-08-21)
import React, { useState } from 'react';
import { Card, Tag, Space, Typography, Badge, theme, Row, Col, Statistic, Tooltip } from 'antd';
import { CheckSquareOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { useToast } from '@solverminds/shared-ui/hooks';

const { Title, Text } = Typography;

interface ApprovalItem {
  id: string;
  referenceNo: string;
  customerName: string;
  submittedDate: string;
  type: 'BOOKING' | 'SI' | 'VGM';
  originPort: string;
  destPort: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function VendorApprovalsView() {
  const { token } = theme.useToken();
  const toast = useToast();

  const [items, setItems] = useState<ApprovalItem[]>([
    { id: '1', referenceNo: 'BKG-2026-0991', customerName: 'Apex Logistics Global', submittedDate: '2026-08-21 09:30', type: 'BOOKING', originPort: 'USNYC', destPort: 'SGSIN', status: 'PENDING' },
    { id: '2', referenceNo: 'SI-2026-8812', customerName: 'Atlantic Freight LLC', submittedDate: '2026-08-21 10:15', type: 'SI', originPort: 'NLRTM', destPort: 'CNSHA', status: 'PENDING' },
    { id: '3', referenceNo: 'VGM-2026-4410', customerName: 'Pacific Maritime Corp', submittedDate: '2026-08-21 08:45', type: 'VGM', originPort: 'DEHAM', destPort: 'USNYC', status: 'PENDING' },
    { id: '4', referenceNo: 'BKG-2026-0988', customerName: 'Global Shippers Inc', submittedDate: '2026-08-20 16:20', type: 'BOOKING', originPort: 'SGSIN', destPort: 'AEJEA', status: 'APPROVED' },
  ]);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
    toast.success(`Request ${action === 'APPROVED' ? 'Approved' : 'Declined'} successfully`);
  };

  const columnDefs: DataViewColumn<ApprovalItem>[] = [
    {
      headerName: 'Actions',
      field: 'id',
      sortable: false,
      width: 110,
      pinned: 'left',
      cellRenderer: (params: { data?: ApprovalItem }) => {
        const record = params.data;
        if (!record) return null;
        return record.status === 'PENDING' ? (
          <Space size={4}>
            <Tooltip title="Approve Workflow Request">
              <AppButton
                type="text"
                size="small"
                icon={<CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />}
                onClick={() => handleAction(record.id, 'APPROVED')}
              />
            </Tooltip>
            <Tooltip title="Decline Workflow Request">
              <AppButton
                type="text"
                size="small"
                icon={<CloseCircleOutlined style={{ color: token.colorError, fontSize: 16 }} />}
                onClick={() => handleAction(record.id, 'REJECTED')}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Completed</Text>
        );
      },
    },
    {
      headerName: 'Reference No',
      field: 'referenceNo',
      sortable: true,
      cellRenderer: (params: { value?: string }) => <strong>{params.value}</strong>,
    },
    {
      headerName: 'Submission Type',
      field: 'type',
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const t = params.value || '';
        const colorMap: Record<string, string> = { BOOKING: 'blue', SI: 'purple', VGM: 'green' };
        return <Tag color={colorMap[t] || 'default'}>{t}</Tag>;
      },
    },
    {
      headerName: 'Customer Account',
      field: 'customerName',
      sortable: true,
    },
    {
      headerName: 'Route (POL → POD)',
      field: 'originPort',
      sortable: false,
      valueGetter: (params: { data?: ApprovalItem }) =>
        params.data ? `${params.data.originPort} → ${params.data.destPort}` : '',
    },
    {
      headerName: 'Submission Time',
      field: 'submittedDate',
      sortable: true,
    },
    {
      headerName: 'Approval Status',
      field: 'status',
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const st = params.value || '';
        const color = st === 'APPROVED' ? 'green' : st === 'REJECTED' ? 'red' : 'gold';
        return <Tag color={color}>{st}</Tag>;
      },
    },
  ];

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED').length;

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <CheckSquareOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Agency & Vendor Superuser Approvals
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Review, validate, and process customer e-Bookings, Shipping Instructions (SI), and VGM submissions
          </Text>
        </div>
      </div>

      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Pending Reviews" value={pendingCount} prefix={<Badge status="processing" />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Approved Today" value={approvedCount} valueStyle={{ color: token.colorSuccess }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Total Workflow Items" value={items.length} />
          </Card>
        </Col>
      </Row>

      <DataView
        style={{ height: 480 }}
        columnDefs={columnDefs}
        rowData={items}
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
