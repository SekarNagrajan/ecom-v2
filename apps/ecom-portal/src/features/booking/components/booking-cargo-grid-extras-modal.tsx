// Modified by Sekar Nagarajan (2026-09-02 12:25)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { Flex, Input, InputNumber, Select, Switch, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import type { CargoData } from "../types/booking.types";
import { cargoFieldError } from "../utils/cargo-field-error";
import { UnNumberAutoComplete } from "./cargo-code-lookups";

const { Text, Title } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

export type BookingCargoGridExtrasTarget =
  | { kind: "oog"; containerIndex: number }
  | { kind: "reefer"; containerIndex: number }
  | { kind: "dg"; containerIndex: number; commodityIndex: number };

interface BookingCargoGridExtrasModalProps {
  open: boolean;
  target: BookingCargoGridExtrasTarget | null;
  control: Control<CargoData>;
  errors: Record<string, unknown>;
  dgClasses: LookupOpt[];
  setValue: UseFormSetValue<CargoData>;
  onClose: () => void;
}

function modalTitle(target: BookingCargoGridExtrasTarget | null): string {
  if (!target) return "Container details";
  if (target.kind === "oog") return "OOG Details";
  if (target.kind === "reefer") return "Reefer Details";
  return `DG Details — Commodity ${target.commodityIndex + 1}`;
}

/** Compact popup for grid-toggled OOG / reefer / DG detail fields. */
export function BookingCargoGridExtrasModal({
  open,
  target,
  control,
  errors,
  dgClasses,
  setValue,
  onClose,
}: BookingCargoGridExtrasModalProps) {
  const ci = target?.containerIndex ?? 0;
  const mi = target?.kind === "dg" ? target.commodityIndex : 0;
  const dgPath = (field: string) =>
    `containers.${ci}.commodities.${mi}.${field}`;

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      dialogSize="sm"
      destroyOnClose
      centered
      title={
        <Title level={5} className="booking-cargo-grid-extras-modal-title">
          {modalTitle(target)}
        </Title>
      }
      footer={
        <AppButton type="primary" onClick={onClose}>
          Done
        </AppButton>
      }
    >
      {target?.kind === "oog" ? (
        <div className="booking-cargo-grid-extras-modal-fields">
          <div className="form-field-cell">
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
      ) : null}

      {target?.kind === "reefer" ? (
        <div className="booking-cargo-grid-extras-modal-fields">
          <div className="form-field-cell">
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
          <div className="form-field-cell">
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
          </div>
          <div className="form-field-cell">
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
          </div>
          <div className="form-field-cell">
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
        </div>
      ) : null}

      {target?.kind === "dg" ? (
        <div className="booking-cargo-grid-extras-modal-fields">
          <div className="form-field-cell">
            <label className="form-field-label">
              UN No <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.unNumber`}
              render={({ field }) => (
                <UnNumberAutoComplete
                  value={field.value}
                  onChange={field.onChange}
                  onSelectOption={(opt) => {
                    field.onChange(opt.un);
                    setValue(
                      `containers.${ci}.commodities.${mi}.dgClass`,
                      opt.dgClass,
                      { shouldDirty: true, shouldValidate: true },
                    );
                    setValue(
                      `containers.${ci}.commodities.${mi}.shippingName`,
                      opt.name,
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
            {cargoFieldError(errors, dgPath("unNumber")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, dgPath("unNumber"))}
              </Text>
            ) : null}
          </div>
          <div className="form-field-cell">
            <label className="form-field-label">
              DG Class <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.dgClass`}
              render={({ field }) => (
                <Select
                  {...field}
                  size="large"
                  options={dgClasses}
                  className="form-field-full-width"
                  placeholder="DG Class"
                />
              )}
            />
          </div>
          <div className="form-field-cell">
            <label className="form-field-label">Flash Point</label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.flashPoint`}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="e.g. 23 C"
                  className="form-field-full-width"
                />
              )}
            />
          </div>
          <div className="form-field-cell">
            <label className="form-field-label">Shipping Name</label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.shippingName`}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  className="form-field-full-width"
                />
              )}
            />
          </div>
          <div className="form-field-cell booking-cargo-grid-extras-modal-fields__span">
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.marinePollutant`}
              render={({ field: { value, onChange } }) => (
                <Flex align="center" gap={6}>
                  <Switch
                    size="medium"
                    className={FORM_YES_NO_SWITCH_CLASS}
                    checked={value}
                    onChange={onChange}
                    {...yesNoSwitchInner}
                  />
                  <Text>Marine Pollutant</Text>
                </Flex>
              )}
            />
          </div>
        </div>
      ) : null}
    </AppModal>
  );
}
