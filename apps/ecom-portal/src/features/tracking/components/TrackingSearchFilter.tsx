// Modified by Sekar Nagarajan (2026-08-25 19:15)
import { AppButton } from "@solverminds/shared-ui";
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";

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
          <Form.Item name="searchType" className="tracking-search-type">
            <Segmented
              options={[
                {
                  label: "Container No",
                  value: "CONTAINER",
                  icon: <AppIcon icon={Icons.container} size={16} />,
                },
                {
                  label: "Booking No",
                  value: "BOOKING",
                  icon: <AppIcon icon={Icons.tag} size={16} />,
                },
                {
                  label: "Bill of Lading (BL)",
                  value: "BL",
                  icon: <AppIcon icon={Icons.fileText} size={16} />,
                },
              ]}
            />
          </Form.Item>

          <Space size={8} align="center" className="tracking-search-samples">
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
          </Space>
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

          <Col xs={24} md={6} lg={5}>
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
                  icon={<AppIcon icon={Icons.search} size={16} />}
                >
                  Track Cargo
                </AppButton>
                <AppButton
                  size="large"
                  icon={
                    <AppIcon icon={Icons.refreshCw} size={16} tone="primary" />
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
