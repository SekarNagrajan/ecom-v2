// Modified by Sekar Nagarajan (2026-09-11 17:28)
import { AppButton, AppTabs } from "@solverminds/shared-ui";
import { DatePicker, Form, Select, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { usePortSearch } from "../../landing/api/landing.queries";

const { Text } = Typography;

export type RateSearchMode =
  | "PUBLISHED_TARIFF"
  | "SURCHARGES"
  | "SERVICE_CONTRACTS"
  | "SPOT_QUOTES";

/** Form.Item adapter: AppTabs uses activeKey, Ant Form passes value. */
function RateSearchModeTabs({
  value,
  onChange,
  items,
}: {
  value?: RateSearchMode;
  onChange?: (mode: RateSearchMode) => void;
  items: { key: RateSearchMode; label: string }[];
}) {
  return (
    <AppTabs
      className="rates-search-mode-tabs"
      size="large"
      activeKey={value ?? "PUBLISHED_TARIFF"}
      onChange={(key) => onChange?.(key as RateSearchMode)}
      items={items.map((tab) => ({
        key: tab.key,
        label: tab.label,
      }))}
    />
  );
}

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
  onReset?: () => void;
  /** Clears results when Tariff / Surcharge / Contract / RFQ tab changes. */
  onSearchModeChange?: (mode: RateSearchMode) => void;
  isLoading?: boolean;
  onRequestQuote?: () => void;
}

function SearchActionsLabel() {
  return <span className="rates-search-actions-label">&nbsp;</span>;
}

function usePortSelectOptions(
  initialQuery = "",
  fallbackPorts: { value: string; label: string }[],
) {
  const [query, setQuery] = useState(initialQuery);
  const { data: ports = [], isFetching } = usePortSearch(query);

  const options = useMemo(() => {
    if (ports.length === 0) return fallbackPorts;
    return ports.map((p) => ({
      value: p.portCode,
      label: `${p.portCode} - ${p.portName}`,
    }));
  }, [ports, fallbackPorts]);

  return { query, setQuery, options, isFetching };
}

export function RateSearchFilter({
  onSearch,
  onReset,
  onSearchModeChange,
  isLoading,
  onRequestQuote,
}: RateSearchFilterProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);
  const [form] = Form.useForm();
  const searchMode: RateSearchMode =
    Form.useWatch("searchMode", form) || "PUBLISHED_TARIFF";

  const rateSearchModeTabs = useMemo(
    () =>
      [
        { key: "PUBLISHED_TARIFF" as const, label: t("modes.tariff") },
        { key: "SURCHARGES" as const, label: t("modes.surcharge") },
        { key: "SERVICE_CONTRACTS" as const, label: t("modes.serviceContract") },
        { key: "SPOT_QUOTES" as const, label: t("modes.requestForQuote") },
      ] satisfies { key: RateSearchMode; label: string }[],
    [t],
  );

  const fallbackPorts = useMemo(
    () => [
      { value: "USNYC", label: t("options.ports.USNYC") },
      { value: "SGSIN", label: t("options.ports.SGSIN") },
      { value: "NLRTM", label: t("options.ports.NLRTM") },
      { value: "CNSHA", label: t("options.ports.CNSHA") },
      { value: "DEHAM", label: t("options.ports.DEHAM") },
      { value: "INNSA", label: t("options.ports.INNSA") },
      { value: "AEDXB", label: t("options.ports.AEDXB") },
    ],
    [t],
  );

  const equipmentTypes = useMemo(
    () => [
      { value: "ALL", label: t("options.equipment.all") },
      { value: "20' Standard Dry", label: t("options.equipment.20dv") },
      { value: "40' High Cube Dry", label: t("options.equipment.40hc") },
      { value: "40' Reefer Container", label: t("options.equipment.40rf") },
    ],
    [t],
  );

  const commodities = useMemo(
    () => [
      { value: "ALL", label: t("options.commodity.all") },
      { value: "GEN-CGO", label: t("options.commodity.genCgo") },
      { value: "AUTO-PARTS", label: t("options.commodity.autoParts") },
      { value: "PERISHABLE", label: t("options.commodity.perishable") },
      { value: "TEXTILES", label: t("options.commodity.textiles") },
    ],
    [t],
  );

  const polAC = usePortSelectOptions("USNYC", fallbackPorts);
  const podAC = usePortSelectOptions("SGSIN", fallbackPorts);

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
    onReset?.();
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const mode = values.searchMode as RateSearchMode;
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
          onValuesChange={(changed) => {
            if (changed.searchMode && typeof changed.searchMode === "string") {
              onSearchModeChange?.(changed.searchMode as RateSearchMode);
            }
          }}
          onFinish={handleFinish}
        >
          <div className="rates-search-mode-wrap custom-scroll">
            <Form.Item name="searchMode" className="rates-search-mode-field">
              <RateSearchModeTabs items={rateSearchModeTabs} />
            </Form.Item>
          </div>

          <div className="rates-search-fields-row">
            <div className="rates-search-field rates-search-field--port">
              <Form.Item
                name="polCode"
                label={
                  <span className="form-field-label rates-port-label">
                    {t("search.originPort")} <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: t("search.selectOrigin") }]}
              >
                <Select
                  size="large"
                  showSearch
                  placeholder={t("search.originPlaceholder")}
                  filterOption={false}
                  onSearch={polAC.setQuery}
                  options={polAC.options}
                  loading={polAC.isFetching}
                  notFoundContent={
                    polAC.isFetching
                      ? t("search.searchingPorts")
                      : t("search.noPortsFound")
                  }
                />
              </Form.Item>
            </div>

            <div className="rates-search-field rates-search-field--swap">
              <Form.Item
                label={<SearchActionsLabel />}
                className="rates-search-swap-field"
              >
                <div className="rates-port-swap">
                  <Tooltip title={t("search.swapTooltip")}>
                    <AppButton
                      type="default"
                      size="large"
                      shape="circle"
                      icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                      onClick={handleSwapPorts}
                      aria-label={t("search.swapAria")}
                    />
                  </Tooltip>
                </div>
              </Form.Item>
            </div>

            <div className="rates-search-field rates-search-field--port">
              <Form.Item
                name="podCode"
                label={
                  <span className="form-field-label rates-port-label">
                    {t("search.deliveryPort")} <Text type="danger">*</Text>
                  </span>
                }
                rules={[{ required: true, message: t("search.selectDelivery") }]}
              >
                <Select
                  size="large"
                  showSearch
                  placeholder={t("search.deliveryPlaceholder")}
                  filterOption={false}
                  onSearch={podAC.setQuery}
                  options={podAC.options}
                  loading={podAC.isFetching}
                  notFoundContent={
                    podAC.isFetching
                      ? t("search.searchingPorts")
                      : t("search.noPortsFound")
                  }
                />
              </Form.Item>
            </div>

            {showEquipment ? (
              <div className="rates-search-field rates-search-field--eqp">
                <Form.Item
                  name="eqpType"
                  label={
                    <span className="form-field-label rates-port-label">
                      {t("search.equipmentType")}
                    </span>
                  }
                >
                  <Select size="large" options={equipmentTypes} />
                </Form.Item>
              </div>
            ) : null}

            {showCommodity ? (
              <div className="rates-search-field rates-search-field--commodity">
                <Form.Item
                  name="commodity"
                  label={
                    <span className="form-field-label">
                      {t("search.commodity")}
                    </span>
                  }
                >
                  <Select size="large" options={commodities} />
                </Form.Item>
              </div>
            ) : null}

            {showShipmentDate ? (
              <>
                <div className="rates-search-field rates-search-field--date">
                  <Form.Item
                    name="shipmentDate"
                    label={
                      <span className="form-field-label rates-port-label">
                        {t("search.shipmentDate")}
                      </span>
                    }
                  >
                    <DatePicker
                      size="large"
                      className="rates-date-range"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </div>
                <div className="rates-search-field rates-search-field--date">
                  <Form.Item
                    name="toDate"
                    label={
                      <span className="form-field-label rates-port-label">
                        {t("search.validThrough")}
                      </span>
                    }
                  >
                    <DatePicker
                      size="large"
                      className="rates-date-range"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </div>
              </>
            ) : null}

            <div className="rates-search-field rates-search-field--actions">
              <Form.Item
                label={<SearchActionsLabel />}
                className="rates-search-actions-field"
              >
                <div className="rates-search-actions">
                  {isRfqMode && onRequestQuote ? (
                    <AppButton
                      type="primary"
                      size="large"
                      icon={<AppIcon icon={Icons.dollarSign} size={16} />}
                      onClick={() => {
                        void form
                          .validateFields(["polCode", "podCode"])
                          .then(() => {
                            onSearch({
                              searchMode: "SPOT_QUOTES",
                              polCode: form.getFieldValue("polCode"),
                              podCode: form.getFieldValue("podCode"),
                              eqpType: form.getFieldValue("eqpType"),
                              commodity: form.getFieldValue("commodity"),
                            });
                            onRequestQuote();
                          });
                      }}
                    >
                      {t("actions.requestForQuote")}
                    </AppButton>
                  ) : (
                    <AppButton
                      type="primary"
                      size="large"
                      icon={<AppIcon icon={Icons.search} size={16} />}
                      loading={isLoading}
                      htmlType="submit"
                    >
                      {t("common:actions.search")}
                    </AppButton>
                  )}
                  {!isRfqMode ? (
                    <AppButton
                      danger
                      size="large"
                      icon={
                        <AppIcon
                          icon={Icons.refreshCw}
                          size={16}
                          tone="delete"
                        />
                      }
                      onClick={handleReset}
                    >
                      {t("common:actions.reset")}
                    </AppButton>
                  ) : (
                    <>
                      <AppButton
                        size="large"
                        icon={<AppIcon icon={Icons.eye} size={16} />}
                        loading={isLoading}
                        htmlType="submit"
                      >
                        {t("actions.viewQuotes")}
                      </AppButton>
                      <AppButton
                        size="large"
                        danger
                        icon={
                          <AppIcon
                            icon={Icons.refreshCw}
                            size={16}
                            tone="delete"
                          />
                        }
                        onClick={handleReset}
                      >
                        {t("common:actions.reset")}
                      </AppButton>
                    </>
                  )}
                </div>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
