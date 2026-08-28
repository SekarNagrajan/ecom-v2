// Modified by Sekar Nagarajan (2026-08-28 12:35)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Flex, Input, Row, Tag, Typography } from "antd";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useBookingLookups } from "../../booking/api/booking.queries";
import {
  createEmptyCargoLine,
  siCargoStepSchema,
  type SIContainer,
  type SiCargoStepForm,
} from "../types/si.types";
import { SiCargoLineCard } from "./si-cargo-line-card";

const { Text } = Typography;

interface CargoLinesEditorProps {
  containers: SIContainer[];
  onNext: (containers: SIContainer[]) => void;
  onPrevious: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  showCancel?: boolean;
  renderContainerFooter?: (
    container: SIContainer,
    index: number,
  ) => React.ReactNode;
}

export function CargoLinesEditor({
  containers,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting,
  showCancel = false,
  renderContainerFooter,
}: CargoLinesEditorProps) {
  const toast = useToast();
  const { data: packageTypes = [] } = useBookingLookups("packageTypes");
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<SiCargoStepForm>({
    resolver: zodResolver(siCargoStepSchema) as Resolver<SiCargoStepForm>,
    defaultValues: { containers },
  });

  const containersWatch = watch("containers");

  const onValid = (values: SiCargoStepForm) => {
    // Preserve SOC / reefer / OOG extensions from wizard state when saving cargo lines.
    const merged = values.containers.map((formContainer, index) => ({
      ...containers[index],
      ...formContainer,
      eqpSize: containers[index]?.eqpSize || formContainer.eqpSize,
      cargoLines: formContainer.cargoLines,
    }));
    onNext(merged as SIContainer[]);
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        {containers.map((container, ci) => (
          <ContainerCargoCard
            key={container.id}
            control={control}
            containerIndex={ci}
            containerNo={
              containersWatch?.[ci]?.containerNo || container.containerNo
            }
            eqpSize={container.eqpSize || "20DC"}
            errors={errors as Record<string, unknown>}
            packageTypes={packageTypes}
            setValue={setValue}
            getValues={getValues}
            cargoLinesWatch={containersWatch?.[ci]?.cargoLines}
            toastError={(msg) => toast.error(msg)}
            footer={renderContainerFooter?.(container, ci)}
          />
        ))}
      </div>

      {/* Modified by Sekar Nagarajan (2026-08-28 12:40) */}
      <div className="form-step-footer">
        {showCancel && onCancel ? (
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
        ) : null}
        <AppButton onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}

interface ContainerCargoCardProps {
  control: ReturnType<typeof useForm<SiCargoStepForm>>["control"];
  containerIndex: number;
  containerNo: string;
  eqpSize: string;
  errors: Record<string, unknown>;
  packageTypes: { value: string; label: string }[];
  setValue: ReturnType<typeof useForm<SiCargoStepForm>>["setValue"];
  getValues: ReturnType<typeof useForm<SiCargoStepForm>>["getValues"];
  cargoLinesWatch?: SiCargoStepForm["containers"][number]["cargoLines"];
  toastError: (message: string) => void;
  footer?: React.ReactNode;
}

function ContainerCargoCard({
  control,
  containerIndex: ci,
  containerNo,
  eqpSize,
  errors,
  packageTypes,
  setValue,
  getValues,
  cargoLinesWatch,
  toastError,
  footer,
}: ContainerCargoCardProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: `containers.${ci}.cargoLines`,
  });

  return (
    <Card
      className="form-step-card form-step-section si-cargo-card"
      title={
        <div className="si-cargo-card-toolbar">
          <span>
            Container {ci + 1}: <Text strong>{containerNo}</Text>
          </span>
          <Tag color="processing">{eqpSize || "20DC"}</Tag>
        </div>
      }
    >
      {/* Modified by Sekar Nagarajan (2026-08-28 12:35) — Container No next to seals */}
      <Row gutter={[24, 24]} className="form-step-section">
        <Col {...RESPONSIVE_COL.formThird}>
          <div className="form-field-cell">
            <label className="form-field-label">
              Container Number <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name={`containers.${ci}.containerNo`}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  size="large"
                  placeholder="Container Number"
                  className="form-field-full-width"
                />
              )}
            />
          </div>
        </Col>
        <Col {...RESPONSIVE_COL.formThird}>
          <div className="form-field-cell">
            <label className="form-field-label">Carrier Seal</label>
            <Controller
              control={control}
              name={`containers.${ci}.carrierSeal`}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  size="large"
                  placeholder="Carrier Seal"
                  className="form-field-full-width"
                />
              )}
            />
          </div>
        </Col>
        <Col {...RESPONSIVE_COL.formThird}>
          <div className="form-field-cell">
            <label className="form-field-label">Shipper Seal</label>
            <Controller
              control={control}
              name={`containers.${ci}.shipperSeal`}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  size="large"
                  placeholder="Shipper Seal"
                  className="form-field-full-width"
                />
              )}
            />
          </div>
        </Col>
      </Row>

      <Flex
        justify="space-between"
        align="center"
        className="booking-cargo-commodity-toolbar"
      >
        <Text strong>Commodities</Text>
        <AppButton
          icon={<AppIcon icon={Icons.plus} size={16} />}
          onClick={() => append(createEmptyCargoLine())}
        >
          Add Another Commodity
        </AppButton>
      </Flex>

      {fields.map((line, mi) => (
        <SiCargoLineCard
          key={line.id}
          control={control}
          containerIndex={ci}
          lineIndex={mi}
          errors={errors}
          packageTypes={packageTypes}
          commodityName={cargoLinesWatch?.[mi]?.commodityCode ?? ""}
          setValue={setValue}
          onCopy={() => {
            const current = getValues(`containers.${ci}.cargoLines.${mi}`);
            insert(mi + 1, {
              ...current,
              id: createEmptyCargoLine().id,
            });
          }}
          onRemove={() => {
            if (fields.length <= 1) {
              toastError("At least one commodity is required");
              return;
            }
            remove(mi);
          }}
          canRemove={fields.length > 1}
        />
      ))}
      {footer}
    </Card>
  );
}
