// Modified by Sekar Nagarajan (2026-09-01 16:07)
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
import { useMemo } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type { SIInsuranceInfo, SIWizardStepProps } from "../../types/si.types";

const { Text } = Typography;

function createSiInsuranceStepSchema(t: (key: string) => string) {
  return z
    .object({
      isInsuranceRequired: z.boolean().default(false),
      currency: z.string().optional(),
      cargoValue: z.number().optional(),
      termsAccepted: z.boolean().default(false),
      optOut: z.boolean().default(false),
      policyNo: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.isInsuranceRequired || data.optOut) {
        return;
      }
      if (!data.currency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("wizard.insurance.validation.currencyRequired"),
          path: ["currency"],
        });
      }
      if (!data.cargoValue || data.cargoValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("wizard.insurance.validation.cargoValueMin"),
          path: ["cargoValue"],
        });
      }
      if (!data.termsAccepted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("wizard.insurance.validation.acceptTerms"),
          path: ["termsAccepted"],
        });
      }
    });
}

type SiInsuranceStepValues = z.infer<
  ReturnType<typeof createSiInsuranceStepSchema>
>;

const defaults: SiInsuranceStepValues = {
  isInsuranceRequired: false,
  currency: "USD",
  cargoValue: undefined,
  termsAccepted: false,
  optOut: false,
  policyNo: undefined,
};

export function SiInsuranceStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  const schema = useMemo(() => createSiInsuranceStepSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SiInsuranceStepValues>({
    resolver: zodResolver(schema) as Resolver<SiInsuranceStepValues>,
    defaultValues: {
      ...defaults,
      ...(data.insurance
        ? {
            isInsuranceRequired: data.insurance.isInsuranceRequired,
            currency: data.insurance.currency,
            cargoValue: data.insurance.cargoValue,
            termsAccepted: data.insurance.termsAccepted,
            optOut: data.insurance.optOut,
            policyNo: data.insurance.policyNo,
          }
        : {}),
    },
  });

  const isInsuranceRequired = watch("isInsuranceRequired");
  const optOut = watch("optOut");

  const onValid = (values: SiInsuranceStepValues) => {
    const insurance: SIInsuranceInfo = values.optOut
      ? {
          isInsuranceRequired: false,
          currency: "USD",
          termsAccepted: false,
          optOut: true,
        }
      : {
          isInsuranceRequired: values.isInsuranceRequired,
          currency: values.currency ?? "USD",
          cargoValue: values.cargoValue,
          termsAccepted: values.termsAccepted,
          optOut: false,
          policyNo: values.policyNo,
        };
    onUpdate({ insurance });
    onNext();
  };

  const handleSkipInsurance = () => {
    onUpdate({
      insurance: {
        isInsuranceRequired: false,
        currency: "USD",
        termsAccepted: false,
        optOut: true,
      },
    });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card size="small" className="form-step-card form-step-section">
          <Controller
            control={control}
            name="optOut"
            render={({ field: { value, onChange, ...field } }) => (
              <Checkbox
                {...field}
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              >
                {t("wizard.insurance.optOutCheckbox")}
              </Checkbox>
            )}
          />
        </Card>

        {!optOut ? (
          <>
            <Card size="small" className="form-step-card form-step-section">
              <div className="form-field-cell">
                <label className="form-field-label">
                  {t("wizard.insurance.requireQuestion")}
                </label>
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
                  <Col {...RESPONSIVE_COL.formHalf}>
                    <label className="form-field-label">
                      {t("labels.currency")} <Text type="danger">*</Text>
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
                  <Col {...RESPONSIVE_COL.formHalf}>
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
                  {data.insurance?.policyNo ? (
                    <Col {...RESPONSIVE_COL.formHalf}>
                      <label className="form-field-label">
                        {t("labels.policyNo")}
                      </label>
                      <div className="form-step-readonly-value">
                        {data.insurance.policyNo}
                      </div>
                    </Col>
                  ) : null}
                  <Col {...RESPONSIVE_COL.full}>
                    <Alert
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
          </>
        ) : null}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isFirstStep || isSubmitting}>
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
        {!optOut ? (
          <AppButton
            type="link"
            onClick={handleSkipInsurance}
            disabled={isSubmitting}
          >
            {t("wizard.insurance.skip")}
          </AppButton>
        ) : null}
      </div>
    </form>
  );
}
