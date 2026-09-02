// Created by Sekar Nagarajan (2026-09-02 11:27)
import { Col, Input, InputNumber, Row, Select, Switch, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import type { CargoData } from "../types/booking.types";
import { isReeferContainerType } from "../utils/booking-cargo-completeness";
import { cargoFieldError } from "../utils/cargo-field-error";
import { QuantityStepper } from "./quantity-stepper";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

interface BookingCargoContainerFieldsProps {
  control: Control<CargoData>;
  containerIndex: number;
  errors: Record<string, unknown>;
  containerTypes: LookupOpt[];
  watch: UseFormWatch<CargoData>;
  setValue: UseFormSetValue<CargoData>;
}

/** Container-level fields + conditional reefer / OOG blocks for the expanded panel. */
export function BookingCargoContainerFields({
  control,
  containerIndex: ci,
  errors,
  containerTypes,
  watch,
  setValue,
}: BookingCargoContainerFieldsProps) {
  const containerType = watch(`containers.${ci}.containerType`);
  const reeferMode = watch(`containers.${ci}.reeferMode`);
  const isOog = watch(`containers.${ci}.isOog`);
  const showReeferMode = isReeferContainerType(containerType);

  return (
    <>
      <div
        className={[
          "booking-cargo-container-row",
          "si-cargo-editor-fields",
          "si-cargo-editor-fields--booking",
          showReeferMode ? "booking-cargo-container-row--with-nor" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="form-field-cell">
          <label className="form-field-label">
            Container Type <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.containerType`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={containerTypes}
                placeholder="Select Container Type"
                className="form-field-full-width"
                showSearch
                optionFilterProp="label"
                onChange={(value: string) => {
                  field.onChange(value);
                  if (!isReeferContainerType(value)) {
                    setValue(`containers.${ci}.reeferMode`, "none");
                  } else if (reeferMode === "none") {
                    setValue(`containers.${ci}.reeferMode`, "operating");
                  }
                }}
              />
            )}
          />
          {cargoFieldError(errors, `containers.${ci}.containerType`) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, `containers.${ci}.containerType`)}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell">
          <label className="form-field-label">Container No</label>
          <Controller
            control={control}
            name={`containers.${ci}.containerNo`}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                size="large"
                placeholder="Container No."
                className="form-field-full-width"
              />
            )}
          />
        </div>

        <div className="form-field-cell booking-cargo-container-row__qty">
          <label className="form-field-label">
            Quantity <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.quantity`}
            render={({ field }) => (
              <QuantityStepper
                value={field.value}
                onChange={field.onChange}
                min={1}
                max={100}
              />
            )}
          />
        </div>

        <div className="form-field-cell">
          <label className="form-field-label">Eqp. Status</label>
          <Controller
            control={control}
            name={`containers.${ci}.eqpStatus`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  { value: "LADEN", label: "LADEN" },
                  { value: "EMPTY", label: "EMPTY" },
                ]}
                className="form-field-full-width"
              />
            )}
          />
        </div>

        <div className="form-field-cell">
          <label className="form-field-label">Tare Weight</label>
          <Controller
            control={control}
            name={`containers.${ci}.tareWeight`}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                size="large"
                className="form-field-full-width"
                placeholder="kg"
              />
            )}
          />
        </div>

        <div className="form-field-cell booking-cargo-container-row__switch">
          <label className="form-field-label">SOC</label>
          <div className="form-yes-no-switch-wrap">
            <Controller
              control={control}
              name={`containers.${ci}.isSoc`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  className={FORM_YES_NO_SWITCH_CLASS}
                  checked={value}
                  onChange={onChange}
                  {...yesNoSwitchInner}
                />
              )}
            />
          </div>
        </div>

        <div className="form-field-cell booking-cargo-container-row__switch">
          <label className="form-field-label">OOG</label>
          <div className="form-yes-no-switch-wrap">
            <Controller
              control={control}
              name={`containers.${ci}.isOog`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  className={FORM_YES_NO_SWITCH_CLASS}
                  checked={value}
                  onChange={onChange}
                  {...yesNoSwitchInner}
                />
              )}
            />
          </div>
        </div>

        {showReeferMode ? (
          <div className="form-field-cell booking-cargo-container-row__switch">
            <label className="form-field-label">NOR</label>
            <div className="form-yes-no-switch-wrap">
              <Controller
                control={control}
                name={`containers.${ci}.reeferMode`}
                render={({ field }) => (
                  <Switch
                    className={FORM_YES_NO_SWITCH_CLASS}
                    checked={field.value === "nor"}
                    onChange={(checked) =>
                      field.onChange(checked ? "nor" : "operating")
                    }
                    {...yesNoSwitchInner}
                  />
                )}
              />
            </div>
          </div>
        ) : null}
      </div>

      {showReeferMode && reeferMode !== "nor" ? (
        <div className="booking-cargo-detail__section">
          <Text strong className="booking-cargo-detail__section-title">
            Reefer Details
          </Text>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              <div className="form-field-cell" style={{ marginTop: -5 }}>
                <label className="form-field-label">
                  Set Temp <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name={`containers.${ci}.setTemp`}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      size="large"
                      className="form-field-full-width"
                    />
                  )}
                />
                {cargoFieldError(errors, `containers.${ci}.setTemp`) ? (
                  <Text type="danger" className="form-field-error">
                    {cargoFieldError(errors, `containers.${ci}.setTemp`)}
                  </Text>
                ) : null}
              </div>
            </Col>
            <Col xs={24} md={6}>
              <label className="form-field-label">Min Temp</label>
              <Controller
                control={control}
                name={`containers.${ci}.minTemp`}
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
                name={`containers.${ci}.maxTemp`}
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
              <div className="form-field-cell" style={{ marginTop: -6 }}>
                <label className="form-field-label">
                  Temp Unit <Text type="danger">*</Text>
                </label>
                <Controller
                  control={control}
                  name={`containers.${ci}.tempUnit`}
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
              </div>
            </Col>
          </Row>
        </div>
      ) : null}

      {isOog ? (
        <div className="booking-cargo-detail__section">
          <Text strong className="booking-cargo-detail__section-title">
            OOG Details
          </Text>
          <div className="booking-oog-form-grid">
            <div className="form-field-cell" style={{ marginTop: -3 }}>
              <label className="form-field-label">
                Dimension Unit <Text type="danger">*</Text>
              </label>
              <Controller
                control={control}
                name={`containers.${ci}.dimensionUnit`}
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
            </div>
            <div className="form-field-cell">
              <label className="form-field-label">OL Forward</label>
              <Controller
                control={control}
                name={`containers.${ci}.olForward`}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
            </div>
            <div className="form-field-cell">
              <label className="form-field-label">OL Aft</label>
              <Controller
                control={control}
                name={`containers.${ci}.olAft`}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
            </div>
            <div className="form-field-cell">
              <label className="form-field-label">OW Left</label>
              <Controller
                control={control}
                name={`containers.${ci}.owLeft`}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
            </div>
            <div className="form-field-cell">
              <label className="form-field-label">OW Right</label>
              <Controller
                control={control}
                name={`containers.${ci}.owRight`}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
            </div>
            <div className="form-field-cell">
              <label className="form-field-label">OH</label>
              <Controller
                control={control}
                name={`containers.${ci}.oh`}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    size="large"
                    className="form-field-full-width"
                  />
                )}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
