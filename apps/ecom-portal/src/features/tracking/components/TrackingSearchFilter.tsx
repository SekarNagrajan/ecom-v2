// Modified by Sekar Nagarajan (2026-09-18 10:45)
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
  onSearchTypeChange: (searchType: TrackingSearchType) => void;
  onReset: () => void;
  isLoading?: boolean;
  searchType: TrackingSearchType;
  searchValue?: string;
}

function SearchActionsLabel() {
  return <span className="tracking-search-actions-label">&nbsp;</span>;
}

function fieldLabel(searchType: TrackingSearchType): string {
  switch (searchType) {
    case "BOOKING":
      return "Booking No";
    case "BL":
      return "Bill of Lading (BL) No";
    case "CONTAINER":
      return "Container No";
    default: {
      const _exhaustive: never = searchType;
      return _exhaustive;
    }
  }
}

function fieldPlaceholder(searchType: TrackingSearchType): string {
  switch (searchType) {
    case "BOOKING":
      return "e.g. BKG-2026-9901";
    case "BL":
      return "e.g. BL-SHA-88401";
    case "CONTAINER":
      return "e.g. SMLU8829102";
    default: {
      const _exhaustive: never = searchType;
      return _exhaustive;
    }
  }
}

export function TrackingSearchFilter({
  onSearch,
  onSearchTypeChange,
  onReset,
  isLoading,
  searchType,
  searchValue = "",
}: TrackingSearchFilterProps) {
  const handleFinish = (values: { searchValue: string }) => {
    onSearch({
      searchType,
      searchValue: values.searchValue,
    });
  };

  const handleTabChange = (key: string) => {
    onSearchTypeChange(key as TrackingSearchType);
  };

  return (
    <Card type="inner" className="tracking-search-panel">
      <Form
        key={`${searchType}:${searchValue}`}
        layout="vertical"
        requiredMark={false}
        initialValues={{ searchValue }}
        onFinish={handleFinish}
      >
        <div className="tracking-search-toolbar">
          <Tabs
            activeKey={searchType}
            onChange={handleTabChange}
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
        </div>

        <Row gutter={[16, 16]} align="top">
          <Col xs={24} md={18} lg={19}>
            <Form.Item
              name="searchValue"
              className="tracking-search-field"
              label={
                <span className="form-field-label">
                  {fieldLabel(searchType)} <Text type="danger">*</Text>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: `Please enter ${fieldLabel(searchType).toLowerCase()}`,
                },
              ]}
            >
              <Input
                size="large"
                allowClear
                placeholder={fieldPlaceholder(searchType)}
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
                  onClick={onReset}
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
