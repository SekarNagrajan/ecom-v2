// Container & Cargo Tracking Search Filter Component
// Parity with Tracking.jsp search form layout
// Mandatory field red asterisk (*) displayed AFTER the label text per agenct.md
// Modified by Antigravity (2026-08-21 18:40)

import {
  BarcodeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Form, Input, Row, Segmented, Space, Tag, theme, Typography } from 'antd';
import type { TrackingSearchParams, TrackingSearchType } from '../types/tracking.types';

const { Text } = Typography;

interface TrackingSearchFilterProps {
  onSearch: (params: TrackingSearchParams) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function TrackingSearchFilter({ onSearch, isLoading, initialValue = 'SMLU8829102' }: TrackingSearchFilterProps) {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const handleFinish = (values: { searchType: TrackingSearchType; searchValue: string }) => {
    onSearch({
      searchType: values.searchType || 'CONTAINER',
      searchValue: values.searchValue,
    });
  };

  const handleQuickSelect = (value: string) => {
    form.setFieldsValue({ searchValue: value });
    form.submit();
  };

  const handleReset = () => {
    form.resetFields();
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
          searchType: 'CONTAINER',
          searchValue: initialValue,
        }}
        onFinish={handleFinish}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Form.Item name="searchType" style={{ margin: 0 }}>
            <Segmented
              options={[
                { label: 'Container No', value: 'CONTAINER', icon: <BarcodeOutlined /> },
                { label: 'Booking No', value: 'BOOKING', icon: <TagOutlined /> },
                { label: 'Bill of Lading (BL)', value: 'BL', icon: <FileTextOutlined /> },
              ]}
            />
          </Form.Item>

          <Space size={8} align="center">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quick Samples:
            </Text>
            <Tag
              color="blue"
              style={{ cursor: 'pointer', borderRadius: 10 }}
              onClick={() => handleQuickSelect('SMLU8829102')}
            >
              SMLU8829102
            </Tag>
            <Tag
              color="cyan"
              style={{ cursor: 'pointer', borderRadius: 10 }}
              onClick={() => handleQuickSelect('BKG-2026-9901')}
            >
              BKG-2026-9901
            </Tag>
          </Space>
        </div>

        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={18} lg={19}>
            <Form.Item
              name="searchValue"
              label={
                <span style={{ fontWeight: 600, fontSize: 13, color: token.colorTextSecondary }}>
                  Enter Container, Booking or BL Reference Numbers <Text type="danger">*</Text>
                </span>
              }
              rules={[{ required: true, message: 'Please enter reference number(s)' }]}
              style={{ margin: 0 }}
            >
              <Input.TextArea
                rows={1}
                placeholder="e.g. SMLU8829102, MSKU9012845, BKG-2026-9901"
                style={{ borderRadius: 8, fontSize: 14 }}
              />
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
                Track Cargo
              </AppButton>
              <AppButton
                icon={<ReloadOutlined />}
                onClick={handleReset}
                title="Reset search fields"
                style={{ height: 38 }}
              />
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
