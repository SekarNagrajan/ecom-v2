// Modified by Sekar Nagarajan (2026-08-26 11:10)
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
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBookingStore } from "../stores/booking.store";
import { insuranceSchema } from "../types/booking.types";

const { Text } = Typography;

export function InsuranceStep() {
  const { payload, updateInsurance, nextStep, prevStep } = useBookingStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: payload.insurance || {
      isInsuranceRequired: false,
      currency: "USD",
      cargoValue: undefined,
      termsAccepted: false,
    },
  });

  const isInsuranceRequired = watch("isInsuranceRequired");

  useEffect(() => {
    if (payload.insurance) reset(payload.insurance);
  }, [payload.insurance, reset]);

  const onSubmit = (data: any) => {
    updateInsurance(data);
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
          <Row gutter={[24, 24]}>
            <Col span={24}>
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
            </Col>
          </Row>
        </Card>

        {isInsuranceRequired && (
          <Card
            size="small"
            title="Insurance Details"
            className="form-step-card form-step-section"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
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
                      options={[
                        { value: "USD", label: "USD" },
                        { value: "EUR", label: "EUR" },
                      ]}
                      className="form-field-full-width"
                    />
                  )}
                />
                {errors.currency && (
                  <Text type="danger" className="form-field-error">
                    {errors.currency.message as string}
                  </Text>
                )}
              </Col>

              <Col xs={24} md={12}>
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
                {errors.cargoValue && (
                  <Text type="danger" className="form-field-error">
                    {errors.cargoValue.message as string}
                  </Text>
                )}
              </Col>

              <Col span={24}>
                <Alert
                  message="Insurance Terms & Conditions"
                  description="By requesting cargo insurance, you agree to the carrier's standard terms and conditions of insurance which will be applied to your final booking confirmation. The premium will be added to your freight invoice."
                  type="info"
                  showIcon
                  className="form-step-section"
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
                {errors.termsAccepted && (
                  <Text type="danger" className="form-field-error">
                    {errors.termsAccepted.message as string}
                  </Text>
                )}
              </Col>
            </Row>
          </Card>
        )}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">
          Next
        </AppButton>
        <AppButton type="link" onClick={() => nextStep()}>
          Skip
        </AppButton>
      </div>
    </form>
  );
}
