// Modified by Antigravity (2026-08-21 23:59)
// Rate Search Filter Component — Aligned with ApplicationResource_en.properties
// Required field red asterisk (*) displayed AFTER the label text per agenct.md

import {
  CalendarOutlined,
  CompassOutlined,
  DollarOutlined,
  FileProtectOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, DatePicker, Form, Row, Segmented, Select, Space, theme, Typography } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export type RateSearchMode = 'PUBLISHED_TARIFF' | 'SURCHARGES' | 'SERVICE_CONTRACTS' | 'SPOT_QUOTES';

const POPULAR_PORTS = [
  { value: 'USNYC', label: 'USNYC - New York, USA' },
  { value: 'SGSIN', label: 'SGSIN - Singapore, Singapore' },
  { value: 'NLRTM', label: 'NLRTM - Rotterdam, Netherlands' },
  { value: 'CNSHA', label: 'CNSHA - Shanghai, China' },
  { value: 'DEHAM', label: 'DEHAM - Hamburg, Germany' },
  { value: 'INNSA', label: 'INNSA - Nhava Sheva, India' },
  { value: 'AEDXB', label: 'AEDXB - Jebel Ali, UAE' },
];

const EQUIPMENT_TYPES = [
  { value: 'ALL', label: 'All Equipment Types' },
  { value: "20' Standard Dry", label: "20' Standard Dry (20DV)" },
  { value: "40' High Cube Dry", label: "40' High Cube Dry (40HC)" },
  { value: "40' Reefer Container", label: "40' Reefer Container (40RF)" },
];

const COMMODITIES = [
  { value: 'ALL', label: 'All Commodities' },
  { value: 'GEN-CGO', label: 'GEN-CGO - General Freight / Merchandise' },
  { value: 'AUTO-PARTS', label: 'AUTO-PARTS - Automotive Spare Parts & Machinery' },
  { value: 'PERISHABLE', label: 'PERISHABLE - Chilled Agricultural Produce' },
  { value: 'TEXTILES', label: 'TEXTILES - Textiles & Garments' },
];

export interface RateSearchParams {
  searchMode: RateSearchMode;
  polCode?: string;
  podCode?: string;
  eqpType?: string;
  commodity?: string;
  fromDate?: string;
  toDate?: string;
}

interface RateSearchFilterProps {
  onSearch: (params: RateSearchParams) => void;
  isLoading?: boolean;
}

export function RateSearchFilter({ onSearch, isLoading }: RateSearchFilterProps) {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const searchMode: RateSearchMode = Form.useWatch('searchMode', form) || 'PUBLISHED_TARIFF';

  const handleSwapPorts = () => {
    const pol = form.getFieldValue('polCode');
    const pod = form.getFieldValue('podCode');
    form.setFieldsValue({
      polCode: pod,
      podCode: pol,
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const dateRange = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    const params: RateSearchParams = {
      searchMode: values.searchMode as RateSearchMode,
      polCode: values.polCode as string,
      podCode: values.podCode as string,
      eqpType: values.eqpType as string,
      commodity: values.commodity as string,
      fromDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
      toDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
    };
    onSearch(params);
  };

  return (
    <Card
      type="inner"
      style={{
        borderRadius: 12,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        marginBottom: 20,
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          searchMode: 'PUBLISHED_TARIFF',
          polCode: 'USNYC',
          podCode: 'SGSIN',
          eqpType: "40' High Cube Dry",
          commodity: 'GEN-CGO',
          dateRange: [dayjs(), dayjs().add(90, 'day')],
        }}
        onFinish={handleFinish}
      >
        {/* Mode Selector Segmented Control */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <Form.Item name="searchMode" style={{ margin: 0 }}>
            <Segmented
              options={[
                { label: 'Published Tariff', value: 'PUBLISHED_TARIFF', icon: <DollarOutlined /> },
                { label: 'Surcharge', value: 'SURCHARGES', icon: <TagOutlined /> },
                { label: 'Service Contract', value: 'SERVICE_CONTRACTS', icon: <FileProtectOutlined /> },
                { label: 'Request for Quote', value: 'SPOT_QUOTES', icon: <ThunderboltOutlined /> },
              ]}
            />
          </Form.Item>
        </div>

        {/* Filter Inputs Row */}
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="polCode"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  Port of Load <Text type="danger">*</Text>
                </span>
              }
              rules={[{ required: true, message: 'Select Port of Load' }]}
              style={{ margin: 0 }}
            >
              <Select
                showSearch
                placeholder="Select Port of Load"
                options={POPULAR_PORTS}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={4} md={1} style={{ textAlign: 'center', marginBottom: 4 }}>
            <AppButton
              type="default"
              shape="circle"
              icon={<SwapOutlined />}
              onClick={handleSwapPorts}
              title="Swap Port of Load and Port of Discharge"
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="podCode"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  Port of Discharge <Text type="danger">*</Text>
                </span>
              }
              rules={[{ required: true, message: 'Select Port of Discharge' }]}
              style={{ margin: 0 }}
            >
              <Select
                showSearch
                placeholder="Select Port of Discharge"
                options={POPULAR_PORTS}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Form.Item
              name="eqpType"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  Eqp Type
                </span>
              }
              style={{ margin: 0 }}
            >
              <Select options={EQUIPMENT_TYPES} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="commodity"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  Commodity
                </span>
              }
              style={{ margin: 0 }}
            >
              <Select options={COMMODITIES} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={16} md={6}>
            <Form.Item
              name="dateRange"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  From Date / To Date
                </span>
              }
              style={{ margin: 0 }}
            >
              <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <AppButton icon={<ReloadOutlined />} onClick={handleReset}>
            Reset Filters
          </AppButton>
          <AppButton type="primary" icon={<SearchOutlined />} loading={isLoading} htmlType="submit">
            Search Rates
          </AppButton>
        </div>
      </Form>
    </Card>
  );
}
