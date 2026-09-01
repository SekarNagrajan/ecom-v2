// Modified by Sekar Nagarajan (2026-08-25 13:10)
import { AppButton } from "@solverminds/shared-ui";
import { Col, InputNumber, Row, Select, Typography } from "antd";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { useCarbonLookupsQuery } from "../api/carbon.queries";
import type { CarbonInputFormValues } from "../types/carbon.types";

const { Text } = Typography;

/** Compact criteria grid — spans sum to 24 on lg+. */
const FIELD_COL = {
  port: { xs: 24, sm: 12, md: 8, lg: 4 },
  weight: { xs: 24, sm: 12, md: 8, lg: 3 },
  equipment: { xs: 24, sm: 12, md: 8, lg: 3 },
  count: { xs: 12, sm: 6, md: 4, lg: 2 },
  fuel: { xs: 12, sm: 6, md: 4, lg: 2 },
  unit: { xs: 24, sm: 12, md: 8, lg: 2 },
  actions: { xs: 24, sm: 12, md: 8, lg: 4 },
} as const;

interface CarbonCalculatorFormProps {
  form: UseFormReturn<CarbonInputFormValues>;
  onCalculate: () => void;
  onReset: () => void;
  calculating?: boolean;
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <span className="form-field-label">
      {label}
      {required ? <Text type="danger"> *</Text> : null}
    </span>
  );
}

export function CarbonCalculatorForm({
  form,
  onCalculate,
  onReset,
  calculating = false,
}: CarbonCalculatorFormProps) {
  const {
    control,
    formState: { errors },
  } = form;
  const { data: lookups, isLoading: lookupsLoading } = useCarbonLookupsQuery();

  const portOptions = (lookups?.ports ?? []).map((p) => ({
    value: p.value,
    label: p.label,
  }));
  const equipmentOptions = (lookups?.equipment ?? []).map((e) => ({
    value: e.value,
    label: e.label,
  }));
  const fuelOptions = (lookups?.fuelTypes ?? []).map((f) => ({
    value: f.value,
    label: f.label,
  }));

  const firstError =
    errors.origin?.message ||
    errors.destination?.message ||
    errors.cargoWeightKg?.message ||
    errors.equipment?.message ||
    errors.containerCount?.message;

  return (
    <form
      className="co2-form"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onCalculate();
      }}
    >
      <div className="co2-criteria-panel">
        <div className="co2-criteria-panel__body">
          <Row gutter={[16, 16]} align="bottom" className="co2-criteria-row">
            <Col {...FIELD_COL.port}>
              <div className="co2-search-field">
                <FieldLabel label="Origin" required />
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      loading={lookupsLoading}
                      placeholder="Origin"
                      options={portOptions}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      status={errors.origin ? "error" : undefined}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.port}>
              <div className="co2-search-field">
                <FieldLabel label="Destination" required />
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      loading={lookupsLoading}
                      placeholder="Destination"
                      options={portOptions}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      status={errors.destination ? "error" : undefined}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.weight}>
              <div className="co2-search-field">
                <FieldLabel label="Weight (kg)" required />
                <Controller
                  name="cargoWeightKg"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      size="large"
                      min={1}
                      step={100}
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? 0)}
                      onBlur={field.onBlur}
                      status={errors.cargoWeightKg ? "error" : undefined}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.equipment}>
              <div className="co2-search-field">
                <FieldLabel label="Equipment" required />
                <Controller
                  name="equipment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      loading={lookupsLoading}
                      placeholder="Equipment"
                      options={equipmentOptions}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      status={errors.equipment ? "error" : undefined}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.count}>
              <div className="co2-search-field">
                <FieldLabel label="Qty" required />
                <Controller
                  name="containerCount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      size="large"
                      min={1}
                      max={999}
                      step={1}
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? 1)}
                      onBlur={field.onBlur}
                      status={errors.containerCount ? "error" : undefined}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.fuel}>
              <div className="co2-search-field">
                <FieldLabel label="Fuel" />
                <Controller
                  name="fuelType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      allowClear
                      loading={lookupsLoading}
                      placeholder="Optional"
                      options={fuelOptions}
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? undefined)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.unit}>
              <div className="co2-search-field">
                <FieldLabel label="Unit" required />
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      options={[
                        { value: "kg", label: "kg CO₂e" },
                        { value: "t", label: "t CO₂e" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            </Col>

            <Col {...FIELD_COL.actions}>
              <div className="co2-search-actions-field">
                <span className="co2-search-actions-field__spacer form-field-label">
                  Actions
                </span>
                <div className="co2-search-actions">
                  <AppButton
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={calculating}
                    disabled={calculating}
                    icon={<AppIcon icon={Icons.calculator} size={16} />}
                  >
                    Calculate
                  </AppButton>
                  <AppButton
                    danger
                    size="large"
                    icon={
                      <AppIcon icon={Icons.refreshCw} size={16} tone="delete" />
                    }
                    onClick={onReset}
                    disabled={calculating}
                  >
                    Reset
                  </AppButton>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {firstError ? <p className="co2-criteria-error">{firstError}</p> : null}
    </form>
  );
}
