// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { AppButton, AppSelect } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Flex, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  SpreadsheetImportFieldDefinition,
  SpreadsheetImportFieldKey,
} from "../types/import-workbench.types";

type RowFilterValue = "all" | "errors";
const ALL_COLUMNS_VALUE = "__all_columns__";

interface ImportReviewToolbarProps<TValues extends object> {
  bulkField: SpreadsheetImportFieldDefinition<TValues> | undefined;
  bulkFieldStats:
    | {
        emptyCount: number;
        invalidCount: number;
        issueCodeCounts: Map<string, number>;
      }
    | undefined;
  errorsVisible: boolean;
  fieldStatsByKey: Map<
    SpreadsheetImportFieldKey<TValues>,
    {
      emptyCount: number;
      invalidCount: number;
      issueCodeCounts: Map<string, number>;
    }
  >;
  isBusy: boolean;
  missingCountryCodeCount: number;
  navigationTargetCount: number;
  onAddCountryCode: () => void;
  onChangeBulkField: (fieldKey?: string) => void;
  onChangeRowFilter: (value: RowFilterValue) => void;
  onFillEmpty: () => void;
  onNextError: () => void;
  onPreviousError: () => void;
  onReplaceInvalid: () => void;
  onToggleErrors: () => void;
  onToggleSheet: (sheetName: string) => void;
  rowFilter: RowFilterValue;
  selectedSheetName?: string;
  sheetOptions: Array<{ label: string; value: string }>;
  supportedFields: readonly SpreadsheetImportFieldDefinition<TValues>[];
}

function renderBulkFieldLabel({
  emptyCount,
  invalidCount,
  label,
}: {
  emptyCount: number;
  invalidCount: number;
  label: string;
}) {
  const issueTotal = emptyCount + invalidCount;

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={8}
      wrap={false}
      style={{ minWidth: 0, width: "100%" }}
    >
      <Typography.Text ellipsis style={{ minWidth: 0, flex: 1 }}>
        {label}
        {/* {issueTotal > 0 ? ` (${issueTotal})` : ""} */}
      </Typography.Text>
      <Flex gap={4} wrap={false}>
        {invalidCount > 0 ? (
          <Tag color="error" style={{ flexShrink: 0, marginInlineEnd: 0 }}>
            {invalidCount} invalid
          </Tag>
        ) : null}
        {emptyCount > 0 ? (
          <Tag color="warning" style={{ flexShrink: 0, marginInlineEnd: 0 }}>
            {emptyCount} empty
          </Tag>
        ) : null}
      </Flex>
    </Flex>
  );
}

export function ImportReviewToolbar<TValues extends object>({
  bulkField,
  bulkFieldStats,
  errorsVisible,
  fieldStatsByKey,
  isBusy,
  missingCountryCodeCount,
  navigationTargetCount,
  onAddCountryCode,
  onChangeBulkField,
  onChangeRowFilter,
  onFillEmpty,
  onNextError,
  onPreviousError,
  onReplaceInvalid,
  onToggleErrors,
  onToggleSheet,
  rowFilter,
  selectedSheetName,
  sheetOptions,
  supportedFields,
}: ImportReviewToolbarProps<TValues>) {
  const { isExtraSmall } = useAntdBreakpoint();

  const bulkFieldOptions = [
    {
      label: "All Columns",
      emptyCount: 0,
      invalidCount: 0,
      value: ALL_COLUMNS_VALUE,
    },
    ...supportedFields.map((field) => {
      const counts = fieldStatsByKey.get(field.key) ?? {
        emptyCount: 0,
        invalidCount: 0,
      };

      return {
        label: field.label,
        emptyCount: counts.emptyCount,
        invalidCount: counts.invalidCount,
        value: field.key,
      };
    }),
  ];

  const selectedFieldCounts = bulkFieldStats ?? {
    emptyCount: 0,
    invalidCount: 0,
    issueCodeCounts: new Map<string, number>(),
  };

  const handleSheetSelect = (value: unknown) => {
    if (typeof value === "string") {
      onToggleSheet(value);
    }
  };

  const handleRowFilterSelect = (value: unknown) => {
    if (value === "all" || value === "errors") {
      onChangeRowFilter(value);
    }
  };

  const handleBulkFieldSelect = (value: unknown) => {
    const nextValue =
      typeof value === "string"
        ? value
        : value && typeof value === "object" && "value" in value
        ? String((value as { value: unknown }).value)
        : undefined;

    if (!nextValue) {
      return;
    }

    onChangeBulkField(nextValue === ALL_COLUMNS_VALUE ? undefined : nextValue);
  };

  const selectedBulkFieldOption = bulkFieldOptions.find(
    (option) => option.value === (bulkField?.key ?? ALL_COLUMNS_VALUE),
  );

  return (
    <div className="import-wb-toolbar">
      <div className="import-wb-toolbar__filters">
        {sheetOptions.length > 1 ? (
          <AppSelect
            style={{ width: isExtraSmall ? 120 : 180 }}
            options={sheetOptions}
            value={selectedSheetName}
            onChange={handleSheetSelect}
            placeholder="Sheet"
          />
        ) : null}
        <AppSelect
          style={{ width: isExtraSmall ? 100 : 120 }}
          value={rowFilter}
          options={[
            { label: "All rows", value: "all" },
            { label: "Errors", value: "errors" },
          ]}
          onChange={handleRowFilterSelect}
        />
        <AppSelect
          style={{
            width: isExtraSmall ? "100%" : 260,
            minWidth: isExtraSmall ? 160 : 220,
            flex: isExtraSmall ? "1 1 100%" : "0 1 260px",
          }}
          value={bulkField?.key ?? ALL_COLUMNS_VALUE}
          options={bulkFieldOptions}
          styles={{
            popup: {
              root: {
                maxWidth: "calc(100vw - 32px)",
              },
            },
          }}
          optionRender={(option) => {
            const invalidCount =
              typeof option.data.invalidCount === "number"
                ? option.data.invalidCount
                : 0;
            const emptyCount =
              typeof option.data.emptyCount === "number"
                ? option.data.emptyCount
                : 0;

            return renderBulkFieldLabel({
              emptyCount,
              invalidCount,
              label: String(option.data.label),
            });
          }}
          labelRender={() =>
            renderBulkFieldLabel({
              emptyCount: selectedBulkFieldOption?.emptyCount ?? 0,
              invalidCount: selectedBulkFieldOption?.invalidCount ?? 0,
              label: selectedBulkFieldOption?.label ?? "All Columns",
            })
          }
          onChange={handleBulkFieldSelect}
        />
      </div>

      <div className="import-wb-toolbar__actions custom-scroll">
        {bulkField?.valueFormat === "phone-e164" ? (
          <AppButton
            icon={<AppIcon icon={Icons.settings} size={16} />}
            onClick={onAddCountryCode}
            disabled={isBusy || missingCountryCodeCount === 0}
          >
            {isExtraSmall ? null : "Add Country Code"}
          </AppButton>
        ) : null}
        <AppButton
          icon={<AppIcon icon={Icons.settings} size={16} />}
          onClick={onReplaceInvalid}
          disabled={
            !bulkField || isBusy || selectedFieldCounts.invalidCount === 0
          }
        >
          {isExtraSmall ? null : "Replace Invalid"}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.settings} size={16} />}
          onClick={onFillEmpty}
          disabled={
            !bulkField || isBusy || selectedFieldCounts.emptyCount === 0
          }
        >
          {isExtraSmall ? null : "Fill Empty"}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.chevronLeft} size={16} />}
          onClick={onPreviousError}
          disabled={navigationTargetCount === 0 || isBusy}
          aria-label="Previous error"
        >
          {isExtraSmall ? null : "Prev"}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.chevronRight} size={16} />}
          onClick={onNextError}
          disabled={navigationTargetCount === 0 || isBusy}
          aria-label="Next error"
        >
          {isExtraSmall ? null : "Next"}
        </AppButton>
        <AppButton
          type={errorsVisible ? "primary" : "default"}
          icon={<AppIcon icon={Icons.alert} size={16} />}
          onClick={onToggleErrors}
          aria-label="Toggle errors"
        >
          {isExtraSmall ? null : errorsVisible ? "Hide Errors" : "Errors"}
        </AppButton>
      </div>
    </div>
  );
}
