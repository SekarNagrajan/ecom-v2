// Modified by Sekar Nagarajan (2026-09-15 18:15)
import {
  AppButton,
  AppDatePicker,
  AppModal,
  AppSelect,
  CountryCodeSelect,
} from "@solverminds/shared-ui";
import { useAppConfig } from "@solverminds/shared-ui/hooks";
import { Flex, Input, InputNumber, theme, Typography } from "antd";
import { DateTime } from "luxon";
import { useState, type ChangeEvent, type CSSProperties } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SpreadsheetImportFieldDefinition } from "../types/import-workbench.types";
import {
  getSpreadsheetImportFormatHint,
  isCurrencyAmountImportField,
  STANDARD_IMPORT_DATE_FORMAT,
  STANDARD_IMPORT_DATETIME_FORMAT,
} from "../utils/spreadsheet-import-field-behavior";
import {
  PHONE_INVALID_ISSUE_CODE,
  PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE,
} from "../utils/spreadsheet-import-phone.utils";

interface ImportBulkFixModalProps<TValues extends object> {
  affectedCount: number;
  emptyCount?: number;
  field: SpreadsheetImportFieldDefinition<TValues>;
  issueCodeCounts?: Map<string, number>;
  mode: "empty" | "invalid" | "countryCode";
  onApply: (value: unknown) => void;
  onClose: () => void;
  open: boolean;
}

function toParsedReplacementValue(
  fieldKind: SpreadsheetImportFieldDefinition<object>["kind"],
  value: string,
  options?: {
    allowEmptyValue?: boolean;
  },
) {
  if (options?.allowEmptyValue && value === "") {
    return "";
  }

  if (fieldKind === "boolean") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return undefined;
  }

  if (fieldKind === "number") {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return undefined;
    }

    const parsedNumber = Number(trimmedValue);
    return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
  }

  if (fieldKind === "select") {
    return value || undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

function BulkFixValueField<TValues extends object>({
  allowEmptyValue,
  field,
  value,
  onChange,
}: {
  allowEmptyValue: boolean;
  field: SpreadsheetImportFieldDefinition<TValues>;
  onChange: (nextValue: string) => void;
  value: string;
}) {
  const { formattingRegion, currency, currencyDisplay } = useAppConfig();
  const controlStyle: CSSProperties = { width: "100%" };

  if (field.kind === "select") {
    const handleSelectChange = (nextValue: unknown) => {
      if (typeof nextValue === "string") {
        onChange(nextValue);
      }
    };

    return (
      <AppSelect
        style={controlStyle}
        value={value || undefined}
        options={[
          ...(allowEmptyValue ? [{ label: "Clear value", value: "" }] : []),
          ...(field.options ?? []),
        ]}
        onChange={handleSelectChange}
        placeholder={`Select ${field.label}`}
      />
    );
  }

  if (field.kind === "boolean") {
    const handleBooleanChange = (nextValue: unknown) => {
      if (typeof nextValue === "string") {
        onChange(nextValue);
      }
    };

    return (
      <AppSelect
        style={controlStyle}
        value={value || undefined}
        options={[
          ...(allowEmptyValue ? [{ label: "Clear value", value: "" }] : []),
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ]}
        onChange={handleBooleanChange}
        placeholder={`Select ${field.label}`}
      />
    );
  }

  if (field.kind === "date" || field.kind === "datetime") {
    const format =
      field.kind === "date"
        ? STANDARD_IMPORT_DATE_FORMAT
        : STANDARD_IMPORT_DATETIME_FORMAT;
    const parsedValue = value ? DateTime.fromFormat(value, format) : null;

    return (
      <AppDatePicker
        style={controlStyle}
        value={parsedValue?.isValid ? parsedValue : null}
        format={format}
        showTime={
          field.kind === "datetime"
            ? {
                format: "HH:mm:ss",
              }
            : false
        }
        onChange={(_, dateString) => {
          onChange(typeof dateString === "string" ? dateString : "");
        }}
        placeholder={format}
      />
    );
  }

  if (field.kind === "number") {
    const numberParts = new Intl.NumberFormat(formattingRegion).formatToParts(
      12345.6,
    );
    const decimalSeparator =
      numberParts.find((part) => part.type === "decimal")?.value ?? ".";
    const groupSeparator =
      numberParts.find((part) => part.type === "group")?.value ?? ",";
    const isCurrency = isCurrencyAmountImportField(field);
    const numberFormatter = new Intl.NumberFormat(formattingRegion, {
      style: isCurrency ? "currency" : "decimal",
      currency,
      currencyDisplay,
      maximumFractionDigits: 20,
    });

    return (
      <InputNumber
        style={controlStyle}
        size="large"
        stringMode
        value={value || null}
        placeholder={isCurrency ? "Enter amount" : `Enter ${field.label}`}
        formatter={(nextValue) => {
          const normalizedValue = String(nextValue ?? "").trim();

          if (!normalizedValue) {
            return "";
          }

          const parsedValue = Number(normalizedValue);

          if (!Number.isFinite(parsedValue)) {
            return normalizedValue;
          }

          return numberFormatter.format(parsedValue);
        }}
        parser={(displayValue) => {
          return String(displayValue ?? "")
            .replaceAll(groupSeparator, "")
            .replaceAll(decimalSeparator, ".")
            .replace(/[^0-9.-]/g, "");
        }}
        onChange={(nextValue) => {
          onChange(String(nextValue ?? ""));
        }}
      />
    );
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Input
      size="large"
      type="text"
      value={value}
      onChange={handleTextChange}
      placeholder={`Enter ${field.label}`}
      allowClear
    />
  );
}

function BulkPhoneCountryCodeField({
  value,
  onChange,
}: {
  onChange: (nextValue: string) => void;
  value: string;
}) {
  const handleSelectChange = (nextValue: unknown) => {
    if (typeof nextValue === "string") {
      onChange(nextValue);
    }
  };

  return (
    <CountryCodeSelect
      style={{ width: "100%" }}
      value={value || undefined}
      onChange={handleSelectChange}
      placeholder="Select country code"
    />
  );
}

function MetaChip({
  icon,
  label,
  value,
  tone,
}: {
  icon?: typeof Icons.info;
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "error" | "success";
}) {
  const { token } = theme.useToken();
  const toneColor =
    tone === "error"
      ? token.colorError
      : tone === "warning"
        ? token.colorWarning
        : tone === "success"
          ? token.colorSuccess
          : token.colorTextSecondary;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
        flex: "1 1 120px",
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
      }}
    >
      <Flex align="center" gap={token.marginXXS}>
        {icon ? (
          <AppIcon icon={icon} size={14} style={{ color: toneColor }} />
        ) : null}
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, lineHeight: 1.2 }}
        >
          {label}
        </Typography.Text>
      </Flex>
      <Typography.Text
        strong
        style={{
          color: toneColor,
          fontSize: token.fontSizeLG,
          lineHeight: 1.25,
        }}
      >
        {value}
      </Typography.Text>
    </div>
  );
}

export function ImportBulkFixModal<TValues extends object>({
  affectedCount,
  emptyCount = 0,
  field,
  issueCodeCounts,
  mode,
  onApply,
  onClose,
  open,
}: ImportBulkFixModalProps<TValues>) {
  const { token } = theme.useToken();
  const [replacementValue, setReplacementValue] = useState("");
  const allowEmptyValue = !field.required && mode !== "countryCode";

  const parsedReplacementValue = toParsedReplacementValue(
    field.kind,
    replacementValue,
    {
      allowEmptyValue,
    },
  );
  const canApply =
    (mode === "countryCode"
      ? replacementValue.trim().length > 0
      : parsedReplacementValue !== undefined) && affectedCount > 0;

  const modeLabel =
    mode === "invalid"
      ? "Replace Invalid Values"
      : mode === "countryCode"
      ? "Add Country Code"
      : "Fill Empty Values";

  const modeIcon =
    mode === "invalid"
      ? Icons.alertTriangle
      : mode === "countryCode"
      ? Icons.phone
      : Icons.formInput;

  const scopeDescription =
    mode === "invalid"
      ? "Only cells that currently fail validation for this column will change. Blank cells are left alone."
      : mode === "countryCode"
      ? "Only phone numbers missing a country code will be updated when they can be normalized."
      : "Only blank cells in this column will change. Existing values stay untouched.";

  const valueFieldLabel =
    mode === "countryCode"
      ? "Country code"
      : mode === "invalid"
      ? `Replacement value for ${field.label}`
      : `Value to fill into empty ${field.label} cells`;

  const applyLabel =
    mode === "invalid"
      ? `Replace ${affectedCount} cell${affectedCount === 1 ? "" : "s"}`
      : mode === "countryCode"
      ? `Update ${affectedCount} number${affectedCount === 1 ? "" : "s"}`
      : `Fill ${affectedCount} cell${affectedCount === 1 ? "" : "s"}`;

  const handleApply = () => {
    if (mode === "countryCode" && replacementValue.trim()) {
      onApply(replacementValue.trim());
      return;
    }

    if (parsedReplacementValue !== undefined) {
      onApply(parsedReplacementValue);
    }
  };

  const missingCountryCodeCount =
    issueCodeCounts?.get(PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE) ?? 0;
  const invalidPhoneCount = issueCodeCounts?.get(PHONE_INVALID_ISSUE_CODE) ?? 0;
  const formatHint = getSpreadsheetImportFormatHint(field);
  const valueTypeLabel = mode === "countryCode" ? "Phone (E.164)" : field.kind;

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      title={
        <Flex align="center" gap={token.marginSM}>
          <AppIcon icon={modeIcon} size={18} />
          <span>{modeLabel}</span>
        </Flex>
      }
      dialogSize="sm"
      destroyOnHidden
      footer={
        <Flex justify="end" gap={token.marginSM} style={{ width: "100%" }}>
          <AppButton onClick={onClose}>Cancel</AppButton>
          <AppButton type="primary" onClick={handleApply} disabled={!canApply}>
            {applyLabel}
          </AppButton>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <div
          style={{
            padding: token.paddingMD,
            borderRadius: token.borderRadiusLG,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Flex vertical gap={token.marginXS}>
            <Flex align="center" gap={token.marginXS} wrap>
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {field.label}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{
                  paddingInline: token.paddingXS,
                  paddingBlock: 2,
                  borderRadius: token.borderRadiusSM,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgContainer,
                  fontSize: token.fontSizeSM,
                }}
              >
                {field.required ? "Required" : "Optional"}
              </Typography.Text>
            </Flex>
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0, lineHeight: 1.5 }}
            >
              {scopeDescription}
            </Typography.Paragraph>
          </Flex>
        </div>

        <Flex gap={token.marginSM} wrap>
          <MetaChip
            label="Matching cells"
            value={affectedCount}
            tone={
              mode === "invalid"
                ? "error"
                : mode === "empty"
                ? "warning"
                : "default"
            }
          />
          <MetaChip label="Value type" value={valueTypeLabel} />
          {formatHint ? <MetaChip label="Format" value={formatHint} /> : null}
        </Flex>

        {field.valueFormat === "phone-e164" ? (
          <Flex gap={token.marginSM} wrap>
            <MetaChip
              label="Missing country code"
              value={missingCountryCodeCount}
              tone="warning"
            />
            <MetaChip
              icon={Icons.alertTriangle}
              label="Other invalid phones"
              value={invalidPhoneCount}
              tone="error"
            />
            <MetaChip icon={Icons.formInput} label="Empty" value={emptyCount} />
          </Flex>
        ) : null}

        <Flex vertical gap={token.marginXS}>
          <Typography.Text strong>{valueFieldLabel}</Typography.Text>
          {mode === "countryCode" ? (
            <BulkPhoneCountryCodeField
              value={replacementValue}
              onChange={setReplacementValue}
            />
          ) : (
            <BulkFixValueField
              allowEmptyValue={allowEmptyValue}
              field={field}
              value={replacementValue}
              onChange={setReplacementValue}
            />
          )}
          {allowEmptyValue ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Leave blank to clear this optional field in matching cells.
            </Typography.Text>
          ) : null}
          {mode === "countryCode" ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Choose a country and matching numbers will convert to
              international format.
            </Typography.Text>
          ) : null}
          {!canApply && affectedCount > 0 ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, color: token.colorWarning }}
            >
              Enter a valid {field.label.toLowerCase()} to enable apply.
            </Typography.Text>
          ) : null}
        </Flex>
      </Flex>
    </AppModal>
  );
}
