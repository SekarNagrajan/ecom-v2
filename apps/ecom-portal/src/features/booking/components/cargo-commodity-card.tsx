// Modified by Sekar Nagarajan (2026-09-01 16:00)
import {
    Col,
    Flex,
    Input,
    InputNumber,
    Row,
    Select,
    Switch,
    Typography,
} from "antd";
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
import {
    FORM_YES_NO_SWITCH_CLASS,
    yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
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
}

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
}: CargoCommodityCardProps) {
  const path = (field: string) => `containers.${ci}.commodities.${mi}.${field}`;

  return (
    <section className="booking-cargo-commodity-card">
      <div className="booking-cargo-commodity-card__header">
        <Text strong>Commodity {mi + 1}</Text>
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

      <Row gutter={[24, 24]}>
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Commodity <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.hsCode`}
              render={({ field }) => (
                <HsCodeAutoComplete
                  value={field.value}
                  commodityName={commodityName}
                  onChange={field.onChange}
                  onClearName={() => {
                    setValue(
                      `containers.${ci}.commodities.${mi}.commodity`,
                      "",
                      { shouldDirty: true },
                    );
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
        </Col>
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Package Type <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.packageType`}
              render={({ field }) => (
                <Select
                  {...field}
                  size="large"
                  options={packageTypes}
                  placeholder="Select Package Type"
                  className="form-field-full-width"
                  showSearch
                  optionFilterProp="label"
                  allowClear
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
              name={`containers.${ci}.commodities.${mi}.packageQuantity`}
              render={({ field }) => (
                <QuantityStepper
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                />
              )}
            />
            {cargoFieldError(errors, path("packageQuantity")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("packageQuantity"))}
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
              name={`containers.${ci}.commodities.${mi}.weight`}
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
            {cargoFieldError(errors, path("weight")) ? (
              <Text type="danger" className="form-field-error">
                {cargoFieldError(errors, path("weight"))}
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
              name={`containers.${ci}.commodities.${mi}.volume`}
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
        <Col {...RESPONSIVE_COL.formSixth}>
          <div className="form-field-cell">
            <label className="form-field-label">Hazardous</label>
            <Controller
              control={control}
              name={`containers.${ci}.commodities.${mi}.isDangerousGoods`}
              render={({ field: { value, onChange } }) => (
                <Flex
                  align="center"
                  gap={6}
                  className="booking-cargo-commodity-card__hazardous-check"
                >
                  {/* Modified by Sekar Nagarajan (2026-09-01 16:00) — yes/no switch tick + cancel icons */}
                  <Switch
                    size="medium"
                    className={FORM_YES_NO_SWITCH_CLASS}
                    checked={value}
                    onChange={onChange}
                    {...yesNoSwitchInner}
                  />
                </Flex>
              )}
            />
          </div>
        </Col>
      </Row>

      {isDangerousGoods ? (
        <Row gutter={[24, 24]} className="form-step-section">
          <Col {...RESPONSIVE_COL.formSixth}>
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
              {cargoFieldError(errors, path("unNumber")) ? (
                <Text type="danger" className="form-field-error">
                  {cargoFieldError(errors, path("unNumber"))}
                </Text>
              ) : null}
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.formQuarter}>
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
          </Col>
          <Col {...RESPONSIVE_COL.formSixth}>
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
          </Col>
          <Col {...RESPONSIVE_COL.formSixth}>
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
          </Col>
          <Col
            {...RESPONSIVE_COL.formQuarter}
            className="booking-cargo-commodity-card__checkbox-col"
          >
            <div className="form-field-cell">
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
          </Col>
        </Row>
      ) : null}
    </section>
  );
}
