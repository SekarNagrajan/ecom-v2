// Modified by Sekar Nagarajan (2026-08-28 17:58)
import { Input, InputNumber, Select, Typography } from "antd";
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
const GRID_HEADERS = [
  "Actions",
  "Container No",
  "Type",
  "Carrier Seal",
  "Shipper Seal",
  "HS Code",
  "Package Type",
  "Quantity",
  "Weight (kg)",
  "Commodity Description",
  "Marks & numbers",
] as const;

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
                              placeholder="Carrier Seal"
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
                              placeholder="Shipper Seal"
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
                            placeholder="Package Type"
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
                            addonAfter="kg"
                            placeholder="kg"
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
                            placeholder="Commodity Description"
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
                            placeholder="Marks & numbers"
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
      <div className="si-cargo-grid-hint">
        <Text type="secondary">
          Same fields as List view. Container No., Type, and seals edit once per
          container — continuation rows show 〃. Add / copy / delete apply to
          commodity lines.
        </Text>
      </div>
    </div>
  );
}
