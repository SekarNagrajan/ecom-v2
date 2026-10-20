// Modified by Sekar Nagarajan (2026-09-15 11:15)
import { Input, InputNumber, Select, Typography } from "antd";
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
import { HsCodeAutoComplete } from "../../booking/components/cargo-code-lookups";
import { QuantityStepper } from "../../booking/components/quantity-stepper";
import type { SiCargoStepForm } from "../types/si.types";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

export interface SiCargoGridViewProps {
  pageIndexes: number[];
  containersWatch: SiCargoStepForm["containers"];
  control: Control<SiCargoStepForm>;
  packageTypes: LookupOpt[];
  setValue: UseFormSetValue<SiCargoStepForm>;
  onAddLine: (containerIndex: number) => void;
  onDuplicateLine: (containerIndex: number, lineIndex: number) => void;
  onRemoveLine: (containerIndex: number, lineIndex: number) => void;
}

/** Same fields as list view — container + commodity editors in a flat table. */
const GRID_HEADER_KEYS = [
  "actions",
  "containerNo",
  "type",
  "carrierSeal",
  "shipperSeal",
  "hsCode",
  "packageType",
  "quantity",
  "weightKg",
  "commodityDescription",
  "marksAndNumbers",
] as const;

type GridHeaderKey = (typeof GRID_HEADER_KEYS)[number];

const GRID_HEADER_I18N: Record<GridHeaderKey, string> = {
  actions: "cargo.columns.actions",
  containerNo: "cargo.columns.containerNo",
  type: "cargo.columns.type",
  carrierSeal: "cargo.columns.carrierSeal",
  shipperSeal: "cargo.columns.shipperSeal",
  hsCode: "cargo.columns.hsCode",
  packageType: "cargo.columns.packageType",
  quantity: "cargo.columns.quantity",
  weightKg: "cargo.columns.weightKg",
  commodityDescription: "cargo.columns.commodityDescription",
  marksAndNumbers: "cargo.columns.marksAndNumbers",
};

function gridHeaderClass(header: GridHeaderKey): string | undefined {
  if (header === "actions") return "si-cargo-grid__th-actions";
  if (header === "containerNo") return "si-cargo-grid__th-container";
  if (header === "type") return "si-cargo-grid__th-type";
  return undefined;
}

export function SiCargoGridView({
  pageIndexes,
  containersWatch,
  control,
  packageTypes,
  setValue,
  onAddLine,
  onDuplicateLine,
  onRemoveLine,
}: SiCargoGridViewProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  if (pageIndexes.length === 0) {
    return (
      <ModuleEmptyState
        artSize="sm"
        variant="filtered"
        title={t("wizard.cargo.emptyFiltered.title")}
        message={t("wizard.cargo.emptyFiltered.message")}
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
              {GRID_HEADER_KEYS.map((key) => (
                <th key={key} className={gridHeaderClass(key)}>
                  {t(GRID_HEADER_I18N[key])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageIndexes.flatMap((ci) => {
              const container = containersWatch[ci];
              const lines = container?.cargoLines ?? [];
              const canRemove = lines.length > 1;

              return lines.map((line, mi) => {
                const first = mi === 0;
                const commodityName = line.commodityCode ?? "";
                return (
                  <tr
                    key={`${container?.id ?? ci}-${line.id ?? mi}`}
                    className={first ? "si-cargo-grid__grp" : undefined}
                  >
                    <td className="si-cargo-grid__td-actions">
                      <ListActionsRow>
                        {first ? (
                          <ListActionButton
                            title={t("wizard.cargo.actions.addCommodityLine")}
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
                          title={t(
                            "wizard.cargo.actions.duplicateCommodityLine",
                          )}
                          icon={
                            <AppIcon icon={Icons.copy} size={16} tone="view" />
                          }
                          tone="view"
                          onClick={() => onDuplicateLine(ci, mi)}
                        />
                        <ListActionButton
                          title={
                            canRemove
                              ? t("wizard.cargo.actions.deleteCommodityLine")
                              : t("wizard.cargo.actions.minCommodityTooltip")
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
                              placeholder={t("wizard.cargo.fields.containerNo")}
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
                        <span className="si-cargo-type-badge">
                          {container?.eqpSize || "—"}
                        </span>
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-seal">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.carrierSeal`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              size="large"
                              placeholder={t("wizard.cargo.fields.carrierSeal")}
                              className="si-cargo-grid__field si-cargo-grid__field--seal"
                            />
                          )}
                        />
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-seal">
                      {first ? (
                        <Controller
                          control={control}
                          name={`containers.${ci}.shipperSeal`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              size="large"
                              placeholder={t("wizard.cargo.fields.shipperSeal")}
                              className="si-cargo-grid__field si-cargo-grid__field--seal"
                            />
                          )}
                        />
                      ) : null}
                    </td>
                    <td className="si-cargo-grid__td-hs">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.hsCode`}
                        render={({ field }) => (
                          <div className="si-cargo-grid__field si-cargo-grid__field--hs">
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
                          </div>
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-kind">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.packageType`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            options={packageTypes}
                            showSearch
                            optionFilterProp="label"
                            popupMatchSelectWidth={220}
                            className="si-cargo-grid__field si-cargo-grid__field--kind"
                            placeholder={t("wizard.cargo.fields.packageType")}
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-qty">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.packageCount`}
                        render={({ field }) => (
                          <div className="si-cargo-grid__field si-cargo-grid__field--qty">
                            <QuantityStepper
                              value={field.value}
                              onChange={(next) => field.onChange(next ?? 1)}
                              min={1}
                            />
                          </div>
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-weight">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.grossWeight`}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={1}
                            size="large"
                            className="si-cargo-grid__field si-cargo-grid__field--weight"
                            addonAfter={t("wizard.cargo.list.kg")}
                            placeholder={t("wizard.cargo.list.kg")}
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-desc">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.description`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            size="large"
                            placeholder={t(
                              "wizard.cargo.fields.commodityDescription",
                            )}
                            className="si-cargo-grid__field si-cargo-grid__field--desc"
                          />
                        )}
                      />
                    </td>
                    <td className="si-cargo-grid__td-marks">
                      <Controller
                        control={control}
                        name={`containers.${ci}.cargoLines.${mi}.marksAndNumbers`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            size="large"
                            placeholder={t(
                              "wizard.cargo.fields.marksAndNumbers",
                            )}
                            className="si-cargo-grid__field si-cargo-grid__field--marks"
                          />
                        )}
                      />
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
          Same fields as List view. Actions, Container No., and Type stay fixed
          while other columns scroll. Seals edit once per container —
          continuation rows show 〃. Add / copy / delete apply to commodity
          lines.
        </Text>
      </div> */}
    </div>
  );
}
