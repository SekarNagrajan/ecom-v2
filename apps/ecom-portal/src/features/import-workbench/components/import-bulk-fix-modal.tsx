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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["import-workbench", "common"]);
  const { formattingRegion, currency, currencyDisplay } = useAppConfig();
  const controlStyle: CSSProperties = { width: "100%" };
  const clearOption = allowEmptyValue
    ? [{ label: t("bulkFix.options.clearValue"), value: "" }]
    : [];

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
        options={[...clearOption, ...(field.options ?? [])]}
        onChange={handleSelectChange}
        placeholder={t("bulkFix.placeholders.selectField", {
          field: field.label,
        })}
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
          ...clearOption,
          { label: t("common:actions.yes"), value: "true" },
          { label: t("common:actions.no"), value: "false" },
        ]}
        onChange={handleBooleanChange}
        placeholder={t("bulkFix.placeholders.selectField", {
          field: field.label,
        })}
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
        placeholder={
          isCurrency
            ? t("bulkFix.placeholders.enterAmount")
            : t("bulkFix.placeholders.enterField", { field: field.label })
        }
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
      placeholder={t("bulkFix.placeholders.enterField", {
        field: field.label,
      })}
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
  const { t } = useTranslation(["import-workbench", "common"]);

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
      placeholder={t("bulkFix.placeholders.selectCountryCode")}
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
  const { t } = useTranslation(["import-workbench", "common"]);
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
      ? t("bulkFix.modes.invalid")
      : mode === "countryCode"
        ? t("bulkFix.modes.countryCode")
        : t("bulkFix.modes.empty");

  const modeIcon =
    mode === "invalid"
      ? Icons.alertTriangle
      : mode === "countryCode"
        ? Icons.phone
        : Icons.formInput;

  const scopeDescription =
    mode === "invalid"
      ? t("bulkFix.descriptions.invalid")
      : mode === "countryCode"
        ? t("bulkFix.descriptions.countryCode")
        : t("bulkFix.descriptions.empty");

  const valueFieldLabel =
    mode === "countryCode"
      ? t("bulkFix.labels.countryCode")
      : mode === "invalid"
        ? t("bulkFix.labels.replacementFor", { field: field.label })
        : t("bulkFix.labels.fillInto", { field: field.label });

  const applyLabel =
    mode === "invalid"
      ? t("bulkFix.apply.replaceCells", { count: affectedCount })
      : mode === "countryCode"
        ? t("bulkFix.apply.updateNumbers", { count: affectedCount })
        : t("bulkFix.apply.fillCells", { count: affectedCount });

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
  const formatHint = getSpreadsheetImportFormatHint(field, t);
  const valueTypeLabel =
    mode === "countryCode" ? t("bulkFix.labels.phoneE164") : field.kind;

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
          <AppButton onClick={onClose}>{t("common:actions.cancel")}</AppButton>
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
                {field.required ? t("badges.required") : t("badges.optional")}
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
            label={t("bulkFix.labels.matchingCells")}
            value={affectedCount}
            tone={
              mode === "invalid"
                ? "error"
                : mode === "empty"
                  ? "warning"
                  : "default"
            }
          />
          <MetaChip
            label={t("bulkFix.labels.valueType")}
            value={valueTypeLabel}
          />
          {formatHint ? (
            <MetaChip label={t("bulkFix.labels.format")} value={formatHint} />
          ) : null}
        </Flex>

        {field.valueFormat === "phone-e164" ? (
          <Flex gap={token.marginSM} wrap>
            <MetaChip
              label={t("bulkFix.labels.missingCountryCode")}
              value={missingCountryCodeCount}
              tone="warning"
            />
            <MetaChip
              icon={Icons.alertTriangle}
              label={t("bulkFix.labels.otherInvalidPhones")}
              value={invalidPhoneCount}
              tone="error"
            />
            <MetaChip
              icon={Icons.formInput}
              label={t("bulkFix.labels.empty")}
              value={emptyCount}
            />
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
              {t("bulkFix.hints.clearOptional")}
            </Typography.Text>
          ) : null}
          {mode === "countryCode" ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {t("bulkFix.hints.countryCodeConvert")}
            </Typography.Text>
          ) : null}
          {!canApply && affectedCount > 0 ? (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, color: token.colorWarning }}
            >
              {t("bulkFix.hints.enterValid", {
                field: field.label.toLowerCase(),
              })}
            </Typography.Text>
          ) : null}
        </Flex>
      </Flex>
    </AppModal>
  );
}
