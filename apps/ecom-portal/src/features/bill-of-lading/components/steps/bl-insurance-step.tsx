// Modified by Sekar Nagarajan (2026-08-28 11:31)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  InputNumber,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { insuranceSchema } from "../../../booking/types/booking.types";
import type { BLInsuranceInfo } from "../../types/bl.types";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

const blInsuranceStepSchema = insuranceSchema.and(
  z.object({
    optOut: z.boolean().default(false),
    policyNo: z.string().optional(),
  }),
);

type BLInsuranceStepValues = z.infer<typeof blInsuranceStepSchema>;

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
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BLInsuranceStepValues>({
    resolver: zodResolver(
      blInsuranceStepSchema,
    ) as Resolver<BLInsuranceStepValues>,
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
                    Opt out of cargo insurance for this B/L
                  </Checkbox>
                )}
              />
            </Col>
          </Row>
        </Card>

        {!optOut ? (
          <>
            <Card size="small" className="form-step-card form-step-section">
              <label className="form-field-label">
                Do you require Cargo Insurance?
              </label>
              <Controller
                control={control}
                name="isInsuranceRequired"
                render={({ field: { value, onChange, ...field } }) => (
                  <Radio.Group
                    {...field}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                )}
              />
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
                    {errors.currency ? (
                      <Text type="danger" className="form-field-error">
                        {errors.currency.message}
                      </Text>
                    ) : null}
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
                  {data.insurance?.policyNo ? (
                    <Col {...RESPONSIVE_COL.formHalf}>
                      <label className="form-field-label">Policy No.</label>
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
                      message="Insurance Terms & Conditions"
                      description="By requesting cargo insurance, you agree to the carrier's standard insurance terms. Premium will be added to the freight invoice."
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

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton
            onClick={onPrevious}
            disabled={isFirstStep || isSubmitting}
          >
            Previous
          </AppButton>
        </div>
        <div className="form-step-footer__start custom-scroll">
          <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
            Next
          </AppButton>
          {!optOut ? (
            <AppButton
              type="link"
              onClick={handleOptOut}
              disabled={isSubmitting}
            >
              Skip Insurance
            </AppButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}
