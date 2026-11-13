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
import type { BLInsuranceInfo } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

function createBlInsuranceStepSchema(t: (key: string) => string) {
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

type BLInsuranceStepValues = z.infer<
  ReturnType<typeof createBlInsuranceStepSchema>
>;

const defaults: BLInsuranceStepValues = {
  isInsuranceRequired: false,
  currency: "USD",
  cargoValue: undefined,
  termsAccepted: false,
  optOut: false,
  policyNo: undefined,
};

export function BlInsuranceStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  const schema = useMemo(() => createBlInsuranceStepSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BLInsuranceStepValues>({
    resolver: zodResolver(schema) as Resolver<BLInsuranceStepValues>,
    defaultValues: { ...defaults, ...(data.insurance ?? {}) },
  });

  const isInsuranceRequired = watch("isInsuranceRequired");
  const optOut = watch("optOut");

  const onValid = (values: BLInsuranceStepValues) => {
    const insurance: BLInsuranceInfo | null = values.optOut
      ? { ...defaults, optOut: true, isInsuranceRequired: false }
      : values;
    onUpdate({ insurance });
    onNext();
  };

  const handleOptOut = () => {
    onUpdate({ insurance: { ...defaults, optOut: true } });
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
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.full}>
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
            </Col>
          </Row>
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
                      {t("wizard.charges.currency")} <Text type="danger">*</Text>
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
          </>
        ) : null}
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        nextHtmlType="submit"
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
        extraEnd={
          !optOut ? (
            <AppButton
              type="link"
              htmlType="button"
              onClick={handleOptOut}
              disabled={isSubmitting}
            >
              {t("wizard.insurance.skip")}
            </AppButton>
          ) : null
        }
      />
    </form>
  );
}
