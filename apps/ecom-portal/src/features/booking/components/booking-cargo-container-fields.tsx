// Modified by Sekar Nagarajan (2026-09-17 23:28)
import {
  Col,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import {
  applyContainerTypeToMockNo,
  type CargoData,
} from "../types/booking.types";
import { isReeferContainerType } from "../utils/booking-cargo-completeness";
import { cargoFieldError } from "../utils/cargo-field-error";
import { defaultTareWeightKg } from "../utils/default-tare-weight";
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

function FieldHint({ title }: { title: string }) {
  return (
    <Tooltip title={title}>
      <span className="booking-cargo-field-hint">
        <AppIcon icon={Icons.info} size={13} />
      </span>
    </Tooltip>
  );
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
  const { t } = useTranslation(["booking", "common"]);
  const containerType = watch(`containers.${ci}.containerType`);
  const reeferMode = watch(`containers.${ci}.reeferMode`);
  const isOog = watch(`containers.${ci}.isOog`);
  const isSoc = watch(`containers.${ci}.isSoc`);
  const dimensionUnit = watch(`containers.${ci}.dimensionUnit`) || "CM";
  const dimSuffix = String(dimensionUnit).toLowerCase();
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
            {t("wizard.cargo.containerTypeRequired")} <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.containerType`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={containerTypes}
                placeholder={t("wizard.cargo.containerTypePlaceholder")}
                className="form-field-full-width"
                showSearch
                optionFilterProp="label"
                onChange={(value: string) => {
                  field.onChange(value);
                  setValue(
                    `containers.${ci}.containerNo`,
                    applyContainerTypeToMockNo(
                      watch(`containers.${ci}.containerNo`),
                      value,
                    ),
                  );
                  // Modified by Sekar Nagarajan (2026-09-17 23:28) — JSP getTareweight on eqp change
                  const tare = defaultTareWeightKg(value);
                  if (tare != null) {
                    setValue(`containers.${ci}.tareWeight`, tare);
                  }
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
          <label className="form-field-label">{t("wizard.cargo.containerNo")}</label>
          <Controller
            control={control}
            name={`containers.${ci}.containerNo`}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                size="large"
                placeholder={t("wizard.cargo.containerNo")}
                className="form-field-full-width"
              />
            )}
          />
        </div>

        <div className="form-field-cell booking-cargo-container-row__qty">
          <label className="form-field-label">
            {t("wizard.cargo.quantity")} <Text type="danger">*</Text>
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
          <label className="form-field-label">{t("wizard.cargo.equipmentStatus")}</label>
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
          <label className="form-field-label">{t("wizard.cargo.tareWeight")}</label>
          <Controller
            control={control}
            name={`containers.${ci}.tareWeight`}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                size="large"
                className="form-field-full-width"
                placeholder="0"
                addonAfter={t("wizard.cargo.units.kg")}
                // JSP: tare readonly unless SOC — carrier equipment uses master tare
                readOnly={!isSoc}
              />
            )}
          />
        </div>

        <div className="form-field-cell booking-cargo-container-row__switch">
          <label className="form-field-label">
            {t("wizard.cargo.soc")} <FieldHint title={t("wizard.cargo.socHint")} />
          </label>
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
          <label className="form-field-label">
            {t("wizard.cargo.oogLabel")} <FieldHint title={t("wizard.cargo.oogHint")} />
          </label>
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
            <label className="form-field-label">
              {t("wizard.cargo.norLabel")} <FieldHint title={t("wizard.cargo.norHint")} />
            </label>
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
        <div className="booking-cargo-detail__section booking-cargo-detail__section--oog">
          <div className="booking-cargo-detail__section-head">
            <Text strong className="booking-cargo-detail__section-title">
              {t("wizard.cargo.reefer.title")}
            </Text>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              <div className="form-field-cell" style={{ marginTop: -3 }}>
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
            </Col>
            <Col xs={24} md={6}>
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
            </Col>
            <Col xs={24} md={6}>
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
            </Col>
            <Col xs={24} md={6}>
              <div className="form-field-cell" style={{ marginTop: -3 }}>
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
            </Col>
          </Row>
        </div>
      ) : null}

      {isOog ? (
        <div className="booking-cargo-detail__section booking-cargo-detail__section--oog">
          <div className="booking-cargo-detail__section-head">
            <Text strong className="booking-cargo-detail__section-title">
              {t("wizard.cargo.oog.title")}
            </Text>
            <Tag color="purple" className="booking-cargo-detail__section-tag">
              OOG
            </Tag>
            <FieldHint title={t("wizard.cargo.oog.hint")} />
          </div>
          <div className="booking-oog-form-grid">
            <div className="form-field-cell" style={{ marginTop: -3 }}>
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
                    addonAfter={dimSuffix}
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
                    addonAfter={dimSuffix}
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
                    addonAfter={dimSuffix}
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
                    addonAfter={dimSuffix}
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
                    addonAfter={dimSuffix}
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
