// Modified by Sekar Nagarajan (2026-08-31 11:25)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Form, Input, Row, Tabs, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  TrackingSearchParams,
  TrackingSearchType,
} from "../types/tracking.types";

const { Text } = Typography;

interface TrackingSearchFilterProps {
  onSearch: (params: TrackingSearchParams) => void;
  isLoading?: boolean;
  initialValue?: string;
}

function SearchActionsLabel() {
  return <span className="tracking-search-actions-label">&nbsp;</span>;
}

export function TrackingSearchFilter({
  onSearch,
  isLoading,
  initialValue = "SMLU8829102",
}: TrackingSearchFilterProps) {
  const [form] = Form.useForm();
  const searchType: TrackingSearchType =
    Form.useWatch("searchType", form) || "CONTAINER";

  const handleFinish = (values: {
    searchType: TrackingSearchType;
    searchValue: string;
  }) => {
    onSearch({
      searchType: values.searchType || "CONTAINER",
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
    <Card type="inner" className="tracking-search-panel">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          searchType: "CONTAINER",
          searchValue: initialValue,
        }}
        onFinish={handleFinish}
      >
        <div className="tracking-search-toolbar">
          <Form.Item name="searchType" className="tracking-search-type" hidden>
            <input type="hidden" />
          </Form.Item>
          <Tabs
            activeKey={searchType}
            onChange={(key) =>
              form.setFieldValue("searchType", key as TrackingSearchType)
            }
            className="tracking-search-tabs"
            items={[
              {
                key: "CONTAINER",
                label: <span className="tracking-tab-label">Container No</span>,
              },
              {
                key: "BOOKING",
                label: <span className="tracking-tab-label">Booking No</span>,
              },
              {
                key: "BL",
                label: (
                  <span className="tracking-tab-label">
                    Bill of Lading (BL)
                  </span>
                ),
              },
            ]}
          />

          {/* <Space size={8} align="center" className="tracking-search-samples">
            <Text type="secondary" className="tracking-search-samples__label">
              Quick Samples:
            </Text>
            <Tag
              color="blue"
              className="tracking-search-sample"
              onClick={() => handleQuickSelect("SMLU8829102")}
            >
              SMLU8829102
            </Tag>
            <Tag
              color="cyan"
              className="tracking-search-sample"
              onClick={() => handleQuickSelect("BKG-2026-9901")}
            >
              BKG-2026-9901
            </Tag>
          </Space> */}
        </div>

        <Row gutter={[16, 16]} align="top">
          <Col xs={24} md={18} lg={19}>
            <Form.Item
              name="searchValue"
              className="tracking-search-field"
              label={
                <span className="form-field-label">
                  Enter Container, Booking or BL Reference Numbers{" "}
                  <Text type="danger">*</Text>
                </span>
              }
              rules={[
                { required: true, message: "Please enter reference number(s)" },
              ]}
            >
              <Input
                size="large"
                allowClear
                placeholder="e.g. SMLU8829102, MSKU9012845, BKG-2026-9901"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6} lg={4}>
            <Form.Item
              label={<SearchActionsLabel />}
              className="tracking-search-actions-field"
            >
              <div className="tracking-search-actions">
                <AppButton
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<AppIcon icon={Icons.ship} size={16} />}
                >
                  Search
                </AppButton>
                <AppButton
                  danger
                  size="large"
                  icon={
                    <AppIcon icon={Icons.refreshCw} size={16} tone="reject" />
                  }
                  onClick={handleReset}
                >
                  Reset
                </AppButton>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
