// Modified by Sekar Nagarajan (2026-08-26 11:10)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import {
    Card,
    Checkbox,
    Col,
    Input,
    InputNumber,
    Row,
    Select,
    Typography,
} from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBookingStore } from "../stores/booking.store";
import { cargoSchema, type CargoData } from "../types/booking.types";

const { Text } = Typography;

const COMMODITIES = [
  { value: "GEN-CGO", label: "GEN-CGO - General Freight / Merchandise" },
  {
    value: "AUTO-PARTS",
    label: "AUTO-PARTS - Automotive Spare Parts & Machinery",
  },
];

const EQUIPMENT_TYPES = [
  { value: "20' Standard Dry", label: "20' Standard Dry (20DV)" },
  { value: "40' High Cube Dry", label: "40' High Cube Dry (40HC)" },
];

export function CargoStep() {
  const { payload, updateCargo, nextStep, prevStep } = useBookingStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(cargoSchema),
    defaultValues: payload.cargo || {
      commodity: "",
      containerType: "",
      containerCount: 1,
      totalWeightKg: 1000,
      isLcl: false,
      packageType: "",
      isDangerousGoods: false,
      unNumber: "",
      dgClass: "",
      flashPoint: "",
      marinePollutant: false,
      shippingName: "",
      isReefer: false,
      setTemp: undefined,
      minTemp: undefined,
      maxTemp: undefined,
      tempUnit: "Celsius",
      volume: undefined,
      isOog: false,
      olForward: undefined,
      owLeft: undefined,
      oh: undefined,
      olAft: undefined,
      owRight: undefined,
      dimensionUnit: "CM",
    },
  });

  const isLcl = watch("isLcl");
  const isDg = watch("isDangerousGoods");
  const isReefer = watch("isReefer");
  const isOog = watch("isOog");

  useEffect(() => {
    if (payload.cargo) reset(payload.cargo);
  }, [payload.cargo, reset]);

  const onSubmit = (data: CargoData) => {
    updateCargo(data);
    nextStep();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <label className="form-field-label">
                Commodity <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="commodity"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    options={COMMODITIES}
                    placeholder="Select Commodity"
                    className="form-field-full-width"
                  />
                )}
              />
              {errors.commodity && (
                <Text type="danger" className="form-field-error">
                  {errors.commodity.message as string}
                </Text>
              )}
            </Col>

            <Col xs={24} md={12}>
              <label className="form-field-label">
                Equipment Description <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="containerType"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    options={EQUIPMENT_TYPES}
                    placeholder="Select Equipment"
                    className="form-field-full-width"
                  />
                )}
              />
              {errors.containerType && (
                <Text type="danger" className="form-field-error">
                  {errors.containerType.message as string}
                </Text>
              )}
            </Col>

            <Col xs={24} md={12}>
              <label className="form-field-label">
                Container Count <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="containerCount"
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1}
                    max={100}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
              {errors.containerCount && (
                <Text type="danger" className="form-field-error">
                  {errors.containerCount.message as string}
                </Text>
              )}
            </Col>

            <Col xs={24} md={12}>
              <label className="form-field-label">
                Total Weight (kg) <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name="totalWeightKg"
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={100}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
              {errors.totalWeightKg && (
                <Text type="danger" className="form-field-error">
                  {errors.totalWeightKg.message as string}
                </Text>
              )}
            </Col>
          </Row>

          <div className="form-step-card form-step-section">
            <Card size="small" className="form-step-card">
              <Row gutter={[24, 24]}>
                <Col xs={12} md={6}>
                  <Controller
                    control={control}
                    name="isLcl"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      >
                        <b>LCL</b>
                      </Checkbox>
                    )}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Controller
                    control={control}
                    name="isDangerousGoods"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      >
                        <b>Hazardous</b>
                      </Checkbox>
                    )}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Controller
                    control={control}
                    name="isReefer"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      >
                        <b>Reefer</b>
                      </Checkbox>
                    )}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Controller
                    control={control}
                    name="isOog"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      >
                        <b>OOG</b>
                      </Checkbox>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </div>

          {isLcl && (
            <Card
              size="small"
              title="LCL Details"
              className="form-step-card form-step-section"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <label className="form-field-label">
                    Package Type <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="packageType"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="e.g. Pallets"
                        size="large"
                      />
                    )}
                  />
                  {errors.packageType && (
                    <Text type="danger" className="form-field-error">
                      {errors.packageType.message as string}
                    </Text>
                  )}
                </Col>
              </Row>
            </Card>
          )}

          {isDg && (
            <Card
              size="small"
              title="DG Details"
              className="form-step-card form-step-section"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <label className="form-field-label">
                    UN No <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="unNumber"
                    render={({ field }) => (
                      <Input {...field} placeholder="e.g. 1993" size="large" />
                    )}
                  />
                  {errors.unNumber && (
                    <Text type="danger" className="form-field-error">
                      {errors.unNumber.message as string}
                    </Text>
                  )}
                </Col>
                <Col xs={24} md={8}>
                  <label className="form-field-label">
                    DG Class <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="dgClass"
                    render={({ field }) => (
                      <Input {...field} placeholder="e.g. 3" size="large" />
                    )}
                  />
                  {errors.dgClass && (
                    <Text type="danger" className="form-field-error">
                      {errors.dgClass.message as string}
                    </Text>
                  )}
                </Col>
                <Col xs={24} md={8}>
                  <label className="form-field-label">Flash Point</label>
                  <Controller
                    control={control}
                    name="flashPoint"
                    render={({ field }) => (
                      <Input {...field} placeholder="e.g. 23 C" size="large" />
                    )}
                  />
                </Col>
                <Col xs={24} md={16}>
                  <label className="form-field-label">Shipping Name</label>
                  <Controller
                    control={control}
                    name="shippingName"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Proper shipping name"
                        size="large"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Controller
                    control={control}
                    name="marinePollutant"
                    render={({ field: { value, onChange, ...field } }) => (
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      >
                        Marine Pollutant
                      </Checkbox>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {isReefer && (
            <Card
              size="small"
              title="Reefer Details"
              className="form-step-card form-step-section"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                  <label className="form-field-label">
                    Set Temp <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="setTemp"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                  {errors.setTemp && (
                    <Text type="danger" className="form-field-error">
                      {errors.setTemp.message as string}
                    </Text>
                  )}
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">Min Temp</label>
                  <Controller
                    control={control}
                    name="minTemp"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">Max Temp</label>
                  <Controller
                    control={control}
                    name="maxTemp"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">
                    Temp Unit <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="tempUnit"
                    render={({ field }) => (
                      <Select
                        {...field}
                        size="large"
                        options={[
                          { value: "Celsius", label: "Celsius" },
                          { value: "Fahrenheit", label: "Fahrenheit" },
                        ]}
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {isOog && (
            <Card
              size="small"
              title="OOG Details"
              className="form-step-card form-step-section"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                  <label className="form-field-label">
                    Dimension Unit <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="dimensionUnit"
                    render={({ field }) => (
                      <Select
                        {...field}
                        size="large"
                        options={[
                          { value: "CM", label: "CM" },
                          { value: "IN", label: "IN" },
                        ]}
                        className="form-field-full-width"
                      />
                    )}
                  />
                  {errors.dimensionUnit && (
                    <Text type="danger" className="form-field-error">
                      {errors.dimensionUnit.message as string}
                    </Text>
                  )}
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">OL Forward</label>
                  <Controller
                    control={control}
                    name="olForward"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">OL Aft</label>
                  <Controller
                    control={control}
                    name="olAft"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">OW Left</label>
                  <Controller
                    control={control}
                    name="owLeft"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">OW Right</label>
                  <Controller
                    control={control}
                    name="owRight"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <label className="form-field-label">OH</label>
                  <Controller
                    control={control}
                    name="oh"
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        size="large"
                        className="form-field-full-width"
                      />
                    )}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">
          Next
        </AppButton>
      </div>
    </form>
  );
}
