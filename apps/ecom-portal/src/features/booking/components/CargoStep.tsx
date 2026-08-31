// Modified by Sekar Nagarajan (2026-08-31 23:14)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Card,
  Col,
  Empty,
  InputNumber,
  Row,
  Select,
  Switch,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldErrors,
  type Resolver,
  type UseFormSetValue,
} from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { useBookingLookups } from "../api/booking.queries";
import { useBookingStore } from "../stores/booking.store";
import {
  cargoSchema,
  createEmptyCommodity,
  createEmptyContainer,
  defaultCargoData,
  migrateLegacyCargo,
  type CargoData,
  type CommodityItem,
  type ContainerItem,
} from "../types/booking.types";
import { cargoFieldError } from "../utils/cargo-field-error";
import { CargoCommodityCard } from "./cargo-commodity-card";
import { QuantityStepper } from "./quantity-stepper";

const { Text, Title } = Typography;

/** True when the selected equipment code is a reefer type (RF / RH / RE). */
function isReeferContainerType(containerType: string | undefined): boolean {
  const code = (containerType ?? "").trim().toUpperCase();
  return /RF|RH|RE/.test(code);
}

function firstContainerErrorIndex(
  formErrors: FieldErrors<CargoData>,
): number | null {
  const containers = formErrors.containers;
  if (!Array.isArray(containers)) return null;
  const idx = containers.findIndex((entry) => Boolean(entry));
  return idx >= 0 ? idx : null;
}

export function CargoStep() {
  const toast = useToast();
  const { payload, updateCargo, nextStep, prevStep } = useBookingStore();
  const { data: containerTypes = [] } = useBookingLookups("containerTypes");
  const { data: packageTypes = [] } = useBookingLookups("packageTypes");
  const { data: dgClasses = [] } = useBookingLookups("dgClasses");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CargoData>({
    resolver: zodResolver(cargoSchema) as Resolver<CargoData>,
    defaultValues: payload.cargo
      ? migrateLegacyCargo(payload.cargo)
      : defaultCargoData(),
  });

  const {
    fields: containerFields,
    append: appendContainer,
    remove: removeContainer,
    insert: insertContainer,
  } = useFieldArray({ control, name: "containers" });

  const containersWatch = watch("containers");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeSelectedIndex = Math.min(
    selectedIndex,
    Math.max(containerFields.length - 1, 0),
  );

  const onSubmit = (data: CargoData) => {
    updateCargo(data);
    nextStep();
  };

  const handleAddContainer = () => {
    appendContainer(createEmptyContainer());
    setSelectedIndex(containerFields.length);
  };

  const handleDuplicateContainer = (index: number) => {
    const source = containersWatch?.[index];
    if (!source) return;
    const copy: ContainerItem = {
      ...structuredClone(source),
      id: createEmptyContainer().id,
      commodities: source.commodities.map((c) => ({
        ...structuredClone(c),
        id: createEmptyCommodity().id,
      })),
    };
    insertContainer(index + 1, copy);
    setSelectedIndex(index + 1);
    toast.success("Container duplicated");
  };

  const handleRemoveContainer = (index: number) => {
    if (containerFields.length <= 1) {
      toast.error("At least one container is required");
      return;
    }
    removeContainer(index);
    setSelectedIndex((prev) => {
      if (prev > index) return prev - 1;
      if (prev === index) return Math.max(0, index - 1);
      return prev;
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        const errorIndex = firstContainerErrorIndex(formErrors);
        if (errorIndex !== null) setSelectedIndex(errorIndex);
      })}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <div className="booking-cargo-split">
          <aside className="booking-cargo-split__list custom-scroll">
            <div className="booking-cargo-split__list-header">
              <Text strong>Containers</Text>
              <AppButton
                size="small"
                icon={<AppIcon icon={Icons.plus} size={14} />}
                onClick={handleAddContainer}
              >
                Add
              </AppButton>
            </div>

            <ul className="booking-cargo-split__list-items">
              {containerFields.map((containerField, ci) => {
                const item = containersWatch?.[ci];
                const typeLabel =
                  containerTypes.find((t) => t.value === item?.containerType)
                    ?.label ||
                  item?.containerType ||
                  "Select type";
                const commodityCount = item?.commodities?.length ?? 0;
                const hasError = Boolean(
                  Array.isArray(errors.containers) && errors.containers[ci],
                );
                const isActive = ci === safeSelectedIndex;

                return (
                  <li key={containerField.id}>
                    <button
                      type="button"
                      className={[
                        "booking-cargo-split__item",
                        isActive
                          ? "booking-cargo-split__item--active"
                          : undefined,
                        hasError
                          ? "booking-cargo-split__item--error"
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedIndex(ci)}
                    >
                      <div className="booking-cargo-split__item-top">
                        <Text
                          strong
                          className="booking-cargo-split__item-title"
                        >
                          Container {ci + 1}
                        </Text>
                        <Text
                          type="secondary"
                          className="booking-cargo-split__item-qty"
                        >
                          ×{item?.quantity ?? 1}
                        </Text>
                      </div>
                      <Text className="booking-cargo-split__item-type">
                        {typeLabel}
                      </Text>
                      <div className="booking-cargo-split__item-meta">
                        {item?.isSoc ? <Tag>SOC</Tag> : null}
                        {item?.isOog ? <Tag color="orange">OOG</Tag> : null}
                        {isReeferContainerType(item?.containerType) &&
                        item?.reeferMode === "operating" ? (
                          <Tag color="blue">Reefer</Tag>
                        ) : null}
                        <Text type="secondary">
                          {commodityCount} commodit
                          {commodityCount === 1 ? "y" : "ies"}
                        </Text>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="booking-cargo-split__detail custom-scroll">
            {containerFields.length === 0 ? (
              <Empty description="No containers yet" />
            ) : (
              <ContainerDetailPanel
                control={control}
                containerIndex={safeSelectedIndex}
                errors={errors as Record<string, unknown>}
                containerTypes={containerTypes}
                packageTypes={packageTypes}
                dgClasses={dgClasses}
                watch={watch}
                setValue={setValue}
                onDuplicate={() => handleDuplicateContainer(safeSelectedIndex)}
                onRemove={() => handleRemoveContainer(safeSelectedIndex)}
                canRemove={containerFields.length > 1}
              />
            )}
          </section>
        </div>
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

interface LookupOpt {
  value: string;
  label: string;
}

interface ContainerDetailPanelProps {
  control: ReturnType<typeof useForm<CargoData>>["control"];
  containerIndex: number;
  errors: Record<string, unknown>;
  containerTypes: LookupOpt[];
  packageTypes: LookupOpt[];
  dgClasses: LookupOpt[];
  watch: ReturnType<typeof useForm<CargoData>>["watch"];
  setValue: UseFormSetValue<CargoData>;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ContainerDetailPanel({
  control,
  containerIndex: ci,
  errors,
  containerTypes,
  packageTypes,
  dgClasses,
  watch,
  setValue,
  onDuplicate,
  onRemove,
  canRemove,
}: ContainerDetailPanelProps) {
  const toast = useToast();
  const {
    fields: commodityFields,
    append,
    remove,
    insert,
  } = useFieldArray({
    control,
    name: `containers.${ci}.commodities`,
  });

  const containerType = watch(`containers.${ci}.containerType`);
  const reeferMode = watch(`containers.${ci}.reeferMode`);
  const isOog = watch(`containers.${ci}.isOog`);
  const commoditiesWatch = watch(`containers.${ci}.commodities`);
  const showReeferMode = isReeferContainerType(containerType);

  const handleAddCommodity = () => {
    append(createEmptyCommodity());
  };

  const handleCopyCommodity = (mi: number) => {
    const source = commoditiesWatch?.[mi];
    if (!source) return;
    const copy: CommodityItem = {
      ...structuredClone(source),
      id: createEmptyCommodity().id,
    };
    insert(mi + 1, copy);
    toast.success("Commodity copied");
  };

  const handleRemoveCommodity = (mi: number) => {
    if (commodityFields.length <= 1) {
      toast.error("At least one commodity is required");
      return;
    }
    remove(mi);
  };

  return (
    <div className="booking-cargo-detail">
      <div className="booking-cargo-detail__header">
        <Title level={5} className="booking-cargo-detail__title">
          Container {ci + 1}
        </Title>
        <ListActionsRow>
          <ListActionButton
            title="Duplicate Container"
            icon={<AppIcon icon={Icons.copy} size={16} tone="view" />}
            onClick={onDuplicate}
          />
          <ListActionButton
            title={
              canRemove
                ? "Delete Container"
                : "At Least One Container Is Required"
            }
            icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
            tone="delete"
            disabled={!canRemove}
            onClick={onRemove}
          />
        </ListActionsRow>
      </div>

      <Card
        className="form-step-card form-step-section booking-cargo-container-card"
        bordered={false}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={showReeferMode ? 5 : 6}>
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
                    // Modified by Sekar Nagarajan (2026-09-01 00:08) — reefer defaults to operating (NOR = No)
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
          </Col>
          <Col xs={12} md={showReeferMode ? 3 : 4}>
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
          </Col>
          <Col xs={12} md={showReeferMode ? 3 : 4}>
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
          </Col>
          <Col xs={12} md={showReeferMode ? 3 : 4}>
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
          </Col>
          {/* Modified by Sekar Nagarajan (2026-08-31 23:23) — switch with check/close icons */}
          <Col xs={6} md={showReeferMode ? 2 : 3}>
            <label className="form-field-label">SOC</label>
            <Controller
              control={control}
              name={`containers.${ci}.isSoc`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onChange={onChange}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              )}
            />
          </Col>
          <Col xs={6} md={showReeferMode ? 2 : 3}>
            <label className="form-field-label">OOG</label>
            <Controller
              control={control}
              name={`containers.${ci}.isOog`}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={value}
                  onChange={onChange}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              )}
            />
          </Col>
          {showReeferMode ? (
            <Col xs={12} md={6}>
              <label className="form-field-label">NOR</label>
              <Controller
                control={control}
                name={`containers.${ci}.reeferMode`}
                render={({ field }) => (
                  <Switch
                    checked={field.value === "nor"}
                    onChange={(checked) =>
                      field.onChange(checked ? "nor" : "operating")
                    }
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                )}
              />
            </Col>
          ) : null}
        </Row>

        {showReeferMode && reeferMode !== "nor" ? (
          <div className="booking-cargo-detail__section">
            <Text strong className="booking-cargo-detail__section-title">
              Reefer Details
            </Text>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={6}>
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
          </div>
        ) : null}
      </Card>

      <div className="booking-cargo-commodity-toolbar">
        <Text strong>Commodities</Text>
        <AppButton
          size="medium"
          icon={<AppIcon icon={Icons.plus} size={16} />}
          onClick={handleAddCommodity}
        >
          Add Commodity
        </AppButton>
      </div>

      {commodityFields.map((commodityField, mi) => (
        <CargoCommodityCard
          key={commodityField.id}
          control={control}
          containerIndex={ci}
          commodityIndex={mi}
          errors={errors}
          packageTypes={packageTypes}
          dgClasses={dgClasses}
          isDangerousGoods={!!commoditiesWatch?.[mi]?.isDangerousGoods}
          commodityName={commoditiesWatch?.[mi]?.commodity ?? ""}
          setValue={setValue}
          onCopy={() => handleCopyCommodity(mi)}
          onRemove={() => handleRemoveCommodity(mi)}
          canRemove={commodityFields.length > 1}
        />
      ))}
    </div>
  );
}
