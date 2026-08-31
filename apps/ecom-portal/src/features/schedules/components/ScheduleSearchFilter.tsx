// Modified by Sekar Nagarajan (2026-08-31 11:25)
import { AppButton } from "@solverminds/shared-ui";
import { Col, DatePicker, Form, Row, Select, Tabs, Typography } from "antd";
import dayjs from "dayjs";
import { AppIcon, Icons } from "../../../components/icons";

import type {
  ScheduleSearchParams,
  ScheduleSearchType,
} from "../types/schedules.types";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const POPULAR_PORTS = [
  { value: "USNYC", label: "USNYC - New York, USA" },
  { value: "SGSIN", label: "SGSIN - Singapore, Singapore" },
  { value: "NLRTM", label: "NLRTM - Rotterdam, Netherlands" },
  { value: "CNSHA", label: "CNSHA - Shanghai, China" },
  { value: "DEHAM", label: "DEHAM - Hamburg, Germany" },
  { value: "AEJEA", label: "AEJEA - Jebel Ali, UAE" },
  { value: "USLAX", label: "USLAX - Los Angeles, USA" },
  { value: "JPTYO", label: "JPTYO - Tokyo, Japan" },
];

const POPULAR_VESSELS = [
  { value: "AGEX", label: "ANTIGRAVITY EXPRESS (AGEX)" },
  { value: "SMVY", label: "SOLVERMINDS VOYAGER (SMVY)" },
  { value: "GLHZ", label: "GLOBAL HORIZON (GLHZ)" },
  { value: "OCPN", label: "OCEAN PIONEER (OCPN)" },
];

interface ScheduleSearchFilterProps {
  onSearch: (params: ScheduleSearchParams) => void;
  isLoading?: boolean;
}

function SearchActionsLabel() {
  return <span className="schedule-search-actions-label">&nbsp;</span>;
}

function SearchActionsField({
  isLoading,
  onReset,
}: {
  isLoading?: boolean;
  onReset: () => void;
}) {
  return (
    <Form.Item
      label={<SearchActionsLabel />}
      className="schedule-search-actions-field"
    >
      <div className="schedule-search-actions">
        <AppButton
          type="primary"
          size="large"
          htmlType="submit"
          loading={isLoading}
          icon={<AppIcon icon={Icons.search} size={16} />}
        >
          Search Schedules
        </AppButton>
        <AppButton
          size="large"
          icon={<AppIcon icon={Icons.refreshCw} size={16} />}
          onClick={onReset}
          aria-label="Reset search filters"
        >
          Reset
        </AppButton>
      </div>
    </Form.Item>
  );
}

export function ScheduleSearchFilter({
  onSearch,
  isLoading,
}: ScheduleSearchFilterProps) {
  const [form] = Form.useForm();
  const searchType: ScheduleSearchType =
    Form.useWatch("searchType", form) || "POINT_TO_POINT";

  const handleSwapPorts = () => {
    const pol = form.getFieldValue("polCode");
    const pod = form.getFieldValue("podCode");
    form.setFieldsValue({ polCode: pod, podCode: pol });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const dateRange = values.dateRange as
      | [dayjs.Dayjs, dayjs.Dayjs]
      | undefined;
    onSearch({
      searchType: values.searchType as ScheduleSearchType,
      polCode: values.polCode as string,
      podCode: values.podCode as string,
      vesselCode: values.vesselCode as string,
      portCode: values.portCode as string,
      fromDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
      toDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
    });
  };

  return (
    <div className="schedule-search-panel">
      {/* <div className="schedule-search-panel__header">
        <span className="schedule-search-panel__header-icon app-icon-inherit primary-surface">
          <AppIcon icon={Icons.search} size={20} />
        </span>
        <div>
          <Text className="schedule-search-panel__header-title">
            Find Your Sailing
          </Text>
          <Text className="schedule-search-panel__header-subtitle">
            Search by route, vessel, or port to view available departures
          </Text>
        </div>
      </div> */}

      <div className="schedule-search-panel__body">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            searchType: "POINT_TO_POINT",
            polCode: "USNYC",
            podCode: "SGSIN",
            dateRange: [dayjs(), dayjs().add(30, "day")],
          }}
          onFinish={handleFinish}
        >
          <div className="schedule-search-type-wrap">
            <Form.Item
              name="searchType"
              className="schedule-search-type"
              hidden
            >
              <input type="hidden" />
            </Form.Item>
            <Tabs
              activeKey={searchType}
              onChange={(key) =>
                form.setFieldValue("searchType", key as ScheduleSearchType)
              }
              className="schedule-search-tabs"
              items={[
                {
                  key: "POINT_TO_POINT",
                  label: (
                    <span className="schedule-tab-label">Point to Point</span>
                  ),
                },
                {
                  key: "VESSEL_SCHEDULE",
                  label: <span className="schedule-tab-label">By Vessel</span>,
                },
                {
                  key: "PORT_SCHEDULE",
                  label: <span className="schedule-tab-label">By Port</span>,
                },
              ]}
            />
          </div>

          {searchType === "POINT_TO_POINT" && (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={11} lg={6}>
                <Form.Item
                  name="polCode"
                  label={
                    <span className="form-field-label">
                      Origin Port (POL) <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: "Select origin port" }]}
                >
                  <Select
                    size="large"
                    showSearch
                    placeholder="Where are you shipping from?"
                    options={POPULAR_PORTS}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={2} lg={1}>
                <Form.Item
                  label={<SearchActionsLabel />}
                  className="schedule-search-actions-field schedule-port-swap-field"
                >
                  <AppButton
                    type="default"
                    size="large"
                    shape="circle"
                    icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                    onClick={handleSwapPorts}
                    aria-label="Swap origin and delivery ports"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={11} lg={5}>
                <Form.Item
                  name="podCode"
                  label={
                    <span className="form-field-label">
                      Delivery Port (POD) <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: "Select delivery port" }]}
                >
                  <Select
                    size="large"
                    showSearch
                    placeholder="Where is cargo going?"
                    options={POPULAR_PORTS}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Form.Item
                  name="dateRange"
                  label={
                    <span className="form-field-label">
                      Departure Date Range
                    </span>
                  }
                >
                  <RangePicker
                    size="large"
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={6}>
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                />
              </Col>
            </Row>
          )}

          {searchType === "VESSEL_SCHEDULE" && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={9}>
                <Form.Item
                  name="vesselCode"
                  label={
                    <span className="form-field-label">
                      Vessel Name / Code <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: "Select vessel" }]}
                >
                  <Select
                    size="large"
                    showSearch
                    placeholder="Select vessel"
                    options={POPULAR_VESSELS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="dateRange"
                  label={
                    <span className="form-field-label">Voyage Date Range</span>
                  }
                >
                  <RangePicker
                    size="large"
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={7}>
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                />
              </Col>
            </Row>
          )}

          {searchType === "PORT_SCHEDULE" && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={9}>
                <Form.Item
                  name="portCode"
                  label={
                    <span className="form-field-label">
                      Port of Call <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: "Select port" }]}
                >
                  <Select
                    size="large"
                    showSearch
                    placeholder="Select port"
                    options={POPULAR_PORTS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="dateRange"
                  label={
                    <span className="form-field-label">
                      Arrival / Departure Window
                    </span>
                  }
                >
                  <RangePicker
                    size="large"
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={7}>
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                />
              </Col>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
}
