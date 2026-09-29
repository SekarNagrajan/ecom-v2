// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { AppButton, AppSelect } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Flex, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

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
  emptyLabel,
  invalidCount,
  invalidLabel,
  label,
}: {
  emptyCount: number;
  emptyLabel: string;
  invalidCount: number;
  invalidLabel: string;
  label: string;
}) {
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
      </Typography.Text>
      <Flex gap={4} wrap={false}>
        {invalidCount > 0 ? (
          <Tag color="error" style={{ flexShrink: 0, marginInlineEnd: 0 }}>
            {invalidLabel}
          </Tag>
        ) : null}
        {emptyCount > 0 ? (
          <Tag color="warning" style={{ flexShrink: 0, marginInlineEnd: 0 }}>
            {emptyLabel}
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
  const { t } = useTranslation(["import-workbench", "common"]);
  const { isExtraSmall } = useAntdBreakpoint();
  const allColumnsLabel = t("toolbar.allColumns");

  const bulkFieldOptions = [
    {
      label: allColumnsLabel,
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
            placeholder={t("toolbar.sheet")}
          />
        ) : null}
        <AppSelect
          style={{ width: isExtraSmall ? 100 : 120 }}
          value={rowFilter}
          options={[
            { label: t("toolbar.allRows"), value: "all" },
            { label: t("toolbar.errors"), value: "errors" },
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
              emptyLabel: t("toolbar.emptyCount", { count: emptyCount }),
              invalidCount,
              invalidLabel: t("toolbar.invalidCount", { count: invalidCount }),
              label: String(option.data.label),
            });
          }}
          labelRender={() =>
            renderBulkFieldLabel({
              emptyCount: selectedBulkFieldOption?.emptyCount ?? 0,
              emptyLabel: t("toolbar.emptyCount", {
                count: selectedBulkFieldOption?.emptyCount ?? 0,
              }),
              invalidCount: selectedBulkFieldOption?.invalidCount ?? 0,
              invalidLabel: t("toolbar.invalidCount", {
                count: selectedBulkFieldOption?.invalidCount ?? 0,
              }),
              label: selectedBulkFieldOption?.label ?? allColumnsLabel,
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
            {isExtraSmall ? null : t("toolbar.addCountryCode")}
          </AppButton>
        ) : null}
        <AppButton
          icon={<AppIcon icon={Icons.settings} size={16} />}
          onClick={onReplaceInvalid}
          disabled={
            !bulkField || isBusy || selectedFieldCounts.invalidCount === 0
          }
        >
          {isExtraSmall ? null : t("toolbar.replaceInvalid")}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.settings} size={16} />}
          onClick={onFillEmpty}
          disabled={
            !bulkField || isBusy || selectedFieldCounts.emptyCount === 0
          }
        >
          {isExtraSmall ? null : t("toolbar.fillEmpty")}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.chevronLeft} size={16} />}
          onClick={onPreviousError}
          disabled={navigationTargetCount === 0 || isBusy}
          aria-label={t("a11y.previousError")}
        >
          {isExtraSmall ? null : t("toolbar.prev")}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.chevronRight} size={16} />}
          onClick={onNextError}
          disabled={navigationTargetCount === 0 || isBusy}
          aria-label={t("a11y.nextError")}
        >
          {isExtraSmall ? null : t("common:actions.next")}
        </AppButton>
        <AppButton
          type={errorsVisible ? "primary" : "default"}
          icon={<AppIcon icon={Icons.alert} size={16} />}
          onClick={onToggleErrors}
          aria-label={t("a11y.toggleErrors")}
        >
          {isExtraSmall
            ? null
            : errorsVisible
              ? t("toolbar.hideErrors")
              : t("toolbar.errors")}
        </AppButton>
      </div>
    </div>
  );
}
