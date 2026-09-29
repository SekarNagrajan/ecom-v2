// Modified by Sekar Nagarajan (2026-09-02 16:43)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { Flex, Input, InputNumber, Select, Switch, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

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

function modalTitle(
  target: BookingCargoGridExtrasTarget | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (!target) return t("wizard.cargo.containerDetails");
  if (target.kind === "oog") return t("wizard.cargo.oog.title");
  if (target.kind === "reefer") return t("wizard.cargo.reefer.title");
  return t("wizard.cargo.dg.titleCommodity", { n: target.commodityIndex + 1 });
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
  const { t } = useTranslation(["booking", "common"]);
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
          {modalTitle(target, t)}
        </Title>
      }
      footer={
        <AppButton type="primary" onClick={onClose}>
          {t("wizard.cargo.done")}
        </AppButton>
      }
    >
      {target?.kind === "oog" ? (
        <div className="booking-cargo-grid-extras-modal-fields">
          <div className="form-field-cell">
            <label className="form-field-label">
              {t("wizard.cargo.oog.dimensionUnit")} <Text type="danger">*</Text>
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
            <label className="form-field-label">{t("wizard.cargo.oog.olForward")}</label>
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
            <label className="form-field-label">{t("wizard.cargo.oog.olAft")}</label>
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
            <label className="form-field-label">{t("wizard.cargo.oog.owLeft")}</label>
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
            <label className="form-field-label">{t("wizard.cargo.oog.owRight")}</label>
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
            <label className="form-field-label">{t("wizard.cargo.oog.overheight")}</label>
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
              {t("wizard.cargo.reefer.setTemp")} <Text type="danger">*</Text>
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
            <label className="form-field-label">{t("wizard.cargo.reefer.minTemp")}</label>
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
            <label className="form-field-label">{t("wizard.cargo.reefer.maxTemp")}</label>
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
              {t("wizard.cargo.reefer.tempUnit")} <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.tempUnit`}
              render={({ field }) => (
                <Select
                  {...field}
                  size="large"
                  options={[
                    {
                      value: "Celsius",
                      label: t("wizard.cargo.reefer.celsius"),
                    },
                    {
                      value: "Fahrenheit",
                      label: t("wizard.cargo.reefer.fahrenheit"),
                    },
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
              {t("wizard.cargo.dg.unNo")} <Text type="danger">*</Text>
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
              {t("wizard.cargo.dg.dgClass")} <Text type="danger">*</Text>
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
                  placeholder={t("wizard.cargo.dg.dgClassPlaceholder")}
                />
              )}
            />
          </div>
          <div className="form-field-cell">
            <label className="form-field-label">{t("wizard.cargo.dg.flashPoint")}</label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.flashPoint`}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder={t("wizard.cargo.dg.flashPointPlaceholder")}
                  className="form-field-full-width"
                />
              )}
            />
          </div>
          <div className="form-field-cell">
            <label className="form-field-label">{t("wizard.cargo.dg.shippingName")}</label>
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
                  <Text>{t("wizard.cargo.dg.marinePollutant")}</Text>
                </Flex>
              )}
            />
          </div>
        </div>
      ) : null}
    </AppModal>
  );
}
