// Modified by Sekar Nagarajan (2026-09-11 11:49)
import { Flex, Input, InputNumber, Select, Switch, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import type { CargoData } from "../types/booking.types";
import { cargoFieldError } from "../utils/cargo-field-error";
import { HsCodeAutoComplete, UnNumberAutoComplete } from "./cargo-code-lookups";
import { QuantityStepper } from "./quantity-stepper";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

interface CargoCommodityCardProps {
  control: Control<CargoData>;
  containerIndex: number;
  commodityIndex: number;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  dgClasses: LookupOpt[];
  isDangerousGoods: boolean;
  /** Paired commodity name shown with HS code in the combined field. */
  commodityName?: string;
  setValue: UseFormSetValue<CargoData>;
  onCopy: () => void;
  onRemove: () => void;
  canRemove: boolean;
  /** Hide Copy in review inline editor (Edit + Delete only). */
  showCopy?: boolean;
}

/** Commodity card — SI-style sitem grid with booking fields only. */
export function CargoCommodityCard({
  control,
  containerIndex: ci,
  commodityIndex: mi,
  errors,
  packageTypes,
  dgClasses,
  isDangerousGoods,
  commodityName = "",
  setValue,
  onCopy,
  onRemove,
  canRemove,
  showCopy = true,
}: CargoCommodityCardProps) {
  const { t } = useTranslation(["booking", "common"]);
  const path = (field: string) => `containers.${ci}.commodities.${mi}.${field}`;

  return (
    <div className="si-cargo-sitem">
      <div className="si-cargo-sitem__head">
        <Text type="secondary" className="form-field-label">
          {t("wizard.cargo.commodityLabel", { n: mi + 1 })}
        </Text>
        <div className="si-cargo-sitem__head-actions">
          <div className="si-cargo-sitem__hazardous">
            <label className="form-field-label">{t("wizard.cargo.hazardous")}</label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.isDangerousGoods`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  size="medium"
                  className={FORM_YES_NO_SWITCH_CLASS}
                  checked={value}
                  onChange={onChange}
                  {...yesNoSwitchInner}
                />
              )}
            />
          </div>
          <ListActionsRow>
            {showCopy ? (
              <ListActionButton
                title={t("wizard.cargo.copyCommodity")}
                icon={<AppIcon icon={Icons.copy} size={16} tone="view" />}
                onClick={onCopy}
              />
            ) : null}
            <ListActionButton
              title={
                canRemove
                  ? t("wizard.cargo.deleteCommodity")
                  : t("wizard.cargo.atLeastOneCommodityLine")
              }
              icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
              tone="delete"
              disabled={!canRemove}
              ariaLabel={
                canRemove
                  ? t("wizard.cargo.deleteCommodity")
                  : t("wizard.cargo.atLeastOneCommodityLine")
              }
              onClick={onRemove}
            />
          </ListActionsRow>
        </div>
      </div>

      <div className="si-cargo-sitem__grid si-cargo-sitem__grid--booking">
        <div className="form-field-cell si-cargo-sitem__hs">
          <label className="form-field-label">
            {t("wizard.cargo.commodity")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.commodities.${mi}.hsCode`}
            render={({ field }) => (
              <HsCodeAutoComplete
                value={field.value}
                commodityName={commodityName}
                status={
                  cargoFieldError(errors, path("hsCode")) ? "error" : undefined
                }
                onChange={field.onChange}
                onClearName={() => {
                  setValue(`containers.${ci}.commodities.${mi}.commodity`, "", {
                    shouldDirty: true,
                  });
                  setValue(
                    `containers.${ci}.commodities.${mi}.description`,
                    "",
                    { shouldDirty: true },
                  );
                }}
                onSelectOption={(opt) => {
                  field.onChange(opt.code);
                  setValue(
                    `containers.${ci}.commodities.${mi}.commodity`,
                    opt.desc,
                    { shouldDirty: true, shouldValidate: true },
                  );
                  setValue(
                    `containers.${ci}.commodities.${mi}.description`,
                    opt.desc,
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
              />
            )}
          />
          {cargoFieldError(errors, path("hsCode")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("hsCode"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__weight">
          <label className="form-field-label">
            {t("wizard.cargo.weight")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.commodities.${mi}.weight`}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                size="large"
                className="form-field-full-width"
                addonAfter={t("wizard.cargo.units.kg")}
                status={
                  cargoFieldError(errors, path("weight")) ? "error" : undefined
                }
              />
            )}
          />
          {cargoFieldError(errors, path("weight")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("weight"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__pkg">
          <label className="form-field-label">{t("wizard.cargo.packageType")}</label>
          <Controller
            control={control}
            name={`containers.${ci}.commodities.${mi}.packageType`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={packageTypes}
                placeholder={t("wizard.cargo.packageTypePlaceholder")}
                className="form-field-full-width"
                showSearch
                optionFilterProp="label"
                allowClear
                status={
                  cargoFieldError(errors, path("packageType"))
                    ? "error"
                    : undefined
                }
              />
            )}
          />
          {cargoFieldError(errors, path("packageType")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("packageType"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__qty">
          <label className="form-field-label">{t("wizard.cargo.quantity")}</label>
          <Controller
            control={control}
            name={`containers.${ci}.commodities.${mi}.packageQuantity`}
            render={({ field }) => (
              <QuantityStepper
                value={field.value}
                onChange={field.onChange}
                min={0}
              />
            )}
          />
          {cargoFieldError(errors, path("packageQuantity")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("packageQuantity"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__volume">
          <label className="form-field-label">{t("wizard.cargo.volume")}</label>
          <Controller
            control={control}
            name={`containers.${ci}.commodities.${mi}.volume`}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                size="large"
                className="form-field-full-width"
                addonAfter={t("wizard.cargo.units.m3")}
                status={
                  cargoFieldError(errors, path("volume")) ? "error" : undefined
                }
              />
            )}
          />
          {cargoFieldError(errors, path("volume")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("volume"))}
            </Text>
          ) : null}
        </div>
      </div>

      {isDangerousGoods ? (
        <div className="si-cargo-sitem__grid si-cargo-sitem__grid--booking si-cargo-sitem__dg">
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
            {cargoFieldError(errors, path("unNumber")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("unNumber"))}
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
          <div className="form-field-cell booking-cargo-commodity-card__checkbox-col">
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
    </div>
  );
}
