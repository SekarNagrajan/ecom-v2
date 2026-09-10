// Modified by Sekar Nagarajan (2026-09-08 17:55)
import { AppButton } from "@solverminds/shared-ui";
import {
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import type { FormInstance } from "antd/es/form";
import dayjs from "dayjs";
import { AppIcon, Icons } from "../../../components/icons";

import type {
  ScheduleSearchParams,
  ScheduleSearchType,
} from "../types/schedules.types";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SEARCH_ROW_GUTTER: [number, number] = [12, 8];
const HEADER_ROW_GUTTER: [number, number] = [8, 4];

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
  { value: "PCMR", label: "PACIFIC MERCHANT (PCMR)" },
  { value: "MRST", label: "MERCHANT STAR (MRST)" },
  { value: "ATBR", label: "ATLANTIC BRIDGE (ATBR)" },
];

export type ScheduleSearchFilterVariant = "page" | "header";

export interface ScheduleSearchFilterProps {
  onSearch: (params: ScheduleSearchParams) => void;
  onReset?: () => void;
  isLoading?: boolean;
  variant?: ScheduleSearchFilterVariant;
  /** Lifted form instance so the filter can portal without losing values. */
  form?: FormInstance;
}

function SearchActionsLabel() {
  return <span className="schedule-search-actions-label">&nbsp;</span>;
}

function SearchActionsField({
  isLoading,
  onReset,
  compact,
}: {
  isLoading?: boolean;
  onReset: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Form.Item className="schedule-search-actions-field">
        <div className="schedule-search-actions schedule-search-actions--compact">
          <Tooltip title="Search Schedules">
            <AppButton
              type="primary"
              size="middle"
              htmlType="submit"
              loading={isLoading}
              className="schedule-search-actions__icon-btn"
              icon={<AppIcon icon={Icons.search} size={16} />}
              aria-label="Search Schedules"
            />
          </Tooltip>
          <Tooltip title="Reset">
            <AppButton
              danger
              size="middle"
              className="schedule-search-actions__icon-btn"
              icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
              onClick={onReset}
              aria-label="Reset search filters"
            />
          </Tooltip>
        </div>
      </Form.Item>
    );
  }

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
          danger
          size="large"
          icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
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
  onReset,
  isLoading,
  variant = "page",
  form: formProp,
}: ScheduleSearchFilterProps) {
  const [internalForm] = Form.useForm();
  const form = formProp ?? internalForm;
  const isHeader = variant === "header";
  const controlSize = isHeader ? "middle" : "large";
  const gutter = isHeader ? HEADER_ROW_GUTTER : SEARCH_ROW_GUTTER;

  const searchType: ScheduleSearchType =
    Form.useWatch("searchType", form) || "POINT_TO_POINT";

  const handleSwapPorts = () => {
    const pol = form.getFieldValue("polCode");
    const pod = form.getFieldValue("podCode");
    form.setFieldsValue({ polCode: pod, podCode: pol });
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  const handleSearchTypeChange = (key: string) => {
    form.setFieldValue("searchType", key as ScheduleSearchType);
    onReset?.();
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
    <div
      className={[
        "schedule-search-panel",
        isHeader ? "schedule-search-panel--header" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="schedule-search-panel__body">
        <Form
          form={form}
          layout={isHeader ? "horizontal" : "vertical"}
          requiredMark={false}
          initialValues={{
            searchType: "POINT_TO_POINT",
            polCode: "USNYC",
            podCode: "SGSIN",
            dateRange: [dayjs(), dayjs().add(30, "day")],
          }}
          onFinish={handleFinish}
        >
          {isHeader ? (
            <Form.Item name="searchType" hidden>
              <input type="hidden" />
            </Form.Item>
          ) : (
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
                onChange={handleSearchTypeChange}
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
                    label: (
                      <span className="schedule-tab-label">By Vessel</span>
                    ),
                  },
                  {
                    key: "PORT_SCHEDULE",
                    label: <span className="schedule-tab-label">By Port</span>,
                  },
                ]}
              />
            </div>
          )}

          {searchType === "POINT_TO_POINT" && (
            <Row gutter={gutter} align="middle" wrap={!isHeader}>
              <Col
                xs={24}
                md={isHeader ? undefined : 11}
                lg={isHeader ? undefined : 6}
                flex={isHeader ? "1 1 140px" : undefined}
              >
                <Form.Item
                  name="polCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Origin Port (POL) <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[{ required: true, message: "Select origin port" }]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={
                      isHeader ? "Origin (POL)" : "Where are you shipping from?"
                    }
                    options={POPULAR_PORTS}
                    aria-label="Origin Port (POL)"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 2}
                lg={isHeader ? undefined : 1}
                flex={isHeader ? "0 0 auto" : undefined}
              >
                <Form.Item
                  label={isHeader ? null : <SearchActionsLabel />}
                  className="schedule-search-actions-field schedule-port-swap-field"
                >
                  <Tooltip title="Swap ports">
                    <AppButton
                      type="default"
                      size={controlSize}
                      shape="circle"
                      icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                      onClick={handleSwapPorts}
                      aria-label="Swap origin and delivery ports"
                    />
                  </Tooltip>
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 11}
                lg={isHeader ? undefined : 5}
                flex={isHeader ? "1 1 140px" : undefined}
              >
                <Form.Item
                  name="podCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Delivery Port (POD) <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[{ required: true, message: "Select delivery port" }]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={
                      isHeader ? "Delivery (POD)" : "Where is cargo going?"
                    }
                    options={POPULAR_PORTS}
                    aria-label="Delivery Port (POD)"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 12}
                lg={isHeader ? undefined : 6}
                flex={isHeader ? "1 1 180px" : undefined}
              >
                <Form.Item
                  name="dateRange"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Departure Date Range
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label="Departure date range"
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 12}
                lg={isHeader ? undefined : 6}
                flex={isHeader ? "0 0 auto" : undefined}
              >
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                  compact={isHeader}
                />
              </Col>
            </Row>
          )}

          {searchType === "VESSEL_SCHEDULE" && (
            <Row gutter={gutter} align="middle" wrap={!isHeader}>
              <Col
                xs={24}
                lg={isHeader ? undefined : 9}
                flex={isHeader ? "1 1 160px" : undefined}
              >
                <Form.Item
                  name="vesselCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Vessel Name / Code <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[{ required: true, message: "Select vessel" }]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder="Vessel"
                    options={POPULAR_VESSELS}
                    aria-label="Vessel Name / Code"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                lg={isHeader ? undefined : 8}
                flex={isHeader ? "1 1 180px" : undefined}
              >
                <Form.Item
                  name="dateRange"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Voyage Date Range
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label="Voyage date range"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                lg={isHeader ? undefined : 7}
                flex={isHeader ? "0 0 auto" : undefined}
              >
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                  compact={isHeader}
                />
              </Col>
            </Row>
          )}

          {searchType === "PORT_SCHEDULE" && (
            <Row gutter={gutter} align="middle" wrap={!isHeader}>
              <Col
                xs={24}
                lg={isHeader ? undefined : 9}
                flex={isHeader ? "1 1 160px" : undefined}
              >
                <Form.Item
                  name="portCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Port of Call <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[{ required: true, message: "Select port" }]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder="Port of call"
                    options={POPULAR_PORTS}
                    aria-label="Port of Call"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                lg={isHeader ? undefined : 8}
                flex={isHeader ? "1 1 180px" : undefined}
              >
                <Form.Item
                  name="dateRange"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        Arrival / Departure Window
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label="Arrival / departure window"
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                lg={isHeader ? undefined : 7}
                flex={isHeader ? "0 0 auto" : undefined}
              >
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                  compact={isHeader}
                />
              </Col>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
}
