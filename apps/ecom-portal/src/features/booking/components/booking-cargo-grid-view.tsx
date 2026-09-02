// Modified by Sekar Nagarajan (2026-09-02 12:22)
import { Input, InputNumber, Select, Switch, Typography } from "antd";
import { useState } from "react";
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
import type { CargoData, ContainerItem } from "../types/booking.types";
import { isReeferContainerType } from "../utils/booking-cargo-completeness";
import {
  BookingCargoGridExtrasModal,
  type BookingCargoGridExtrasTarget,
} from "./booking-cargo-grid-extras-modal";
import { HsCodeAutoComplete } from "./cargo-code-lookups";
import { QuantityStepper } from "./quantity-stepper";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

export interface BookingCargoGridViewProps {
  pageIndexes: number[];
  containersWatch: ContainerItem[];
  control: Control<CargoData>;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  containerTypes: LookupOpt[];
  dgClasses: LookupOpt[];
  setValue: UseFormSetValue<CargoData>;
  onAddLine: (containerIndex: number) => void;
  onDuplicateLine: (containerIndex: number, lineIndex: number) => void;
  onRemoveLine: (containerIndex: number, lineIndex: number) => void;
}

/**
 * Grid: commodity fields + SOC/OOG/NOR toggles.
 * OOG / operating reefer / DG detail forms open in a compact popup.
 */
const GRID_HEADERS = [
  "Actions",
  "Container No",
  "Type",
  "Qty",
  "SOC",
  "OOG",
  "NOR",
  "HS Code",
  "Package Type",
  "Pkg Qty",
  "Weight",
  "Volume",
  "Hazardous",
] as const;

export function BookingCargoGridView({
  pageIndexes,
  containersWatch,
  control,
  errors,
  packageTypes,
  containerTypes,
  dgClasses,
  setValue,
  onAddLine,
  onDuplicateLine,
  onRemoveLine,
}: BookingCargoGridViewProps) {
  const [extrasTarget, setExtrasTarget] =
    useState<BookingCargoGridExtrasTarget | null>(null);

  const closeExtras = () => setExtrasTarget(null);

  if (pageIndexes.length === 0) {
    return (
      <div className="si-cargo-empty">
        <div className="si-cargo-empty__icon">
          <AppIcon icon={Icons.inbox} size={22} />
        </div>
        <Text strong>No containers match</Text>
      </div>
    );
  }

  return (
    <div className="si-cargo-grid-wrap">
      <div className="custom-scroll si-cargo-grid-scroll">
        <table className="si-cargo-grid">
          <thead>
            <tr>
              {GRID_HEADERS.map((h) => (
                <th
                  key={h}
                  className={
                    h === "Actions" ? "si-cargo-grid__th-actions" : undefined
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageIndexes.flatMap((ci) => {
              const container = containersWatch[ci];
              const lines = container?.commodities ?? [];
              const canRemove = lines.length > 1;
              const isReefer = isReeferContainerType(container?.containerType);

              return lines.map((line, mi) => {
                const first = mi === 0;
                const commodityName = line.commodity ?? "";
                return (
                  <tr
                    key={`${container?.id ?? ci}-${line.id ?? mi}`}
                    className={first ? "si-cargo-grid__grp" : undefined}
                  >
                    <td className="si-cargo-grid__td-actions">
                      <ListActionsRow>
                        {first ? (
                          <ListActionButton
                            title="Add Commodity Line"
                            icon={
                              <AppIcon
                                icon={Icons.plus}
                                size={16}
                                tone="create"
                              />
                            }
                            tone="create"
                            onClick={() => onAddLine(ci)}
                          />
                        ) : (
                          <span
                            className="si-cargo-grid__action-spacer"
                            aria-hidden
                          />
                        )}
                        <ListActionButton
                          title="Duplicate Commodity Line"
                          icon={
                            <AppIcon icon={Icons.copy} size={16} tone="view" />
                          }
                          tone="view"
                          onClick={() => onDuplicateLine(ci, mi)}
                        />
                        <ListActionButton
                          title={
                            canRemove
                              ? "Delete Commodity Line"
                              : "At Least One Commodity Is Required"
                          }
                          icon={
                            <AppIcon
                              icon={Icons.trash}
                              size={16}
                              tone="delete"
                            />
                          }
                          tone="delete"
                          disabled={!canRemove}
                          onClick={() => onRemoveLine(ci, mi)}
                        />
                      </ListActionsRow>
                    </td>
                    <td className="si-cargo-grid__td-container">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.containerNo`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              size="large"
                              placeholder="Container No."
                              className="si-cargo-grid__field si-cargo-grid__field--container"
                            />
                          )}
                        />
                      ) : (
                        <Text type="secondary" className="si-cargo-grid__cont">
                          〃
                        </Text>
                      )}
                    </td>
                    <td className="si-cargo-grid__td-type">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.containerType`}
                          render={({ field }) => (
                            <Select
                              {...field}
                              size="large"
                              options={containerTypes}
                              showSearch
                              optionFilterProp="label"
                              popupMatchSelectWidth={220}
                              className="si-cargo-grid__field si-cargo-grid__field--kind"
                              placeholder="Type"
                              onChange={(value: string) => {
                                field.onChange(value);
                                if (!isReeferContainerType(value)) {
                                  setValue(
                                    `containers.${ci}.reeferMode`,
                                    "none",
                                  );
                                  if (
                                    extrasTarget?.kind === "reefer" &&
                                    extrasTarget.containerIndex === ci
                                  ) {
                                    closeExtras();
                                  }
                                  return;
                                }
                                const currentMode =
                                  containersWatch[ci]?.reeferMode;
                                if (
                                  currentMode === "none" ||
                                  !currentMode
                                ) {
                                  setValue(
                                    `containers.${ci}.reeferMode`,
                                    "operating",
                                  );
                                  setExtrasTarget({
                                    kind: "reefer",
                                    containerIndex: ci,
                                  });
                                }
                              }}
                            />
                          )}
                        />
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-qty">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.quantity`}
                          render={({ field }) => (
                            <div className="si-cargo-grid__field si-cargo-grid__field--qty">
                              <QuantityStepper
                                value={field.value}
                                onChange={field.onChange}
                                min={1}
                                max={100}
                              />
                            </div>
                          )}
                        />
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-switch">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.isSoc`}
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
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-switch">
                      {first ? (
                        <div className="si-cargo-grid__switch-cell">
                          <Controller
                            control={control}
                            name={`containers.${ci}.isOog`}
                            render={({ field: { value, onChange } }) => (
                              <>
                                <Switch
                                  size="medium"
                                  className={FORM_YES_NO_SWITCH_CLASS}
                                  checked={value}
                                  onChange={(checked) => {
                                    onChange(checked);
                                    if (checked) {
                                      setExtrasTarget({
                                        kind: "oog",
                                        containerIndex: ci,
                                      });
                                    } else if (
                                      extrasTarget?.kind === "oog" &&
                                      extrasTarget.containerIndex === ci
                                    ) {
                                      closeExtras();
                                    }
                                  }}
                                  {...yesNoSwitchInner}
                                />
                                {value ? (
                                  <ListActionButton
                                    title="Edit OOG Details"
                                    icon={
                                      <AppIcon
                                        icon={Icons.edit}
                                        size={14}
                                        tone="edit"
                                      />
                                    }
                                    tone="edit"
                                    onClick={() =>
                                      setExtrasTarget({
                                        kind: "oog",
                                        containerIndex: ci,
                                      })
                                    }
                                  />
                                ) : null}
                              </>
                            )}
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-switch">
                      {first ? (
                        isReefer ? (
                          <div className="si-cargo-grid__switch-cell">
                            <Controller
                              control={control}
                              name={`containers.${ci}.reeferMode`}
                              render={({ field }) => (
                                <>
                                  <Switch
                                    size="medium"
                                    className={FORM_YES_NO_SWITCH_CLASS}
                                    checked={field.value === "nor"}
                                    onChange={(checked) => {
                                      field.onChange(
                                        checked ? "nor" : "operating",
                                      );
                                      if (checked) {
                                        if (
                                          extrasTarget?.kind === "reefer" &&
                                          extrasTarget.containerIndex === ci
                                        ) {
                                          closeExtras();
                                        }
                                      } else {
                                        setExtrasTarget({
                                          kind: "reefer",
                                          containerIndex: ci,
                                        });
                                      }
                                    }}
                                    {...yesNoSwitchInner}
                                  />
                                  {field.value === "operating" ? (
                                    <ListActionButton
                                      title="Edit Reefer Details"
                                      icon={
                                        <AppIcon
                                          icon={Icons.edit}
                                          size={14}
                                          tone="edit"
                                        />
                                      }
                                      tone="edit"
                                      onClick={() =>
                                        setExtrasTarget({
                                          kind: "reefer",
                                          containerIndex: ci,
                                        })
                                      }
                                    />
                                  ) : null}
                                </>
                              )}
                            />
                          </div>
                        ) : (
                          <Text type="secondary">—</Text>
                        )
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-hs">
                      <Controller
                        control={control}
                        name={`containers.${ci}.commodities.${mi}.hsCode`}
                        render={({ field }) => (
                          <div className="si-cargo-grid__field si-cargo-grid__field--hs">
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
                                  { shouldDirty: true },
                                );
                                setValue(
                                  `containers.${ci}.commodities.${mi}.description`,
                                  opt.desc,
                                  { shouldDirty: true, shouldValidate: true },
                                );
                              }}
                            />
                          </div>
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-kind">
                      <Controller
                        control={control}
                        name={`containers.${ci}.commodities.${mi}.packageType`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            options={packageTypes}
                            showSearch
                            optionFilterProp="label"
                            popupMatchSelectWidth={220}
                            className="si-cargo-grid__field si-cargo-grid__field--kind"
                            placeholder="Package Type"
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-qty">
                      <Controller
                        control={control}
                        name={`containers.${ci}.commodities.${mi}.packageQuantity`}
                        render={({ field }) => (
                          <div className="si-cargo-grid__field si-cargo-grid__field--qty">
                            <QuantityStepper
                              value={field.value}
                              onChange={field.onChange}
                              min={1}
                            />
                          </div>
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-weight">
                      <Controller
                        control={control}
                        name={`containers.${ci}.commodities.${mi}.weight`}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={1}
                            size="large"
                            className="si-cargo-grid__field si-cargo-grid__field--weight"
                            addonAfter="kg"
                            placeholder="kg"
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-weight">
                      <Controller
                        control={control}
                        name={`containers.${ci}.commodities.${mi}.volume`}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            size="large"
                            className="si-cargo-grid__field si-cargo-grid__field--weight"
                            addonAfter="m³"
                            placeholder="m³"
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-haz">
                      <div className="si-cargo-grid__switch-cell">
                        <Controller
                          control={control}
                          name={`containers.${ci}.commodities.${mi}.isDangerousGoods`}
                          render={({ field: { value, onChange } }) => (
                            <>
                              <Switch
                                size="medium"
                                className={FORM_YES_NO_SWITCH_CLASS}
                                checked={value}
                                onChange={(checked) => {
                                  onChange(checked);
                                  if (checked) {
                                    setExtrasTarget({
                                      kind: "dg",
                                      containerIndex: ci,
                                      commodityIndex: mi,
                                    });
                                  } else if (
                                    extrasTarget?.kind === "dg" &&
                                    extrasTarget.containerIndex === ci &&
                                    extrasTarget.commodityIndex === mi
                                  ) {
                                    closeExtras();
                                  }
                                }}
                                {...yesNoSwitchInner}
                              />
                              {value ? (
                                <ListActionButton
                                  title="Edit DG Details"
                                  icon={
                                    <AppIcon
                                      icon={Icons.edit}
                                      size={14}
                                      tone="edit"
                                    />
                                  }
                                  tone="edit"
                                  onClick={() =>
                                    setExtrasTarget({
                                      kind: "dg",
                                      containerIndex: ci,
                                      commodityIndex: mi,
                                    })
                                  }
                                />
                              ) : null}
                            </>
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
      <div className="si-cargo-grid-hint">
        <Text type="secondary">
          Toggle OOG, NOR off (operating reefer), or Hazardous to open a popup
          for detail fields. SOC is a flag only. NOR appears for reefer
          types.
        </Text>
      </div>

      <BookingCargoGridExtrasModal
        open={extrasTarget !== null}
        target={extrasTarget}
        control={control}
        errors={errors}
        dgClasses={dgClasses}
        setValue={setValue}
        onClose={closeExtras}
      />
    </div>
  );
}
