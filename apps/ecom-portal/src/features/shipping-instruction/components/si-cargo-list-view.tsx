// Modified by Sekar Nagarajan (2026-08-28 17:03)
import { Input, Typography } from "antd";
import type { ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  createEmptyCargoLine,
  createEmptyContainer,
  type SIContainer,
  type SiCargoStepForm,
} from "../types/si.types";
import {
  countContainerIssues,
  sumContainerCargo,
} from "../utils/si-cargo-completeness";
import { SiCargoLineCard } from "./si-cargo-line-card";

const { Text } = Typography;

interface LookupOpt {
  value: string;
  label: string;
}

export interface SiCargoListViewProps {
  pageIndexes: number[];
  containerFields: { id: string }[];
  containersWatch: SiCargoStepForm["containers"];
  control: Control<SiCargoStepForm>;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  containerTypes: LookupOpt[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setValue: UseFormSetValue<SiCargoStepForm>;
  getValues: UseFormGetValues<SiCargoStepForm>;
  toastError: (message: string) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  renderContainerFooter?: (container: SIContainer, index: number) => ReactNode;
}

export function SiCargoListView({
  pageIndexes,
  containerFields,
  containersWatch,
  control,
  errors,
  packageTypes,
  containerTypes,
  expandedId,
  setExpandedId,
  setValue,
  getValues,
  toastError,
  onDuplicate,
  onDelete,
  renderContainerFooter,
}: SiCargoListViewProps) {
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
          container ?? { containerNo: "", cargoLines: [] },
        );
        const sums = sumContainerCargo(
          (container ?? createEmptyContainer()) as SIContainer,
        );
        const hasNumber = Boolean(container?.containerNo?.trim());
        const seal = container?.carrierSeal || container?.shipperSeal || "—";
        const lineCount = container?.cargoLines?.length ?? 0;

        return (
          <div key={fieldId} className="si-cargo-sicard">
            <div
              className="si-cargo-ct-row-wrap"
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() =>
                setExpandedId(open ? null : container?.id ?? fieldId)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(open ? null : container?.id ?? fieldId);
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
              <Text
                strong={hasNumber}
                className={[
                  "si-cargo-ct-no",
                  hasNumber ? undefined : "si-cargo-ct-no--empty",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {hasNumber ? container?.containerNo : "No number"}
              </Text>
              <span className="si-cargo-type-badge">
                {container?.eqpSize || "—"}
              </span>
              <Text type="secondary" className="si-cargo-ct-seal">
                Seal {seal}
              </Text>
              <div className="si-cargo-ct-meta si-cargo-ct-meta--commod">
                <Text className="si-cargo-ct-meta__value">
                  {lineCount} · {sums.packages.toLocaleString()} pkgs
                </Text>
                <span className="si-cargo-ct-meta__label">Commodities</span>
              </div>
              <div className="si-cargo-ct-meta si-cargo-ct-meta--end si-cargo-ct-meta--kg">
                <Text className="si-cargo-ct-meta__value">
                  {sums.grossWeight.toLocaleString()}
                </Text>
                <span className="si-cargo-ct-meta__label">kg</span>
              </div>
              <div className="si-cargo-ct-meta si-cargo-ct-meta--end si-cargo-ct-meta--cbm">
                <Text className="si-cargo-ct-meta__value">
                  {sums.volume.toFixed(1)}
                </Text>
                <span className="si-cargo-ct-meta__label">CBM</span>
              </div>
              <span className="si-cargo-ct-status">
                {issues === 0 ? (
                  <span className="si-cargo-vchip si-cargo-vchip--ok">
                    Complete
                  </span>
                ) : (
                  <span className="si-cargo-vchip si-cargo-vchip--warn">
                    {issues} to fix
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
                container={container as SIContainer}
                errors={errors}
                packageTypes={packageTypes}
                containerTypes={containerTypes}
                setValue={setValue}
                getValues={getValues}
                toastError={toastError}
                footer={renderContainerFooter?.(container as SIContainer, ci)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ContainerEditorPanelProps {
  control: Control<SiCargoStepForm>;
  containerIndex: number;
  container: SIContainer;
  errors: Record<string, unknown>;
  packageTypes: LookupOpt[];
  containerTypes: LookupOpt[];
  setValue: UseFormSetValue<SiCargoStepForm>;
  getValues: UseFormGetValues<SiCargoStepForm>;
  toastError: (message: string) => void;
  footer?: ReactNode;
}

function ContainerEditorPanel({
  control,
  containerIndex: ci,
  container,
  errors,
  packageTypes,
  containerTypes,
  setValue,
  getValues,
  toastError,
  footer,
}: ContainerEditorPanelProps) {
  const { fields, remove, insert } = useFieldArray({
    control,
    name: `containers.${ci}.cargoLines`,
  });
  const cargoLinesWatch = container?.cargoLines;

  return (
    <div className="si-cargo-editor-panel">
      <div className="si-cargo-editor-fields">
        <div className="form-field-cell">
          <label className="form-field-label">
            Container No. <Text type="danger">*</Text>
          </label>
          <Controller
            control={control}
            name={`containers.${ci}.containerNo`}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                size="large"
                placeholder="Container No."
                className="form-field-full-width"
              />
            )}
          />
        </div>
        {/* <div className="form-field-cell">
          <label className="form-field-label">Type / Size</label>
          <Controller
            control={control}
            name={`containers.${ci}.eqpSize`}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={containerTypes}
                className="form-field-full-width"
                showSearch
                optionFilterProp="label"
              />
            )}
          />
        </div> */}
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
      </div>

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
    </div>
  );
}
