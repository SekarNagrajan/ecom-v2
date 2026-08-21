// Schedule Search Filter Component
// Supports Point-to-Point, Vessel Schedule, and Port Schedule tabs with port swap feature
// Mandatory field red asterisk (*) displayed AFTER the label text per agenct.md
// Styled using inner Card container matching UserCreationView layout pattern
// Modified by Antigravity (2026-08-21 18:41)

import {
  CalendarOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, DatePicker, Form, Row, Select, Segmented, Space, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ScheduleSearchParams, ScheduleSearchType } from '../types/schedules.types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const POPULAR_PORTS = [
  { value: 'USNYC', label: 'USNYC - New York, USA' },
  { value: 'SGSIN', label: 'SGSIN - Singapore, Singapore' },
  { value: 'NLRTM', label: 'NLRTM - Rotterdam, Netherlands' },
  { value: 'CNSHA', label: 'CNSHA - Shanghai, China' },
  { value: 'DEHAM', label: 'DEHAM - Hamburg, Germany' },
  { value: 'AEJEA', label: 'AEJEA - Jebel Ali, UAE' },
  { value: 'USLAX', label: 'USLAX - Los Angeles, USA' },
  { value: 'JPTYO', label: 'JPTYO - Tokyo, Japan' },
];

const POPULAR_VESSELS = [
  { value: 'AGEX', label: 'ANTIGRAVITY EXPRESS (AGEX)' },
  { value: 'SMVY', label: 'SOLVERMINDS VOYAGER (SMVY)' },
  { value: 'GLHZ', label: 'GLOBAL HORIZON (GLHZ)' },
  { value: 'OCPN', label: 'OCEAN PIONEER (OCPN)' },
];

interface ScheduleSearchFilterProps {
  onSearch: (params: ScheduleSearchParams) => void;
  isLoading?: boolean;
}

export function ScheduleSearchFilter({ onSearch, isLoading }: ScheduleSearchFilterProps) {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const searchType: ScheduleSearchType = Form.useWatch('searchType', form) || 'POINT_TO_POINT';

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
    const params: ScheduleSearchParams = {
      searchType: values.searchType as ScheduleSearchType,
      polCode: values.polCode as string,
      podCode: values.podCode as string,
      vesselCode: values.vesselCode as string,
      portCode: values.portCode as string,
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
          searchType: 'POINT_TO_POINT',
          polCode: 'USNYC',
          podCode: 'SGSIN',
          dateRange: [dayjs(), dayjs().add(30, 'day')],
        }}
        onFinish={handleFinish}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Form.Item name="searchType" style={{ margin: 0 }}>
            <Segmented
              options={[
                { label: 'Point-to-Point Schedule', value: 'POINT_TO_POINT', icon: <CompassOutlined /> },
                { label: 'Vessel Schedule', value: 'VESSEL_SCHEDULE', icon: <CalendarOutlined /> },
                { label: 'Port Schedule', value: 'PORT_SCHEDULE', icon: <EnvironmentOutlined /> },
              ]}
            />
          </Form.Item>
        </div>

        {searchType === 'POINT_TO_POINT' && (
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={7} lg={7}>
              <Form.Item
                name="polCode"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Origin Port (POL) <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: 'Select origin port' }]}
                style={{ margin: 0 }}
              >
                <Select
                  showSearch
                  placeholder="Select POL"
                  options={POPULAR_PORTS}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={2} lg={1} style={{ textAlign: 'center', marginBottom: 4 }}>
              <AppButton
                type="default"
                shape="circle"
                icon={<SwapOutlined />}
                onClick={handleSwapPorts}
                title="Swap origin and delivery ports"
              />
            </Col>

            <Col xs={24} md={7} lg={7}>
              <Form.Item
                name="podCode"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Delivery Port (POD) <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: 'Select delivery port' }]}
                style={{ margin: 0 }}
              >
                <Select
                  showSearch
                  placeholder="Select POD"
                  options={POPULAR_PORTS}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={5} lg={5}>
              <Form.Item
                name="dateRange"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Departure Date Range
                  </span>
                }
                style={{ margin: 0 }}
              >
                <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} lg={4} style={{ textAlign: 'right' }}>
              <Space style={{ width: '100%' }}>
                <AppButton
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SearchOutlined />}
                  style={{ flex: 1, height: 38 }}
                >
                  Search
                </AppButton>
                <AppButton
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  title="Reset filter fields"
                  style={{ height: 38 }}
                />
              </Space>
            </Col>
          </Row>
        )}

        {searchType === 'VESSEL_SCHEDULE' && (
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={10} lg={10}>
              <Form.Item
                name="vesselCode"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Vessel Name / Code <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: 'Select vessel' }]}
                style={{ margin: 0 }}
              >
                <Select
                  showSearch
                  placeholder="Select Vessel"
                  options={POPULAR_VESSELS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} lg={9}>
              <Form.Item
                name="dateRange"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Voyage Date Range
                  </span>
                }
                style={{ margin: 0 }}
              >
                <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6} lg={5} style={{ textAlign: 'right' }}>
              <Space style={{ width: '100%' }}>
                <AppButton
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SearchOutlined />}
                  style={{ flex: 1, height: 38 }}
                >
                  Find Vessel
                </AppButton>
                <AppButton
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  title="Reset filter fields"
                  style={{ height: 38 }}
                />
              </Space>
            </Col>
          </Row>
        )}

        {searchType === 'PORT_SCHEDULE' && (
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={10} lg={10}>
              <Form.Item
                name="portCode"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Port of Call <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: 'Select port' }]}
                style={{ margin: 0 }}
              >
                <Select
                  showSearch
                  placeholder="Select Port"
                  options={POPULAR_PORTS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} lg={9}>
              <Form.Item
                name="dateRange"
                label={
                  <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                    Arrival / Departure Window
                  </span>
                }
                style={{ margin: 0 }}
              >
                <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6} lg={5} style={{ textAlign: 'right' }}>
              <Space style={{ width: '100%' }}>
                <AppButton
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SearchOutlined />}
                  style={{ flex: 1, height: 38 }}
                >
                  Find Port
                </AppButton>
                <AppButton
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  title="Reset filter fields"
                  style={{ height: 38 }}
                />
              </Space>
            </Col>
          </Row>
        )}
      </Form>
    </Card>
  );
}
