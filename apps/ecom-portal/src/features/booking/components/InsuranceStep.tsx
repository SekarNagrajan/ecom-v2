// Modified by Sekar Nagarajan (2026-09-01 16:12)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  InputNumber,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { useEffect, useMemo } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import { useBookingStore } from "../stores/booking.store";
import { createInsuranceSchema, type InsuranceData } from "../types/booking.types";

const { Text } = Typography;

const defaults: InsuranceData = {
  isInsuranceRequired: false,
  currency: "USD",
  cargoValue: undefined,
  termsAccepted: false,
};

export function InsuranceStep() {
  const { t } = useTranslation(["booking", "common"]);
  const { payload, updateInsurance, clearInsurance, nextStep, prevStep } =
    useBookingStore();

  const schema = useMemo(() => createInsuranceSchema((k) => t(k)), [t]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<InsuranceData>({
    resolver: zodResolver(schema) as Resolver<InsuranceData>,
    defaultValues: payload.insurance || defaults,
  });

  const isInsuranceRequired = watch("isInsuranceRequired");

  useEffect(() => {
    if (payload.insurance) reset({ ...defaults, ...payload.insurance });
  }, [payload.insurance, reset]);

  const onSubmit = (data: InsuranceData) => {
    updateInsurance(data);
    nextStep();
  };

  const handleSkip = () => {
    clearInsurance();
    nextStep();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card size="small" className="form-step-card form-step-section">
          <div className="form-field-cell">
            <label className="form-field-label">
              {t("wizard.insurance.requireQuestion")}
            </label>
            {/* Modified by Sekar Nagarajan (2026-09-01 16:12) — compact yes/no switch */}
            <Controller
              control={control}
              name="isInsuranceRequired"
              render={({ field: { value, onChange } }) => (
                <div className="form-yes-no-switch-wrap">
                  <Switch
                    className={FORM_YES_NO_SWITCH_CLASS}
                    checked={Boolean(value)}
                    onChange={onChange}
                    {...yesNoSwitchInner}
                  />
                </div>
              )}
            />
          </div>
        </Card>

        {isInsuranceRequired ? (
          <Card
            size="small"
            title={t("wizard.insurance.detailsTitle")}
            className="form-step-card form-step-section"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <label className="form-field-label">
                  {t("wizard.insurance.currency")} <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      className="form-field-full-width"
                      options={[
                        { value: "USD", label: "USD" },
                        { value: "EUR", label: "EUR" },
                        { value: "AED", label: "AED" },
                      ]}
                    />
                  )}
                />
                {errors.currency ? (
                  <Text type="danger" className="form-field-error">
                    {errors.currency.message}
                  </Text>
                ) : null}
              </Col>
              <Col xs={24} md={12}>
                <label className="form-field-label">
                  {t("labels.cargoValue")} <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="cargoValue"
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      size="large"
                      min={1}
                      className="form-field-full-width"
                    />
                  )}
                />
                {errors.cargoValue ? (
                  <Text type="danger" className="form-field-error">
                    {errors.cargoValue.message}
                  </Text>
                ) : null}
              </Col>
              <Col span={24}>
                <Alert
                  className="form-step-section"
                  type="info"
                  showIcon
                  message={t("wizard.insurance.termsTitle")}
                  description={t("wizard.insurance.termsBody")}
                />
                <Controller
                  control={control}
                  name="termsAccepted"
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    >
                      {t("wizard.insurance.acceptTerms")}{" "}
                      <Text type="danger">*</Text>
                    </Checkbox>
                  )}
                />
                {errors.termsAccepted ? (
                  <Text type="danger" className="form-field-error">
                    {errors.termsAccepted.message}
                  </Text>
                ) : null}
              </Col>
            </Row>
          </Card>
        ) : null}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>{t("common:actions.previous")}</AppButton>
        <AppButton type="primary" htmlType="submit">
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
