// Modified by Sekar Nagarajan (2026-08-28 17:54)
import { Input, InputNumber, Select, Typography } from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { HsCodeAutoComplete } from "../../booking/components/cargo-code-lookups";
import { QuantityStepper } from "../../booking/components/quantity-stepper";
import { cargoFieldError } from "../../booking/utils/cargo-field-error";
import type { SiCargoStepForm } from "../types/si.types";

const { Text } = Typography;
const { TextArea } = Input;

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

/** Commodity card — wider HS code; Quantity + Weight grouped tightly. */
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
  const path = (field: string) => `containers.${ci}.cargoLines.${mi}.${field}`;

  return (
    <div className="si-cargo-sitem">
      <div className="si-cargo-sitem__head">
        <Text type="secondary" className="form-field-label">
          Commodity {mi + 1}
        </Text>
        <ListActionsRow>
          <ListActionButton
            title="Copy Commodity"
            icon={<AppIcon icon={Icons.copy} size={16} tone="view" />}
            onClick={onCopy}
          />
          <ListActionButton
            title={
              canRemove
                ? "Delete Commodity"
                : "At Least One Commodity Is Required"
            }
            icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
            tone="delete"
            disabled={!canRemove}
            onClick={onRemove}
          />
        </ListActionsRow>
      </div>

      <div className="si-cargo-sitem__grid">
        {/* Row 1 — HS spans 2; Package; Quantity+Weight cluster */}
        <div className="form-field-cell si-cargo-sitem__hs">
          <label className="form-field-label">
            HS code <Text type="danger">*</Text>
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
            Package Type <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.packageType`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={packageTypes}
                placeholder="Package Type"
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

        <div className="si-cargo-sitem__measures">
          <div className="form-field-cell si-cargo-sitem__narrow">
            <label className="form-field-label">
              Quantity <Text type="danger">*</Text>
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
              Weight (kg) <Text type="danger">*</Text>
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
                  addonAfter="kg"
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
        </div>

        {/* Row 2 — description | marks */}
        <div className="form-field-cell si-cargo-sitem__half">
          <label className="form-field-label">
            Commodity Description <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.description`}
            render={({ field }) => (
              <TextArea
                {...field}
                value={field.value ?? ""}
                size="large"
                rows={3}
                placeholder="Commodity Description"
                className="form-field-full-width"
                status={
                  cargoFieldError(errors, path("description"))
                    ? "error"
                    : undefined
                }
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
          <label className="form-field-label">Marks & numbers</label>
          <Controller
            control={control}
            name={`containers.${ci}.cargoLines.${mi}.marksAndNumbers`}
            render={({ field }) => (
              <TextArea
                {...field}
                value={field.value ?? ""}
                size="large"
                rows={3}
                placeholder="Marks & numbers"
                className="form-field-full-width"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
