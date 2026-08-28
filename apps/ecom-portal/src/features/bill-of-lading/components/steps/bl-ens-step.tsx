// Created by Sekar Nagarajan (2026-08-28 11:15)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Input, Radio, Row, Select, Space, Typography } from "antd";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { ensSchema, type EnsData } from "../../../booking/types/booking.types";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

const defaults: EnsData = {
  euCustomsZone: false,
  blType: "Straight BL",
  ensFilingType: "Single Filing",
  paymentMethod: "Wire Transfer",
  declarantName: "",
  declarantAddress: "",
  declarantCity: "",
  declarantCountry: "",
  declarantEori: "",
  declarantEmail: "",
  buyerName: "",
  buyerAddress: "",
  buyerCity: "",
  buyerCountry: "",
  sellerName: "",
  sellerAddress: "",
  sellerCity: "",
  sellerCountry: "",
};

export function BlEnsStep({
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
  } = useForm<EnsData>({
    resolver: zodResolver(ensSchema) as Resolver<EnsData>,
    defaultValues: { ...defaults, ...(data.ens ?? {}) },
  });

  const euCustomsZone = watch("euCustomsZone");

  const onValid = (values: EnsData) => {
    onUpdate({ ens: values });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ ens: null });
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
            <Col {...RESPONSIVE_COL.formQuarter}>
              <label className="form-field-label">EU Customs Zone</label>
              <Controller
                control={control}
                name="euCustomsZone"
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
            <Col {...RESPONSIVE_COL.formQuarter}>
              <label className="form-field-label">Type of BL</label>
              <Controller
                control={control}
                name="blType"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    className="form-field-full-width"
                    options={[
                      { value: "Straight BL", label: "Straight BL" },
                      { value: "Master BL", label: "Master BL" },
                    ]}
                  />
                )}
              />
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <label className="form-field-label">Type of ENS Filing</label>
              <Controller
                control={control}
                name="ensFilingType"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    className="form-field-full-width"
                    options={[
                      { value: "Single Filing", label: "Single Filing" },
                      { value: "Multiple Filing", label: "Multiple Filing" },
                    ]}
                  />
                )}
              />
            </Col>
            <Col {...RESPONSIVE_COL.formQuarter}>
              <label className="form-field-label">Method of Payment</label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    className="form-field-full-width"
                    options={[
                      { value: "Wire Transfer", label: "Wire Transfer" },
                      { value: "Not Prepaid", label: "Not Prepaid" },
                    ]}
                  />
                )}
              />
            </Col>
          </Row>
        </Card>

        {euCustomsZone ? (
          <>
            <Card
              size="small"
              title="Supplementary Declarant"
              className="form-step-card form-step-section"
            >
              <Row gutter={[24, 24]}>
                <Col {...RESPONSIVE_COL.formThird}>
                  <label className="form-field-label">Name</label>
                  <Controller
                    control={control}
                    name="declarantName"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.twoThirds}>
                  <label className="form-field-label">Address</label>
                  <Controller
                    control={control}
                    name="declarantAddress"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formThird}>
                  <label className="form-field-label">City</label>
                  <Controller
                    control={control}
                    name="declarantCity"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formThird}>
                  <label className="form-field-label">Country</label>
                  <Controller
                    control={control}
                    name="declarantCountry"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formThird}>
                  <label className="form-field-label">EORI</label>
                  <Controller
                    control={control}
                    name="declarantEori"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formThird}>
                  <label className="form-field-label">Email</label>
                  <Controller
                    control={control}
                    name="declarantEmail"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                  {errors.declarantEmail ? (
                    <Text type="danger" className="form-field-error">
                      {errors.declarantEmail.message}
                    </Text>
                  ) : null}
                </Col>
              </Row>
            </Card>

            <Row gutter={[24, 24]} className="form-step-section">
              <Col {...RESPONSIVE_COL.half}>
                <Card size="small" title="Buyer Details" className="form-step-card">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <label className="form-field-label">Name</label>
                      <Controller
                        control={control}
                        name="buyerName"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={24}>
                      <label className="form-field-label">Address</label>
                      <Controller
                        control={control}
                        name="buyerAddress"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">City</label>
                      <Controller
                        control={control}
                        name="buyerCity"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">Country</label>
                      <Controller
                        control={control}
                        name="buyerCountry"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col {...RESPONSIVE_COL.half}>
                <Card size="small" title="Seller Details" className="form-step-card">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <label className="form-field-label">Name</label>
                      <Controller
                        control={control}
                        name="sellerName"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={24}>
                      <label className="form-field-label">Address</label>
                      <Controller
                        control={control}
                        name="sellerAddress"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">City</label>
                      <Controller
                        control={control}
                        name="sellerCity"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="form-field-label">Country</label>
                      <Controller
                        control={control}
                        name="sellerCountry"
                        render={({ field }) => <Input {...field} size="large" />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        ) : null}
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <Space>
            <AppButton
              onClick={onPrevious}
              disabled={isFirstStep || isSubmitting}
            >
              Previous
            </AppButton>
            <AppButton type="link" onClick={handleSkip} disabled={isSubmitting}>
              Skip
            </AppButton>
          </Space>
        </div>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
