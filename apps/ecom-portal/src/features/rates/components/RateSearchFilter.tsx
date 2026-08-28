// Modified by Sekar Nagarajan (2026-08-28 15:09)
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
import { useMemo, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { usePortSearch } from "../../landing/api/landing.queries";

const { Text } = Typography;

export type RateSearchMode =
  | "PUBLISHED_TARIFF"
  | "SURCHARGES"
  | "SERVICE_CONTRACTS"
  | "SPOT_QUOTES";

const FALLBACK_PORTS = [
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
  onRequestQuote?: () => void;
}

function SearchActionsLabel() {
  return <span className="rates-search-actions-label">&nbsp;</span>;
}

function usePortSelectOptions(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const { data: ports = [], isFetching } = usePortSearch(query);

  const options = useMemo(() => {
    if (ports.length === 0) return FALLBACK_PORTS;
    return ports.map((p) => ({
      value: p.portCode,
      label: `${p.portCode} - ${p.portName}`,
    }));
  }, [ports]);

  return { query, setQuery, options, isFetching };
}

export function RateSearchFilter({
  onSearch,
  isLoading,
  onRequestQuote,
}: RateSearchFilterProps) {
  const [form] = Form.useForm();
  const searchMode: RateSearchMode =
    Form.useWatch("searchMode", form) || "PUBLISHED_TARIFF";

  const polAC = usePortSelectOptions("USNYC");
  const podAC = usePortSelectOptions("SGSIN");

  const showCommodity =
    searchMode === "PUBLISHED_TARIFF" ||
    searchMode === "SERVICE_CONTRACTS" ||
    searchMode === "SPOT_QUOTES";
  const showEquipment = searchMode !== "SERVICE_CONTRACTS";
  const showShipmentDate = searchMode !== "SPOT_QUOTES";
  const isRfqMode = searchMode === "SPOT_QUOTES";

  const handleSwapPorts = () => {
    const pol = form.getFieldValue("polCode");
    const pod = form.getFieldValue("podCode");
    form.setFieldsValue({
      polCode: pod,
      podCode: pol,
    });
    polAC.setQuery(typeof pod === "string" ? pod : "");
    podAC.setQuery(typeof pol === "string" ? pol : "");
  };

  const handleReset = () => {
    form.resetFields();
    polAC.setQuery("USNYC");
    podAC.setQuery("SGSIN");
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const mode = values.searchMode as RateSearchMode;
    if (mode === "SPOT_QUOTES" && onRequestQuote) {
      onSearch({
        searchMode: mode,
        polCode: values.polCode as string,
        podCode: values.podCode as string,
        eqpType: values.eqpType as string,
        commodity: values.commodity as string,
        fromDate: values.shipmentDate
          ? (values.shipmentDate as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
        toDate: values.toDate
          ? (values.toDate as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
      });
      return;
    }

    onSearch({
      searchMode: mode,
      polCode: values.polCode as string,
      podCode: values.podCode as string,
      eqpType: values.eqpType as string,
      commodity: values.commodity as string,
      fromDate: values.shipmentDate
        ? (values.shipmentDate as dayjs.Dayjs).format("YYYY-MM-DD")
        : undefined,
      toDate: values.toDate
        ? (values.toDate as dayjs.Dayjs).format("YYYY-MM-DD")
        : undefined,
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
            shipmentDate: dayjs(),
            toDate: dayjs().add(90, "day"),
          }}
          onFinish={handleFinish}
        >
          <div className="rates-search-mode-wrap custom-scroll">
            <Form.Item name="searchMode" className="rates-search-mode-field">
              <Segmented
                options={[
                  {
                    label: "Tariff",
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
            <Col xs={24} md={11} lg={showEquipment ? 7 : 8}>
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
                  filterOption={false}
                  onSearch={polAC.setQuery}
                  options={polAC.options}
                  loading={polAC.isFetching}
                  notFoundContent={
                    polAC.isFetching ? "Searching ports…" : "No ports found"
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

            <Col xs={24} md={11} lg={showEquipment ? 7 : 8}>
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
                  filterOption={false}
                  onSearch={podAC.setQuery}
                  options={podAC.options}
                  loading={podAC.isFetching}
                  notFoundContent={
                    podAC.isFetching ? "Searching ports…" : "No ports found"
                  }
                />
              </Form.Item>
            </Col>

            {showEquipment ? (
              <Col xs={24} md={12} lg={9}>
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
            ) : null}
          </Row>

          <Row gutter={[16, 8]} align="bottom">
            {showCommodity ? (
              <Col xs={24} md={8} lg={isRfqMode ? 8 : 6}>
                <Form.Item
                  name="commodity"
                  label={<span className="form-field-label">Commodity</span>}
                >
                  <Select size="large" options={COMMODITIES} />
                </Form.Item>
              </Col>
            ) : null}

            {showShipmentDate ? (
              <>
                <Col xs={24} md={8} lg={showCommodity ? 5 : 7}>
                  <Form.Item
                    name="shipmentDate"
                    label={
                      <span className="form-field-label rates-port-label">
                        Shipment Date
                      </span>
                    }
                  >
                    <DatePicker
                      size="large"
                      className="rates-date-range"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={showCommodity ? 5 : 7}>
                  <Form.Item
                    name="toDate"
                    label={
                      <span className="form-field-label rates-port-label">
                        Valid Through
                      </span>
                    }
                  >
                    <DatePicker
                      size="large"
                      className="rates-date-range"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
              </>
            ) : null}

            <Col
              xs={24}
              md={showShipmentDate ? 24 : 16}
              lg={isRfqMode ? 16 : showCommodity ? 8 : 10}
            >
              <Form.Item
                label={<SearchActionsLabel />}
                className="rates-search-actions-field"
              >
                <div className="rates-search-actions">
                  {isRfqMode && onRequestQuote ? (
                    <AppButton
                      type="primary"
                      size="large"
                      icon={<AppIcon icon={Icons.zap} size={16} />}
                      onClick={() => {
                        void form.validateFields(["polCode", "podCode"]).then(
                          () => {
                            onSearch({
                              searchMode: "SPOT_QUOTES",
                              polCode: form.getFieldValue("polCode"),
                              podCode: form.getFieldValue("podCode"),
                              eqpType: form.getFieldValue("eqpType"),
                              commodity: form.getFieldValue("commodity"),
                            });
                            onRequestQuote();
                          },
                        );
                      }}
                    >
                      Request for Quote
                    </AppButton>
                  ) : (
                    <AppButton
                      type="primary"
                      size="large"
                      icon={<AppIcon icon={Icons.search} size={16} />}
                      loading={isLoading}
                      htmlType="submit"
                    >
                      Search Rates
                    </AppButton>
                  )}
                  {!isRfqMode ? (
                    <AppButton
                      size="large"
                      icon={<AppIcon icon={Icons.refreshCw} size={16} />}
                      onClick={handleReset}
                    >
                      Reset
                    </AppButton>
                  ) : (
                    <>
                      <AppButton
                        size="large"
                        icon={<AppIcon icon={Icons.search} size={16} />}
                        loading={isLoading}
                        htmlType="submit"
                      >
                        View Quotes
                      </AppButton>
                      <AppButton
                        size="large"
                        icon={<AppIcon icon={Icons.refreshCw} size={16} />}
                        onClick={handleReset}
                      >
                        Reset
                      </AppButton>
                    </>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
