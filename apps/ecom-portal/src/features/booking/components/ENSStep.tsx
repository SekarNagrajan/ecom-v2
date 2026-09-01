// Modified by Sekar Nagarajan (2026-09-01 14:12)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Input, Row, Select, Space, Switch, Typography } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { ensSchema, type EnsData } from "../types/booking.types";

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

export function ENSStep() {
  const toast = useToast();
  const { payload, updateEns, clearEns, nextStep, prevStep } = useBookingStore();
  const [validatingEori, setValidatingEori] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    reset,
  } = useForm<EnsData>({
    // Modified by Sekar Nagarajan (2026-08-27 18:41)
    resolver: zodResolver(ensSchema) as Resolver<EnsData>,
    defaultValues: payload.ens || defaults,
  });

  const euCustomsZone = watch("euCustomsZone");

  useEffect(() => {
    if (payload.ens) reset({ ...defaults, ...payload.ens });
  }, [payload.ens, reset]);

  const onSubmit = (data: EnsData) => {
    updateEns(data);
    nextStep();
  };

  const handleSkip = () => {
    clearEns();
    nextStep();
  };

  const handleValidateEori = async () => {
    const eori = (getValues("declarantEori") || "").trim();
    if (!eori) {
      toast.error("Enter a Declarant EORI first");
      return;
    }
    setValidatingEori(true);
    try {
      const result = await bookingApi.validateEori(eori);
      if (result.valid) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error("EORI validation failed");
    } finally {
      setValidatingEori(false);
    }
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
            <Col xs={24} md={6}>
              <label className="form-field-label">EU Customs Zone</label>
              {/* Modified by Sekar Nagarajan (2026-09-01 14:12) — Switch Yes/No */}
              <Controller
                control={control}
                name="euCustomsZone"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    checked={Boolean(value)}
                    onChange={onChange}
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                )}
              />
            </Col>
            <Col xs={24} md={6}>
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
            <Col xs={24} md={6}>
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
            <Col xs={24} md={6}>
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
                <Col xs={24} md={8}>
                  <label className="form-field-label">Name</label>
                  <Controller
                    control={control}
                    name="declarantName"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col xs={24} md={16}>
                  <label className="form-field-label">Address</label>
                  <Controller
                    control={control}
                    name="declarantAddress"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">City</label>
                  <Controller
                    control={control}
                    name="declarantCity"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">Country</label>
                  <Controller
                    control={control}
                    name="declarantCountry"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <label className="form-field-label">EORI</label>
                  <Space.Compact className="form-field-full-width">
                    <Controller
                      control={control}
                      name="declarantEori"
                      render={({ field }) => <Input {...field} size="large" />}
                    />
                    <AppButton loading={validatingEori} onClick={handleValidateEori}>
                      Validate
                    </AppButton>
                  </Space.Compact>
                </Col>
                <Col xs={24} md={4}>
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
              <Col xs={24} md={12}>
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
              <Col xs={24} md={12}>
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

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">
          Next
        </AppButton>
        <AppButton type="link" onClick={handleSkip}>
          Skip
        </AppButton>
      </div>
    </form>
  );
}
