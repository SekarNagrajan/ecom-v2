// Modified by Sekar Nagarajan (2026-09-11 11:36)
import { Input, InputNumber, Select, Switch, Typography } from "antd";
import { useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import {
  applyContainerTypeToMockNo,
  type CargoData,
  type ContainerItem,
} from "../types/booking.types";
import { isReeferContainerType } from "../utils/booking-cargo-completeness";
import { defaultTareWeightKg } from "../utils/default-tare-weight";
import {
  BookingCargoGridExtrasModal,
  type BookingCargoGridExtrasTarget,
} from "./booking-cargo-grid-extras-modal";
import { HsCodeAutoComplete } from "./cargo-code-lookups";
import { QuantityStepper } from "./quantity-stepper";

const { Text } = Typography;

/** Short type code for the grid Type cell (e.g. 20DC → 20 DC). */
function formatGridContainerType(code: string | undefined): string {
  const raw = (code ?? "").trim().toUpperCase();
  if (!raw) return "";
  return raw.replace(/^(\d+)([A-Z].*)$/, "$1 $2");
}

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
const GRID_HEADER_KEYS = [
  "cols.actions",
  "cols.containerNo",
  "cols.type",
  "cols.qty",
  "cols.soc",
  "cols.oog",
  "cols.nor",
  "cols.hsCode",
  "cols.packageType",
  "cols.pkgQty",
  "cols.weight",
  "cols.volume",
  "cols.hazardous",
] as const;

function makeGridHeaders(t: (key: string) => string) {
  return GRID_HEADER_KEYS.map((k) => t(`wizard.cargo.${k}`));
}

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
  const { t } = useTranslation(["booking", "common"]);
  const [extrasTarget, setExtrasTarget] =
    useState<BookingCargoGridExtrasTarget | null>(null);

  const closeExtras = () => setExtrasTarget(null);
  const gridHeaders = useMemo(() => makeGridHeaders(t), [t]);

  if (pageIndexes.length === 0) {
    return (
      <ModuleEmptyState
        artSize="sm"
        variant="filtered"
        title={t("wizard.cargo.noContainersMatch")}
        style={{ padding: 12 }}
      />
    );
  }

  return (
    <div className="si-cargo-grid-wrap">
      <div className="custom-scroll si-cargo-grid-scroll">
        <table className="si-cargo-grid">
          <thead>
            <tr>
              {gridHeaders.map((h, idx) => (
                <th
                  key={GRID_HEADER_KEYS[idx]}
                  className={
                    idx === 0
                      ? "si-cargo-grid__th-actions"
                      : idx === 1
                      ? "si-cargo-grid__th-container"
                      : idx === 2
                      ? "si-cargo-grid__th-type"
                      : idx === 3 ||
                        idx === 4 ||
                        idx === 5 ||
                        idx === 6 ||
                        idx === 12
                      ? "si-cargo-grid__th-switch"
                      : undefined
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
                            title={t("wizard.cargo.addCommodityLine")}
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
                          title={t("wizard.cargo.duplicateCommodityLine")}
                          icon={
                            <AppIcon icon={Icons.copy} size={16} tone="view" />
                          }
                          tone="view"
                          onClick={() => onDuplicateLine(ci, mi)}
                        />
                        <ListActionButton
                          title={
                            canRemove
                              ? t("wizard.cargo.deleteCommodityLine")
                              : t("wizard.cargo.atLeastOneCommodityLine")
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
                              placeholder={t("wizard.cargo.containerNo")}
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
                              placeholder={t("wizard.cargo.cols.type")}
                              optionLabelProp="value"
                              labelRender={({ value }) =>
                                formatGridContainerType(
                                  typeof value === "string"
                                    ? value
                                    : String(value ?? ""),
                                )
                              }
                              onChange={(value: string) => {
                                field.onChange(value);
                                setValue(
                                  `containers.${ci}.containerNo`,
                                  applyContainerTypeToMockNo(
                                    containersWatch[ci]?.containerNo,
                                    value,
                                  ),
                                );
                                // Modified by Sekar Nagarajan (2026-09-17 23:28) — JSP getTareweight on eqp change
                                const tare = defaultTareWeightKg(value);
                                if (tare != null) {
                                  setValue(`containers.${ci}.tareWeight`, tare);
                                }
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
                                if (currentMode === "none" || !currentMode) {
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
                        <div className="si-cargo-grid__switch-cell">
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
                        </div>
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
                                    title={t("wizard.cargo.editOogDetails")}
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
                                      title={t("wizard.cargo.editReeferDetails")}
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
                            placeholder={t("wizard.cargo.packageTypePlaceholder")}
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
                            addonAfter={t("wizard.cargo.units.kg")}
                            placeholder={t("wizard.cargo.units.kg")}
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
                            addonAfter={t("wizard.cargo.units.m3")}
                            placeholder={t("wizard.cargo.units.m3")}
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
                                  title={t("wizard.cargo.editDgDetails")}
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
      {/* <div className="si-cargo-grid-hint">
        <Text type="secondary">
          Toggle OOG, NOR off (operating reefer), or Hazardous to open a popup
          for detail fields. SOC is a flag only. NOR appears for reefer
          types.
        </Text>
      </div> */}

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
