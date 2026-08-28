// Modified by Sekar Nagarajan (2026-08-28 12:35)
import { Card, Col, Input, InputNumber, Row, Select, Typography } from "antd";
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
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
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
    <Card
      size="small"
      className="form-step-card form-step-section booking-cargo-commodity-card"
      title={`Commodity ${mi + 1}`}
      extra={
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
      }
    >
      <Row gutter={[24, 24]}>
        <Col {...RESPONSIVE_COL.formQuarter}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Commodity <Text type="danger">*</Text>
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
        </Col>
        <Col {...RESPONSIVE_COL.formSixth}>
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
                  placeholder="Select Package Type"
                  className="form-field-full-width"
                  showSearch
                  optionFilterProp="label"
                />
              )}
            />
            {cargoFieldError(errors, path("packageType")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("packageType"))}
              </Text>
            ) : null}
          </div>
        </Col>
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Quantity <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.cargoLines.${mi}.packageCount`}
              render={({ field }) => (
                <QuantityStepper
                  value={field.value}
                  onChange={field.onChange}
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
        </Col>
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Weight <Text type="danger">*</Text>
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
                />
              )}
            />
            {cargoFieldError(errors, path("grossWeight")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("grossWeight"))}
              </Text>
            ) : null}
          </div>
        </Col>
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Volume <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.cargoLines.${mi}.volume`}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  size="large"
                  className="form-field-full-width"
                  addonAfter="m³"
                />
              )}
            />
            {cargoFieldError(errors, path("volume")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("volume"))}
              </Text>
            ) : null}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="form-step-section">
        <Col {...RESPONSIVE_COL.formHalf}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Commodity Description <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.cargoLines.${mi}.description`}
              render={({ field }) => (
                <TextArea
                  {...field}
                  size="large"
                  rows={4}
                  placeholder="Commodity Description"
                />
              )}
            />
            {cargoFieldError(errors, path("description")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("description"))}
              </Text>
            ) : null}
          </div>
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <div className="form-field-cell">
            <label className="form-field-label">Marks & No.</label>
            <Controller
              control={control}
              name={`containers.${ci}.cargoLines.${mi}.marksAndNumbers`}
              render={({ field }) => (
                <TextArea
                  {...field}
                  size="large"
                  rows={4}
                  placeholder="Marks & No."
                />
              )}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
}
