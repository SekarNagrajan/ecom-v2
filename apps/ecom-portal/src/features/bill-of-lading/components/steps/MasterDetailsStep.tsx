// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Select, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type {
  BLDTO,
  BLMasterStepValues,
} from "../../types/bl.types";
import { blMasterStepSchema } from "../../types/bl.types";

const { Text } = Typography;

export interface BLWizardStepProps {
  data: BLDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onUpdate: (partial: Partial<BLDTO>) => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export function MasterDetailsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onCancel,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLMasterStepValues>({
    resolver: zodResolver(blMasterStepSchema),
    defaultValues: {
      blType: data.blType,
      releaseType: data.releaseType,
      freightOption: data.freightOption,
    },
  });

  const onValid = (values: BLMasterStepValues) => {
    onUpdate(values);
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
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">B/L Number</label>
                <div className="form-step-readonly-value">{data.blNo}</div>
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formHalf}>
              <div className="form-field-cell">
                <label className="form-field-label">Booking Number</label>
                <div className="form-step-readonly-value">{data.bookingNo}</div>
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.formThird}>
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
                      size="large"
                      className="form-field-full-width"
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
            <Col {...RESPONSIVE_COL.formThird}>
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
                      size="large"
                      className="form-field-full-width"
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
            <Col {...RESPONSIVE_COL.formThird}>
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
                      size="large"
                      className="form-field-full-width"
                      options={[
                        { label: "Prepaid", value: "PREPAID" },
                        { label: "Collect", value: "COLLECT" },
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
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
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
