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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
    FORM_YES_NO_SWITCH_CLASS,
    yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type { SIInsuranceInfo, SIWizardStepProps } from "../../types/si.types";

const { Text } = Typography;

const siInsuranceStepSchema = z.object({
  isInsuranceRequired: z.boolean(),
  currency: z.string().min(1),
  cargoValue: z.number().optional(),
  termsAccepted: z.boolean(),
  optOut: z.boolean(),
  policyNo: z.string().optional(),
});

type SiInsuranceStepValues = z.infer<typeof siInsuranceStepSchema>;

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
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SiInsuranceStepValues>({
    resolver: zodResolver(siInsuranceStepSchema),
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
          currency: values.currency,
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
                Opt out of cargo insurance for this SI
              </Checkbox>
            )}
          />
        </Card>

        {!optOut ? (
          <>
            <Card size="small" className="form-step-card form-step-section">
              <div className="form-field-cell">
                <label className="form-field-label">
                  Do you require Cargo Insurance?
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
                title="Insurance Details"
                className="form-step-card form-step-section"
              >
                <Row gutter={[24, 24]}>
                  <Col {...RESPONSIVE_COL.formHalf}>
                    <label className="form-field-label">
                      Currency <Text type="danger">*</Text>
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
                  </Col>
                  <Col {...RESPONSIVE_COL.formHalf}>
                    <label className="form-field-label">
                      Cargo Value <Text type="danger">*</Text>
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
                  <Col {...RESPONSIVE_COL.full}>
                    <Alert
                      type="info"
                      showIcon
                      message="Insurance Terms & Conditions"
                      description="By requesting cargo insurance, you agree to the carrier's standard insurance terms."
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
                          I accept the Insurance Terms and Conditions{" "}
                          <Text type="danger">*</Text>
                        </Checkbox>
                      )}
                    />
                  </Col>
                </Row>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Modified by Sekar Nagarajan (2026-08-28 12:40) */}
      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isFirstStep || isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
        {!optOut ? (
          <AppButton
            type="link"
            onClick={handleSkipInsurance}
            disabled={isSubmitting}
          >
            Skip Insurance
          </AppButton>
        ) : null}
      </div>
    </form>
  );
}
