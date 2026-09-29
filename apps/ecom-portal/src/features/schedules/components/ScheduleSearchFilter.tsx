// Modified by Sekar Nagarajan (2026-09-17 21:19)
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
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";

import type {
  ScheduleSearchParams,
  ScheduleSearchType,
} from "../types/schedules.types";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SEARCH_ROW_GUTTER: [number, number] = [12, 8];
const HEADER_ROW_GUTTER: [number, number] = [8, 4];

const PORT_CODES = [
  "AEDXB",
  "AEJEA",
  "CNSHA",
  "INMUN",
  "INNSA",
  "SGSIN",
] as const;

const VESSEL_CODES = [
  "AGEX",
  "SMVY",
  "GLHZ",
  "OCPN",
  "PCMR",
  "MRST",
  "ATBR",
] as const;

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
  t,
}: {
  isLoading?: boolean;
  onReset: () => void;
  compact?: boolean;
  t: (key: string) => string;
}) {
  const searchLabel = t("search.searchSchedules");
  const resetLabel = t("common:actions.reset");
  const resetAria = t("search.resetAria");

  if (compact) {
    return (
      <Form.Item className="schedule-search-actions-field">
        <div className="schedule-search-actions schedule-search-actions--compact">
          <Tooltip title={searchLabel}>
            <AppButton
              type="primary"
              size="middle"
              htmlType="submit"
              loading={isLoading}
              className="schedule-search-actions__icon-btn"
              icon={<AppIcon icon={Icons.search} size={16} />}
              aria-label={searchLabel}
            />
          </Tooltip>
          <Tooltip title={resetLabel}>
            <AppButton
              danger
              size="middle"
              className="schedule-search-actions__icon-btn"
              icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
              onClick={onReset}
              aria-label={resetAria}
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
          {searchLabel}
        </AppButton>
        <AppButton
          danger
          size="large"
          icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
          onClick={onReset}
          aria-label={resetAria}
        >
          {resetLabel}
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
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const [internalForm] = Form.useForm();
  const form = formProp ?? internalForm;
  const isHeader = variant === "header";

  const popularPorts = useMemo(
    () =>
      PORT_CODES.map((value) => ({
        value,
        label: t(`options.ports.${value}`),
      })),
    [t],
  );

  const popularVessels = useMemo(
    () =>
      VESSEL_CODES.map((value) => ({
        value,
        label: t(`options.vessels.${value}`),
      })),
    [t],
  );
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
            polCode: "CNSHA",
            podCode: "AEJEA",
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
                      <span className="schedule-tab-label">
                        {t("modes.byRoute")}
                      </span>
                    ),
                  },
                  {
                    key: "VESSEL_SCHEDULE",
                    label: (
                      <span className="schedule-tab-label">
                        {t("modes.byVessel")}
                      </span>
                    ),
                  },
                  {
                    key: "PORT_SCHEDULE",
                    label: (
                      <span className="schedule-tab-label">
                        {t("modes.byPort")}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          )}

          {searchType === "POINT_TO_POINT" && (
            <Row gutter={gutter} align="middle" wrap={!isHeader}>
              {/* Modified by Sekar Nagarajan (2026-09-17 21:19) — wider POL/POD in header strip */}
              <Col
                xs={24}
                md={isHeader ? undefined : 11}
                lg={isHeader ? undefined : 6}
                flex={isHeader ? "2 1 260px" : undefined}
                className={
                  isHeader ? "schedule-search-header-col--port" : undefined
                }
              >
                <Form.Item
                  name="polCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        {t("search.originPort")} <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[
                    { required: true, message: t("search.selectOrigin") },
                  ]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={
                      isHeader
                        ? t("search.originShort")
                        : t("search.originPlaceholder")
                    }
                    options={popularPorts}
                    optionLabelProp="label"
                    popupMatchSelectWidth={360}
                    aria-label={t("search.originPortAria")}
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
                className={
                  isHeader ? "schedule-search-header-col--swap" : undefined
                }
              >
                <Form.Item
                  label={isHeader ? null : <SearchActionsLabel />}
                  className="schedule-search-actions-field schedule-port-swap-field"
                >
                  <Tooltip title={t("search.swapTooltip")}>
                    <AppButton
                      type="default"
                      size={controlSize}
                      shape="circle"
                      icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                      onClick={handleSwapPorts}
                      aria-label={t("search.swapAria")}
                    />
                  </Tooltip>
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 11}
                lg={isHeader ? undefined : 5}
                flex={isHeader ? "2 1 260px" : undefined}
                className={
                  isHeader ? "schedule-search-header-col--port" : undefined
                }
              >
                <Form.Item
                  name="podCode"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        {t("search.deliveryPort")} <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[
                    { required: true, message: t("search.selectDelivery") },
                  ]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={
                      isHeader
                        ? t("search.deliveryShort")
                        : t("search.deliveryPlaceholder")
                    }
                    options={popularPorts}
                    optionLabelProp="label"
                    popupMatchSelectWidth={360}
                    aria-label={t("search.deliveryPortAria")}
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
                flex={isHeader ? "0 1 220px" : undefined}
                className={
                  isHeader ? "schedule-search-header-col--date" : undefined
                }
              >
                <Form.Item
                  name="dateRange"
                  label={
                    isHeader ? null : (
                      <span className="form-field-label">
                        {t("search.departureDateRange")}
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label={t("search.departureDateRangeAria")}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={isHeader ? undefined : 12}
                lg={isHeader ? undefined : 6}
                flex={isHeader ? "0 0 auto" : undefined}
                className={
                  isHeader ? "schedule-search-header-col--actions" : undefined
                }
              >
                <SearchActionsField
                  isLoading={isLoading}
                  onReset={handleReset}
                  compact={isHeader}
                  t={t}
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
                        {t("search.vesselNameCode")}{" "}
                        <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[
                    { required: true, message: t("search.selectVessel") },
                  ]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={t("search.vesselPlaceholder")}
                    options={popularVessels}
                    aria-label={t("search.vesselAria")}
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
                        {t("search.voyageDateRange")}
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label={t("search.voyageDateRangeAria")}
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
                  t={t}
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
                        {t("search.portOfCall")} <Text type="danger">*</Text>
                      </span>
                    )
                  }
                  rules={[{ required: true, message: t("search.selectPort") }]}
                >
                  <Select
                    size={controlSize}
                    showSearch
                    placeholder={t("search.portOfCallPlaceholder")}
                    options={popularPorts}
                    aria-label={t("search.portOfCallAria")}
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
                        {t("search.arrivalDepartureWindow")}
                      </span>
                    )
                  }
                >
                  <RangePicker
                    size={controlSize}
                    className="schedule-date-range"
                    format="YYYY-MM-DD"
                    aria-label={t("search.arrivalDepartureWindowAria")}
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
                  t={t}
                />
              </Col>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
}
