// Modified by Sekar Nagarajan (2026-08-28 14:20)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Card,
  Checkbox,
  Col,
  Flex,
  InputNumber,
  Row,
  Segmented,
  Select,
  Typography,
} from "antd";
import {
  Controller,
  useFieldArray,
  useForm,
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

// Modified by Sekar Nagarajan (2026-08-28 12:04)
/** True when the selected equipment code is a reefer type (RF / RH / RE). */
function isReeferContainerType(containerType: string | undefined): boolean {
  const code = (containerType ?? "").trim().toUpperCase();
  return /RF|RH|RE/.test(code);
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
    // Modified by Sekar Nagarajan (2026-08-27 18:41)
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

  const onSubmit = (data: CargoData) => {
    updateCargo(data);
    nextStep();
  };

  const handleAddContainer = () => {
    appendContainer(createEmptyContainer());
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
    toast.success("Container duplicated");
  };

  const handleRemoveContainer = (index: number) => {
    if (containerFields.length <= 1) {
      toast.error("At least one container is required");
      return;
    }
    removeContainer(index);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Flex justify="flex-end" gap="small" className="booking-cargo-toolbar">
          <AppButton
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={handleAddContainer}
          >
            Add New Container
          </AppButton>
        </Flex>

        {containerFields.map((containerField, ci) => (
          <ContainerBlock
            key={containerField.id}
            control={control}
            containerIndex={ci}
            errors={errors as Record<string, unknown>}
            containerTypes={containerTypes}
            packageTypes={packageTypes}
            dgClasses={dgClasses}
            watch={watch}
            setValue={setValue}
            onDuplicate={() => handleDuplicateContainer(ci)}
            onRemove={() => handleRemoveContainer(ci)}
            canRemove={containerFields.length > 1}
          />
        ))}
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

interface ContainerBlockProps {
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

function ContainerBlock({
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
}: ContainerBlockProps) {
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

  // Modified by Sekar Nagarajan (2026-08-28 12:04)
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
    <Card
      className="form-step-card form-step-section booking-cargo-container-card"
      title={
        <Flex justify="space-between" align="center" wrap="wrap" gap="small">
          <Title level={5} className="booking-cargo-container-card__title">
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
        </Flex>
      }
    >
      <Row gutter={[24, 24]}>
        {/* Modified by Sekar Nagarajan (2026-08-28 12:04) */}
        <Col xs={24} md={showReeferMode ? 5 : 8}>
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
        <Col xs={24} md={showReeferMode ? 3 : 4}>
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
        <Col xs={24} md={showReeferMode ? 3 : 4}>
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
        <Col xs={24} md={showReeferMode ? 3 : 4}>
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
        <Col xs={24} md={4}>
          <label className="form-field-label">SOC / OOG</label>
          <Flex align="center" gap="middle" wrap="wrap">
            <Controller
              control={control}
              name={`containers.${ci}.isSoc`}
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                  {...field}
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                >
                  <b>SOC</b>
                </Checkbox>
              )}
            />
            <Controller
              control={control}
              name={`containers.${ci}.isOog`}
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                  {...field}
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                >
                  <b>OOG</b>
                </Checkbox>
              )}
            />
          </Flex>
        </Col>
        {showReeferMode ? (
          <Col xs={24} md={6}>
            <label className="form-field-label">Reefer Mode</label>
            <Controller
              control={control}
              name={`containers.${ci}.reeferMode`}
              render={({ field }) => (
                <Segmented
                  {...field}
                  block
                  options={[
                    { label: "None", value: "none" },
                    { label: "Operating", value: "operating" },
                    { label: "NOR", value: "nor" },
                  ]}
                />
              )}
            />
          </Col>
        ) : null}
      </Row>

      {showReeferMode && reeferMode === "operating" ? (
        <Card
          size="small"
          title="Reefer Details"
          className="form-step-card form-step-section"
        >
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
        </Card>
      ) : null}

      {isOog ? (
        <Card
          size="small"
          title="OOG Details"
          className="form-step-card form-step-section"
        >
          {/* Modified by Sekar Nagarajan (2026-08-28 14:20) — single-row OOG fields */}
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
        </Card>
      ) : null}

      <Flex
        justify="space-between"
        align="center"
        className="booking-cargo-commodity-toolbar"
      >
        <Text strong></Text>
        <AppButton
          size="medium"
          icon={<AppIcon icon={Icons.plus} size={16} />}
          onClick={handleAddCommodity}
        >
          Add Another Commodity
        </AppButton>
      </Flex>

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
    </Card>
  );
}
