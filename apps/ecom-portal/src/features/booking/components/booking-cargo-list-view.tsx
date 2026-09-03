// Modified by Sekar Nagarajan (2026-09-02 16:43)
import { AppButton } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";
import {
  useFieldArray,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  createEmptyCommodity,
  type CargoData,
  type CommodityItem,
  type ContainerItem,
} from "../types/booking.types";
import {
  countContainerIssues,
  isReeferContainerType,
  sumContainerCargo,
} from "../utils/booking-cargo-completeness";
import { BookingCargoContainerFields } from "./booking-cargo-container-fields";
import { CargoCommodityCard } from "./cargo-commodity-card";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

export interface BookingCargoListViewProps {
  pageIndexes: number[];
  containerFields: { id: string }[];
  containersWatch: ContainerItem[];
  control: Control<CargoData>;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  containerTypes: LookupOpt[];
  dgClasses: LookupOpt[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setValue: UseFormSetValue<CargoData>;
  getValues: UseFormGetValues<CargoData>;
  watch: UseFormWatch<CargoData>;
  toastError: (message: string) => void;
  toastSuccess: (message: string) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

export function BookingCargoListView({
  pageIndexes,
  containerFields,
  containersWatch,
  control,
  errors,
  packageTypes,
  containerTypes,
  dgClasses,
  expandedId,
  setExpandedId,
  setValue,
  getValues,
  watch,
  toastError,
  toastSuccess,
  onDuplicate,
  onDelete,
}: BookingCargoListViewProps) {
  if (pageIndexes.length === 0) {
    return (
      <div className="si-cargo-empty">
        <div className="si-cargo-empty__icon">
          <AppIcon icon={Icons.inbox} size={22} />
        </div>
        <Text strong>No containers match</Text>
        <div>
          <Text type="secondary">
            Adjust the search or the &quot;Incomplete only&quot; filter.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="si-cargo-list">
      {pageIndexes.map((ci) => {
        const container = containersWatch[ci];
        const fieldId = containerFields[ci]?.id ?? container?.id ?? String(ci);
        const open = expandedId === (container?.id ?? fieldId);
        const issues = countContainerIssues(
          container ??
            ({
              containerType: "",
              commodities: [],
            } as ContainerItem),
        );
        const sums = sumContainerCargo(
          container ?? ({ commodities: [] } as ContainerItem),
        );
        const hasNumber = Boolean(container?.containerNo?.trim());
        const lineCount = container?.commodities?.length ?? 0;
        const typeLabel = container?.containerType || "—";
        const qty = container?.quantity ?? 1;

        return (
          <div key={fieldId} className="si-cargo-sicard">
            <div
              className="si-cargo-ct-row-wrap si-cargo-ct-row-wrap--booking"
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() =>
                setExpandedId(open ? null : (container?.id ?? fieldId))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(open ? null : (container?.id ?? fieldId));
                }
              }}
            >
              <AppIcon
                icon={Icons.chevronDown}
                size={16}
                className={[
                  "si-cargo-ct-chev",
                  open ? "si-cargo-ct-chev--open" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              <div className="si-cargo-ct-identity">
                <div className="si-cargo-ct-identity__main">
                  <Text
                    strong
                    className={[
                      "si-cargo-ct-no",
                      hasNumber ? undefined : "si-cargo-ct-no--empty",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {hasNumber
                      ? container?.containerNo
                      : `Container ${ci + 1}`}
                  </Text>
                  <span className="si-cargo-type-badge si-cargo-type-badge--primary">
                    {typeLabel} x {qty}
                  </span>
                  <span className="si-cargo-ct-status__tags">
                    {container?.isSoc ? <Tag>SOC</Tag> : null}
                    {container?.isOog ? (
                      <Tag color="purple">OOG</Tag>
                    ) : null}
                    {isReeferContainerType(container?.containerType) &&
                    container?.reeferMode === "operating" ? (
                      <Tag color="blue">Reefer</Tag>
                    ) : null}
                  </span>
                </div>
              </div>

              <div className="si-cargo-ct-summary">
                <Text type="secondary" className="si-cargo-ct-summary__text">
                  {lineCount}{" "}
                  {lineCount === 1 ? "Commodity" : "Commodities"}
                  <span className="si-cargo-ct-summary__dot">·</span>
                  {sums.packages.toLocaleString()}{" "}
                  {sums.packages === 1 ? "Package" : "Packages"}
                  <span className="si-cargo-ct-summary__dot">·</span>
                  {sums.weight.toLocaleString()} kg
                  <span className="si-cargo-ct-summary__dot">·</span>
                  {sums.volume.toFixed(1)} CBM
                </Text>
              </div>

              <span className="si-cargo-ct-status">
                {issues === 0 ? (
                  <span className="si-cargo-vchip si-cargo-vchip--ok">
                    Complete
                  </span>
                ) : (
                  <span className="si-cargo-vchip si-cargo-vchip--warn">
                    <AppIcon
                      icon={Icons.alertTriangle}
                      size={12}
                      tone="edit"
                    />
                    {issues} issue{issues === 1 ? "" : "s"}
                  </span>
                )}
              </span>

              <span
                className="si-cargo-ct-actions"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <ListActionsRow>
                  <ListActionButton
                    title="Duplicate Container"
                    icon={<AppIcon icon={Icons.copy} size={16} tone="view" />}
                    onClick={() => onDuplicate(ci)}
                  />
                  <ListActionButton
                    title="Delete Container"
                    icon={
                      <AppIcon icon={Icons.trash} size={16} tone="delete" />
                    }
                    tone="delete"
                    onClick={() => onDelete(ci)}
                  />
                </ListActionsRow>
              </span>
            </div>

            {open ? (
              <ContainerEditorPanel
                control={control}
                containerIndex={ci}
                container={container as ContainerItem}
                errors={errors}
                packageTypes={packageTypes}
                containerTypes={containerTypes}
                dgClasses={dgClasses}
                setValue={setValue}
                getValues={getValues}
                watch={watch}
                toastError={toastError}
                toastSuccess={toastSuccess}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ContainerEditorPanelProps {
  control: Control<CargoData>;
  containerIndex: number;
  container: ContainerItem;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  containerTypes: LookupOpt[];
  dgClasses: LookupOpt[];
  setValue: UseFormSetValue<CargoData>;
  getValues: UseFormGetValues<CargoData>;
  watch: UseFormWatch<CargoData>;
  toastError: (message: string) => void;
  toastSuccess: (message: string) => void;
}

function ContainerEditorPanel({
  control,
  containerIndex: ci,
  container,
  errors,
  packageTypes,
  containerTypes,
  dgClasses,
  setValue,
  getValues,
  watch,
  toastError,
  toastSuccess,
}: ContainerEditorPanelProps) {
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: `containers.${ci}.commodities`,
  });
  const commoditiesWatch = container?.commodities;

  return (
    <div className="si-cargo-editor-panel">
      <BookingCargoContainerFields
        control={control}
        containerIndex={ci}
        errors={errors}
        containerTypes={containerTypes}
        watch={watch}
        setValue={setValue}
      />

      <div className="booking-cargo-commodity-toolbar">
        <Text strong>Commodities</Text>
        <AppButton
          size="medium"
          className="booking-cargo-commodity-toolbar__add"
          icon={<AppIcon icon={Icons.plus} size={16} />}
          onClick={() => append(createEmptyCommodity())}
        >
          Add Commodity
        </AppButton>
      </div>

      {fields.map((line, mi) => (
        <CargoCommodityCard
          key={line.id}
          control={control}
          containerIndex={ci}
          commodityIndex={mi}
          errors={errors}
          packageTypes={packageTypes}
          dgClasses={dgClasses}
          isDangerousGoods={!!commoditiesWatch?.[mi]?.isDangerousGoods}
          commodityName={commoditiesWatch?.[mi]?.commodity ?? ""}
          setValue={setValue}
          onCopy={() => {
            const current = getValues(`containers.${ci}.commodities.${mi}`);
            if (!current) return;
            const copy: CommodityItem = {
              ...structuredClone(current),
              id: createEmptyCommodity().id,
            };
            insert(mi + 1, copy);
            toastSuccess("Commodity copied");
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
    </div>
  );
}
