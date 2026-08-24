// Created by Antigravity (2026-08-24 12:05)
import { SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton, FormDatePicker, FormInput, FormSelect } from '@solverminds/shared-ui';
import { ListView } from '@solverminds/shared-ui/data-view/list-view';
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Card, Col, Flex, Form, Row, Space, Table, Typography, theme } from 'antd';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';



import { searchVgmReference, submitVgm } from './api/vgm.api';

const { Title, Text } = Typography;

const searchSchema = z.object({
  submissionBy: z.enum(['bookno', 'blno']),
  referenceNo: z.string().min(1, 'Reference No is required')
});

const vgmFormSchema = z.object({
  companyName: z.string().optional(),
  orderNo: z.string().optional(),
  addr1: z.string().optional(),
  addr2: z.string().optional(),
  obtainDate: z.string().min(1, 'Obtained Date is required'),
  obtainMethod: z.enum(['SM1', 'SM2']),
  authPerson: z.string().min(1, 'Authorized Person is required'),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  zipcode: z.string().optional(),
  fax: z.string().optional(),
  sendEmailId: z.string().email('Valid Email is required'),
  containers: z.array(z.object({
    containerNo: z.string(),
    eqpType: z.string(),
    tareWeight: z.number(),
    vgmWeight: z.coerce.number().min(1),
    vgmUnit: z.enum(['K', 'T']),
    method: z.enum(['SM1', 'SM2']),
    date: z.string().min(1, 'Date required')
  })).min(1, 'At least one container is required')
});

type SearchValues = z.infer<typeof searchSchema>;
type VgmFormValues = z.infer<typeof vgmFormSchema>;

export function VgmDashboardRoute() {
  const { token } = theme.useToken();
  const toast = useToast();
  const [activeReference, setActiveReference] = useState<{ type: 'bookno' | 'blno', refNo: string } | null>(null);

  const searchForm = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { submissionBy: 'bookno', referenceNo: '' }
  });

  const { data: vgmData, isLoading: isSearching, isError, error } = useQuery({
    queryKey: ['vgm-search', activeReference?.type, activeReference?.refNo],
    queryFn: () => searchVgmReference(activeReference!.type, activeReference!.refNo),
    enabled: !!activeReference,
  });

  const formValues = useMemo(() => {
    if (!vgmData?.data) return undefined;
    return {
      companyName: vgmData.data.companyName || '',
      orderNo: vgmData.data.orderNo || '',
      addr1: vgmData.data.addr1 || '',
      addr2: vgmData.data.addr2 || '',
      obtainDate: vgmData.data.obtainDate || DateTime.utc().toISO() || '',
      obtainMethod: vgmData.data.obtainMethod || 'SM1',
      authPerson: vgmData.data.authPerson || '',
      country: vgmData.data.country || '',
      city: vgmData.data.city || '',
      phone: vgmData.data.phone || '',
      email: vgmData.data.email || '',
      zipcode: vgmData.data.zipcode || '',
      fax: vgmData.data.fax || '',
      sendEmailId: '',
      containers: vgmData.data.containers.map(c => ({
        containerNo: c.containerNo,
        eqpType: c.eqpType,
        tareWeight: c.tareWeight,
        vgmWeight: c.vgmWeight || 0,
        vgmUnit: c.vgmUnit || 'K',
        method: c.method || 'SM1',
        date: c.date || DateTime.utc().toISO() || ''
      }))
    };
  }, [vgmData?.data]);

  const vgmForm = useForm<VgmFormValues>({
    resolver: zodResolver(vgmFormSchema) as any,
    values: formValues,
    defaultValues: {
      obtainMethod: 'SM1',
      containers: []
    }
  });

  const { fields } = useFieldArray({
    control: vgmForm.control,
    name: 'containers'
  });



  const { mutateAsync: doSubmit, isPending: isSubmitting } = useMutation({
    mutationFn: submitVgm,
    onSuccess: (res) => {
      toast.success(res.data.message);
      setActiveReference(null);
      searchForm.reset();
      vgmForm.reset();
    },
    onError: (error: any) => toast.error(error?.error?.message || error?.message || 'An error occurred during submission')
  });

  const handleSearch = (values: SearchValues) => {
    setActiveReference({ type: values.submissionBy, refNo: values.referenceNo });
  };

  // Handle search errors
  useEffect(() => {
    if (isError && error) {
      toast.error((error as any)?.error?.message || (error as any)?.message || 'Reference not found');
      setActiveReference(null);
    }
  }, [isError, error, toast]);

  const onSubmitVgm = (values: VgmFormValues) => {
    if (!activeReference) return;
    doSubmit({
      type: activeReference.type,
      referenceNo: activeReference.refNo,
      partyDetails: values,
      containers: values.containers,
      sendEmailId: values.sendEmailId
    });
  };

  const reqLabel = (label: string) => (
    <span>
      {label} <span style={{ color: token.colorError }}>*</span>
    </span>
  );

  const columns: any[] = useMemo(() => [
    { dataIndex: 'containerNo', title: 'Container No', width: 160 },
    { dataIndex: 'eqpType', title: 'Type', width: 100 },
    { dataIndex: 'tareWeight', title: 'Tare Wt.', width: 120 },
    {
      dataIndex: 'vgmWeight',
      title: reqLabel('VGM Weight'),
      render: (_: any, record: any, index: number) => (
        <div style={{ marginTop: token.marginXS }}>
          <FormInput control={vgmForm.control as any} name={`containers.${index}.vgmWeight`} />
        </div>
      )
    },
    {
      dataIndex: 'vgmUnit',
      title: reqLabel('Unit'),
      width: 120,
      render: (_: any, record: any, index: number) => (
        <div style={{ marginTop: token.marginXS }}>
          <FormSelect
            control={vgmForm.control}
            name={`containers.${index}.vgmUnit`}
            options={[{ label: 'Kgs', value: 'K' }, { label: 'Tons', value: 'T' }]}
          />
        </div>
      )
    },
    {
      dataIndex: 'method',
      title: reqLabel('Method'),
      width: 120,
      render: (_: any, record: any, index: number) => (
        <div style={{ marginTop: token.marginXS }}>
          <FormSelect
            control={vgmForm.control}
            name={`containers.${index}.method`}
            options={[{ label: 'SM1', value: 'SM1' }, { label: 'SM2', value: 'SM2' }]}
          />
        </div>
      )
    },
    {
      dataIndex: 'date',
      title: reqLabel('Obtained Date'),
      width: 160,
      render: (_: any, record: any, index: number) => (
        <div style={{ marginTop: token.marginXS }}>
          <FormDatePicker control={vgmForm.control as any} name={`containers.${index}.date`} />
        </div>
      )
    }
  ], [vgmForm.control, token.marginXS]);

  return (
    <Card
      style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' } }}
    >
      {/* Sticky Header with Search */}
      <div style={{ padding: '20px 24px 0 24px', flexShrink: 0, borderBottom: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
          <Space align="center" size={10} style={{ marginTop: 4 }}>
            <SafetyCertificateOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              VERIFIED GROSS MASS (VGM)
            </Title>
          </Space>

          <Form component="form" layout="inline" onFinish={searchForm.handleSubmit(handleSearch)}>
            <Space align="start" size={24} wrap>
              <FormSelect
                control={searchForm.control}
                name="submissionBy"
                label={reqLabel('Submission By')}
                options={[
                  { label: 'Booking No.', value: 'bookno' },
                  { label: 'B/L No.', value: 'blno' }
                ]}
              />
              <FormInput
                control={searchForm.control}
                name="referenceNo"
                label={reqLabel('Reference Number')}
                placeholder="e.g. BKG-123456"
              />
              <AppButton type="primary" htmlType="submit" icon={<SearchOutlined />} loading={isSearching}>
                Search
              </AppButton>
            </Space>
          </Form>
        </Flex>
      </div>

      {/* Main Content Area */}
      {vgmData?.data && (
        <form onSubmit={vgmForm.handleSubmit(onSubmitVgm as any)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: token.colorBgLayout }}>
            <Flex vertical gap={24}>

              {/* Read Only Details */}
              <Card title="Booking / B/L Details" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Row gutter={[24, 24]}>
                  <Col span={8}><Text type="secondary">A/P Name</Text><br /><Text strong>{vgmData.data.referenceDetails.apName}</Text></Col>
                  <Col span={8}><Text type="secondary">Shipper Name</Text><br /><Text strong>{vgmData.data.referenceDetails.shipperName}</Text></Col>
                  <Col span={8}><Text type="secondary">Origin</Text><br /><Text strong>{vgmData.data.referenceDetails.origin}</Text></Col>
                  <Col span={8}><Text type="secondary">Destination</Text><br /><Text strong>{vgmData.data.referenceDetails.delivery}</Text></Col>
                  <Col span={8}><Text type="secondary">VGM POL</Text><br /><Text strong>{vgmData.data.referenceDetails.pol}</Text></Col>
                  <Col span={8}><Text type="secondary">VGM POD</Text><br /><Text strong>{vgmData.data.referenceDetails.pod}</Text></Col>
                </Row>
              </Card>

              {/* Party Details Form */}
              <Card title="Declaration Details" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Row gutter={24}>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="companyName" label="Company Name" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="orderNo" label="Reference / Order No" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="addr1" label="Address 1" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="addr2" label="Address 2" /></Col>

                  <Col xs={24} md={6}><FormDatePicker control={vgmForm.control as any} name="obtainDate" label={reqLabel('Obtained Date')} /></Col>
                  <Col xs={24} md={6}><FormSelect control={vgmForm.control as any} name="obtainMethod" label={reqLabel('Obtained Method')} options={[{ label: 'SM1', value: 'SM1' }, { label: 'SM2', value: 'SM2' }]} /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="authPerson" label={reqLabel('Authorized Person')} /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="country" label="Country" /></Col>

                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="city" label="City" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="zipcode" label="Zip Code" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="phone" label="Telephone" /></Col>
                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="fax" label="Fax" /></Col>

                  <Col xs={24} md={6}><FormInput control={vgmForm.control as any} name="email" label="Email" /></Col>
                </Row>
              </Card>

              {/* Container List */}
              <Card title="Containers" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                <Table
                  dataSource={fields}
                  columns={columns}
                  pagination={false}
                  scroll={{ y: 300, x: 'max-content' }}
                  rowKey="id"
                  size="small"
                />
              </Card>

              {/* Additional Form Info */}
              <Card title="Additional Information" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Row gutter={32} align="stretch">
                  <Col xs={24} md={10}>
                    <FormInput control={vgmForm.control as any} name="sendEmailId" label={reqLabel('Acknowledgement Email ID')} placeholder="Comma separated for multiple emails" />
                  </Col>
                  <Col xs={24} md={14}>
                    <Alert
                      message="VGM Weighing Methods"
                      description={
                        <ul style={{ paddingLeft: 16, margin: 0, marginTop: 4, fontSize: 13 }}>
                          <li style={{ marginBottom: 4 }}><strong>Method 1:</strong> Upon the conclusion of packing and sealing a container, the shipper may weigh the packed container.</li>
                          <li><strong>Method 2:</strong> The shipper may weigh all packages and cargo items, including the mass of pallets, dunnage, and other securing material.</li>
                        </ul>
                      }
                      type="info"
                      showIcon
                      style={{ height: '100%', border: `1px solid ${token.colorInfoBorder}` }}
                    />
                  </Col>
                </Row>
              </Card>
            </Flex>
          </div>

          {/* Sticky Footer */}
          <div
            style={{
              padding: '16px 24px',
              background: token.colorBgContainer,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
              zIndex: 10
            }}
          >
            <AppButton onClick={() => { setActiveReference(null); searchForm.reset(); vgmForm.reset(); }}>
              Cancel
            </AppButton>
            <AppButton type="primary" htmlType="submit" loading={isSubmitting}>
              Save
            </AppButton>
          </div>
        </form>
      )}
    </Card>
  );
}
