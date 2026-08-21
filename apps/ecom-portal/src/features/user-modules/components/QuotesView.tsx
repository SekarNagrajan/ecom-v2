// Modified by sekar nagarajan (2026-08-21)
import { ArrowRightOutlined, EditOutlined, EyeOutlined, FileTextOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { useToast } from '@solverminds/shared-ui/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Card, Col, DatePicker, Form, Input, Row, Select, Space, Statistic, Tag, theme, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { userModulesApi } from '../api/user-modules.api';
import type { QuoteItem } from '../types/user-modules.types';

const { Title, Text } = Typography;

export function QuotesView() {
  const { token } = theme.useToken();
  const toast = useToast();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    userModulesApi
      .getQuotes()
      .then((data) => setQuotes(data))
      .catch(() => toast.error('Failed to load quotation requests'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleCreateQuote = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const newQuote = await userModulesApi.createQuoteRequest({
        polPort: values.polPort,
        podPort: values.podPort,
        equipmentType: values.equipmentType,
        commodity: values.commodity,
        targetDate: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : '',
        remarks: values.remarks,
      });
      setQuotes((prev) => [newQuote, ...prev]);
      toast.success(`Quotation Request ${newQuote.quoteNo} submitted successfully`);
      setIsDrawerOpen(false);
      form.resetFields();
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  };

  const columnDefs: DataViewColumn<QuoteItem>[] = [
    {
      headerName: 'Actions',
      field: 'id',
      sortable: false,
      width: 120,
      pinned: 'left',
      cellRenderer: (params: { data?: QuoteItem }) => {
        const rec = params.data;
        if (!rec) return null;
        return rec.status === 'QUOTED' ? (
          <Tooltip title="Convert Quote into e-Booking">
            <AppButton
              type="primary"
              size="small"
              icon={<ArrowRightOutlined style={{ fontSize: 14 }} />}
              onClick={() => {
                toast.info(`Converting Quote ${rec.quoteNo} into e-Booking...`);
                navigate({ to: '/schedules' });
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
              icon={<EyeOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
              onClick={() => toast.info(`Quote Reference: ${rec.quoteNo}`)}
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: 'Quote Reference',
      field: 'quoteNo',
      sortable: true,
      cellRenderer: (params: { value?: string }) => (
        <Space>
          <FileTextOutlined style={{ color: token.colorPrimary }} />
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: 'Route (POL → POD)',
      field: 'polCode',
      sortable: false,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.polCode} → ${params.data.podCode}` : '',
    },
    {
      headerName: 'Equipment & Commodity',
      field: 'equipmentType',
      sortable: true,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.equipmentType} (${params.data.commodity})` : '',
    },
    {
      headerName: 'Quoted Amount',
      field: 'totalAmountUSD',
      sortable: true,
      cellRenderer: (params: { value?: number }) => (
        <strong style={{ color: token.colorPrimary, fontSize: 14 }}>
          ${params.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
        </strong>
      ),
    },
    {
      headerName: 'Validity Period',
      field: 'validTo',
      sortable: true,
      valueGetter: (params: { data?: QuoteItem }) =>
        params.data ? `${params.data.validFrom} to ${params.data.validTo}` : '',
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      cellRenderer: (params: { value?: string }) => {
        const st = params.value || '';
        const colorMap: Record<string, string> = {
          QUOTED: 'blue',
          ACCEPTED: 'green',
          PENDING_REVIEW: 'gold',
          EXPIRED: 'red',
        };
        return <Tag color={colorMap[st] || 'default'}>{st}</Tag>;
      },
    },
  ];

  const activeCount = quotes.filter((q) => q.status === 'QUOTED').length;
  const acceptedCount = quotes.filter((q) => q.status === 'ACCEPTED').length;

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <EditOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Rate Request & Quotation Management (Quote)
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Request instant ocean freight quotations, view active tariff quotes, and book containers directly
          </Text>
        </div>

        <AppButton
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Request New Rate Quote
        </AppButton>
      </div>

      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Active Quoted Offers" value={activeCount} valueStyle={{ color: token.colorPrimary }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Accepted / Booked Quotes" value={acceptedCount} valueStyle={{ color: token.colorSuccess }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card type="inner" style={{ borderRadius: 12, background: token.colorFillAlter }}>
            <Statistic title="Total RFQ Quotations" value={quotes.length} />
          </Card>
        </Col>
      </Row>

      {/* AG Grid DataView */}
      <DataView
        style={{ height: 480 }}
        columnDefs={columnDefs}
        rowData={quotes}
        loading={loading}
        allowedViewModes={['list']}
        listOptions={{
          gridOptions: {
            domLayout: 'autoHeight',
          },
        }}
      />

      {/* Create Quote Drawer */}
      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width="50%"
        styles={{
          body: { overflowY: 'auto', maxHeight: 'calc(100vh - 105px)', padding: '20px 24px' },
          footer: { display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${token.colorBorderSecondary}`, padding: '8px 20px', background: token.colorBgContainer },
        }}
        title="Submit New Rate Quotation Request (RFQ)"
        mask={{ blur: false }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size={8}>
            <AppButton danger onClick={() => setIsDrawerOpen(false)}>Cancel</AppButton>
            <AppButton type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleCreateQuote}>
              Submit Quote Request
            </AppButton>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={(label, { required }) => (
            <span>
              {label}
              {required && <span style={{ color: token.colorError, marginLeft: 4 }}>*</span>}
            </span>
          )}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Port of Loading (POL)" name="polPort" rules={[{ required: true, message: 'POL is required' }]}>
                <Select
                  placeholder="Select origin port"
                  options={[
                    { value: 'Port of New York (USNYC)', label: 'USNYC - Port of New York' },
                    { value: 'Port of Rotterdam (NLRTM)', label: 'NLRTM - Port of Rotterdam' },
                    { value: 'Hamburg Port (DEHAM)', label: 'DEHAM - Hamburg Port' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Port of Discharge (POD)" name="podPort" rules={[{ required: true, message: 'POD is required' }]}>
                <Select
                  placeholder="Select destination port"
                  options={[
                    { value: 'Port of Singapore (SGSIN)', label: 'SGSIN - Port of Singapore' },
                    { value: 'Shanghai Port (CNSHA)', label: 'CNSHA - Shanghai Port' },
                    { value: 'Jebel Ali (AEJEA)', label: 'AEJEA - Jebel Ali Port' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Equipment Type" name="equipmentType" rules={[{ required: true, message: 'Equipment type is required' }]}>
                <Select
                  placeholder="Select container type"
                  options={[
                    { value: '20ft Standard Container (20GP)', label: '20ft Standard Container (20GP)' },
                    { value: '40ft High Cube Container (40HC)', label: '40ft High Cube Container (40HC)' },
                    { value: '40ft Reefer Container (40RF)', label: '40ft Reefer Container (40RF)' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Commodity Description" name="commodity" rules={[{ required: true, message: 'Commodity is required' }]}>
                <Input placeholder="e.g. General Cargo, Electronics" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Target Departure Date" name="targetDate">
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item label="Additional Shipment Remarks" name="remarks">
            <Input.TextArea rows={4} placeholder="Enter any special handling notes, target rates, or commodity specs..." />
          </Form.Item>
        </Form>
      </AppDrawer>
    </Card>
  );
}
