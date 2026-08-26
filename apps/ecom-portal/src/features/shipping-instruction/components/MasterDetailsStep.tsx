// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Select, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import type { SIDTO, SiMasterDetailsForm } from "../types/si.types";
import { siMasterDetailsSchema } from "../types/si.types";

const { Text } = Typography;

interface StepProps {
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export function MasterDetailsStep({
  data,
  onNext,
  onPrevious,
  onCancel,
  isFirstStep,
  isSubmitting,
}: StepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiMasterDetailsForm>({
    resolver: zodResolver(siMasterDetailsSchema),
    defaultValues: {
      blType: data.blType,
      releaseType: data.releaseType,
      freightOption: data.freightOption,
    },
  });

  const onValid = (_formData: SiMasterDetailsForm) => {
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">Booking Number</label>
                <div className="form-step-readonly-value">{data.bookingNo}</div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="form-field-cell">
                <label className="form-field-label">SI Number</label>
                <div className="form-step-readonly-value">
                  {data.siNo || "Draft"}
                </div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  B/L Type <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="blType"
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="si-field-full"
                      size="large"
                      options={[
                        { label: "Original", value: "Original" },
                        { label: "Seaway", value: "Seaway" },
                      ]}
                    />
                  )}
                />
                {errors.blType ? (
                  <Text type="danger" className="form-field-error">
                    {errors.blType.message}
                  </Text>
                ) : null}
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Release Type <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="releaseType"
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="si-field-full"
                      size="large"
                      options={[
                        { label: "Original", value: "O" },
                        { label: "Telex", value: "T" },
                      ]}
                    />
                  )}
                />
                {errors.releaseType ? (
                  <Text type="danger" className="form-field-error">
                    {errors.releaseType.message}
                  </Text>
                ) : null}
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="form-field-cell">
                <label className="form-field-label">
                  Freight Option <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name="freightOption"
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="si-field-full"
                      size="large"
                      options={[
                        { label: "PREPAID", value: "PREPAID" },
                        { label: "COLLECT", value: "COLLECT" },
                      ]}
                    />
                  )}
                />
                {errors.freightOption ? (
                  <Text type="danger" className="form-field-error">
                    {errors.freightOption.message}
                  </Text>
                ) : null}
              </div>
            </Col>
          </Row>
        </Card>
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
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
