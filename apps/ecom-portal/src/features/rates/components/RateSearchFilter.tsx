// Modified by Sekar Nagarajan (2026-08-26 10:55)
import { AppButton } from "@solverminds/shared-ui";
import {
  Col,
  DatePicker,
  Form,
  Row,
  Segmented,
  Select,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { AppIcon, Icons } from "../../../components/icons";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export type RateSearchMode =
  | "PUBLISHED_TARIFF"
  | "SURCHARGES"
  | "SERVICE_CONTRACTS"
  | "SPOT_QUOTES";

const POPULAR_PORTS = [
  { value: "USNYC", label: "USNYC - New York, USA" },
  { value: "SGSIN", label: "SGSIN - Singapore, Singapore" },
  { value: "NLRTM", label: "NLRTM - Rotterdam, Netherlands" },
  { value: "CNSHA", label: "CNSHA - Shanghai, China" },
  { value: "DEHAM", label: "DEHAM - Hamburg, Germany" },
  { value: "INNSA", label: "INNSA - Nhava Sheva, India" },
  { value: "AEDXB", label: "AEDXB - Jebel Ali, UAE" },
];

const EQUIPMENT_TYPES = [
  { value: "ALL", label: "All Equipment Types" },
  { value: "20' Standard Dry", label: "20' Standard Dry (20DV)" },
  { value: "40' High Cube Dry", label: "40' High Cube Dry (40HC)" },
  { value: "40' Reefer Container", label: "40' Reefer Container (40RF)" },
];

const COMMODITIES = [
  { value: "ALL", label: "All Commodities" },
  { value: "GEN-CGO", label: "GEN-CGO - General Freight / Merchandise" },
  {
    value: "AUTO-PARTS",
    label: "AUTO-PARTS - Automotive Spare Parts & Machinery",
  },
  { value: "PERISHABLE", label: "PERISHABLE - Chilled Agricultural Produce" },
  { value: "TEXTILES", label: "TEXTILES - Textiles & Garments" },
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

function SearchActionsLabel() {
  return <span className="rates-search-actions-label">&nbsp;</span>;
}

export function RateSearchFilter({
  onSearch,
  isLoading,
}: RateSearchFilterProps) {
  const [form] = Form.useForm();

  const handleSwapPorts = () => {
    const pol = form.getFieldValue("polCode");
    const pod = form.getFieldValue("podCode");
    form.setFieldsValue({
      polCode: pod,
      podCode: pol,
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const dateRange = values.dateRange as
      | [dayjs.Dayjs, dayjs.Dayjs]
      | undefined;
    onSearch({
      searchMode: values.searchMode as RateSearchMode,
      polCode: values.polCode as string,
      podCode: values.podCode as string,
      eqpType: values.eqpType as string,
      commodity: values.commodity as string,
      fromDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
      toDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
    });
  };

  return (
    <div className="rates-search-panel">
      <div className="rates-search-panel__body">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            searchMode: "PUBLISHED_TARIFF",
            polCode: "USNYC",
            podCode: "SGSIN",
            eqpType: "40' High Cube Dry",
            commodity: "GEN-CGO",
            dateRange: [dayjs(), dayjs().add(90, "day")],
          }}
          onFinish={handleFinish}
        >
          <div className="rates-search-mode-wrap custom-scroll">
            <Form.Item name="searchMode" className="rates-search-mode-field">
              <Segmented
                options={[
                  {
                    label: "Published Tariff",
                    value: "PUBLISHED_TARIFF",
                    icon: <AppIcon icon={Icons.dollarSign} size={16} />,
                  },
                  {
                    label: "Surcharge",
                    value: "SURCHARGES",
                    icon: <AppIcon icon={Icons.tag} size={16} />,
                  },
                  {
                    label: "Service Contract",
                    value: "SERVICE_CONTRACTS",
                    icon: <AppIcon icon={Icons.shieldCheck} size={16} />,
                  },
                  {
                    label: "Request for Quote",
                    value: "SPOT_QUOTES",
                    icon: <AppIcon icon={Icons.zap} size={16} />,
                  },
                ]}
              />
            </Form.Item>
          </div>

          <Row gutter={[16, 8]} align="bottom">
            <Col xs={24} md={11} lg={8}>
              <Form.Item
                name="polCode"
                label={
                  <span className="form-field-label rates-port-label">
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

            <Col xs={24} md={2} lg={1} className="rates-port-swap-col">
              <div className="rates-port-swap">
                <Tooltip title="Swap Origin and Delivery">
                  <AppButton
                    type="default"
                    size="large"
                    shape="circle"
                    icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                    onClick={handleSwapPorts}
                    aria-label="Swap origin and delivery ports"
                  />
                </Tooltip>
              </div>
            </Col>

            <Col xs={24} md={11} lg={8}>
              <Form.Item
                name="podCode"
                label={
                  <span className="form-field-label rates-port-label">
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

            <Col xs={24} md={24} lg={7}>
              <Form.Item
                name="eqpType"
                label={
                  <span className="form-field-label rates-port-label">
                    Equipment Type
                  </span>
                }
              >
                <Select size="large" options={EQUIPMENT_TYPES} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 8]} align="bottom">
            <Col xs={24} md={8} lg={7}>
              <Form.Item
                name="commodity"
                label={<span className="form-field-label">Commodity</span>}
              >
                <Select size="large" options={COMMODITIES} />
              </Form.Item>
            </Col>

            <Col xs={24} md={10} lg={9}>
              <Form.Item
                name="dateRange"
                label={
                  <span className="form-field-label rates-port-label">
                    From Date / To Date
                  </span>
                }
              >
                <RangePicker
                  size="large"
                  className="rates-date-range"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6} lg={8}>
              <Form.Item
                label={<SearchActionsLabel />}
                className="rates-search-actions-field"
              >
                <div className="rates-search-actions">
                  <AppButton
                    type="primary"
                    size="large"
                    icon={<AppIcon icon={Icons.search} size={16} />}
                    loading={isLoading}
                    htmlType="submit"
                  >
                    Search Rates
                  </AppButton>
                  <AppButton
                    size="large"
                    icon={<AppIcon icon={Icons.refreshCw} size={16} />}
                    onClick={handleReset}
                  >
                    Reset
                  </AppButton>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
