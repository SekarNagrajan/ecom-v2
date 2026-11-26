// Modified by Sekar Nagarajan (2026-09-11 18:25)
import { AppTextarea } from "@solverminds/shared-ui";
import { InputNumber, Select, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAiTextAssist } from "../../ai-assist";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { HsCodeAutoComplete } from "../../booking/components/cargo-code-lookups";
import { QuantityStepper } from "../../booking/components/quantity-stepper";
import { cargoFieldError } from "../../booking/utils/cargo-field-error";
import type { SiCargoStepForm } from "../types/si.types";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

interface SiCargoLineCardProps {
  control: Control<SiCargoStepForm>;
  containerIndex: number;
  lineIndex: number;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  commodityName?: string;
  setValue: UseFormSetValue<SiCargoStepForm>;
  onCopy: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

/** Cargo line card — row1: HS/Package/Qty/Weight; row2: Description/Marks. */
export function SiCargoLineCard({
  control,
  containerIndex: ci,
  lineIndex: mi,
  errors,
  packageTypes,
  commodityName = "",
  setValue,
  onCopy,
  onRemove,
  canRemove,
}: SiCargoLineCardProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const { textareaAssistProps } = useAiTextAssist();

  const path = (field: string) => `containers.${ci}.cargoLines.${mi}.${field}`;

  return (
    <div className="si-cargo-sitem">
      <div className="si-cargo-sitem__head">
        <Text type="secondary" className="form-field-label">
          {t("wizard.cargo.fields.lineTitle", { n: mi + 1 })}
        </Text>
        <ListActionsRow>
          <ListActionButton
            title={t("wizard.cargo.actions.copyLine")}
            icon={<AppIcon icon={Icons.copy} size={16} tone="view" />}
            onClick={onCopy}
          />
          <ListActionButton
            title={
              canRemove
                ? t("wizard.cargo.actions.deleteLine")
                : t("wizard.cargo.actions.minCommodityTooltip")
            }
            icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
            tone="delete"
            disabled={!canRemove}
            onClick={onRemove}
          />
        </ListActionsRow>
      </div>

      <div className="si-cargo-sitem__grid">
        <div className="form-field-cell si-cargo-sitem__hs">
          <label className="form-field-label">
            {t("wizard.cargo.fields.hsCode")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.hsCode`}
            render={({ field }) => (
              <HsCodeAutoComplete
                value={field.value}
                commodityName={commodityName}
                onChange={field.onChange}
                onClearName={() => {
                  setValue(
                    `containers.${ci}.cargoLines.${mi}.commodityCode`,
                    "",
                    { shouldDirty: true },
                  );
                  setValue(
                    `containers.${ci}.cargoLines.${mi}.description`,
                    "",
                    { shouldDirty: true },
                  );
                }}
                onSelectOption={(opt) => {
                  field.onChange(opt.code);
                  setValue(
                    `containers.${ci}.cargoLines.${mi}.commodityCode`,
                    opt.desc,
                    { shouldDirty: true },
                  );
                  setValue(
                    `containers.${ci}.cargoLines.${mi}.description`,
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

        <div className="form-field-cell">
          <label className="form-field-label">
            {t("wizard.cargo.fields.packageType")}{" "}
            <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.packageType`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={packageTypes}
                placeholder={t("wizard.cargo.fields.packageType")}
                className="form-field-full-width"
                showSearch
                optionFilterProp="label"
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

        <div className="form-field-cell si-cargo-sitem__narrow">
          <label className="form-field-label">
            {t("wizard.cargo.fields.quantity")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.packageCount`}
            render={({ field }) => (
              <QuantityStepper
                value={field.value}
                onChange={(next) => field.onChange(next ?? 1)}
                min={1}
              />
            )}
          />
          {cargoFieldError(errors, path("packageCount")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("packageCount"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__narrow">
          <label className="form-field-label">
            {t("wizard.cargo.fields.weightKg")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.grossWeight`}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                size="large"
                className="form-field-full-width"
                addonAfter={t("wizard.cargo.list.kg")}
                status={
                  cargoFieldError(errors, path("grossWeight"))
                    ? "error"
                    : undefined
                }
              />
            )}
          />
          {cargoFieldError(errors, path("grossWeight")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("grossWeight"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__half">
          <label className="form-field-label">
            {t("wizard.cargo.fields.commodityDescription")}{" "}
            <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.description`}
            render={({ field }) => (
              <AppTextarea
                {...field}
                value={field.value ?? ""}
                size="large"
                rows={3}
                placeholder={t("wizard.cargo.fields.commodityDescription")}
                className="form-field-full-width"
                status={
                  cargoFieldError(errors, path("description"))
                    ? "error"
                    : undefined
                }
                {...textareaAssistProps}
              />
            )}
          />
          {cargoFieldError(errors, path("description")) ? (
            <Text type="danger" className="form-field-error">
              {cargoFieldError(errors, path("description"))}
            </Text>
          ) : null}
        </div>

        <div className="form-field-cell si-cargo-sitem__half">
          <label className="form-field-label">
            {t("wizard.cargo.fields.marksAndNumbers")}
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.marksAndNumbers`}
            render={({ field }) => (
              <AppTextarea
                {...field}
                value={field.value ?? ""}
                size="large"
                rows={3}
                placeholder={t("wizard.cargo.fields.marksAndNumbers")}
                className="form-field-full-width"
                {...textareaAssistProps}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
