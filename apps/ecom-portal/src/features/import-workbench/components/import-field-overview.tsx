// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { Flex, Tag, Typography, theme } from "antd";

import type { SpreadsheetImportFieldDefinition } from "../types/import-workbench.types";
import { getSpreadsheetImportFormatHint } from "../utils/spreadsheet-import-field-behavior";

interface ImportFieldOverviewProps<TValues extends object> {
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
  /** Dense card grid for empty-state side panel. */
  compact?: boolean;
}

function getExampleValues<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>,
) {
  if (field.exampleValues && field.exampleValues.length > 0) {
    return [...field.exampleValues];
  }

  if (field.kind === "boolean") {
    return ["Yes", "No"];
  }

  if (field.label.toLowerCase().includes("email")) {
    return ["shipper@example.com"];
  }

  return [];
}

function FieldCard<TValues extends object>({
  field,
}: {
  field: SpreadsheetImportFieldDefinition<TValues>;
}) {
  const examples = getExampleValues(field);
  const formatHint = getSpreadsheetImportFormatHint(field);
  const metaParts = [
    examples[0] ? `e.g. ${examples[0]}` : null,
    formatHint,
    field.useDefaultOnEmpty && field.defaultDisplayValue
      ? `Default: ${field.defaultDisplayValue}`
      : null,
  ].filter(Boolean);

  return (
    <div
      className={`import-wb-field-card${
        field.required ? " import-wb-field-card--required" : ""
      }`}
    >
      <div className="import-wb-field-card__top">
        <Typography.Text strong ellipsis>
          {field.label}
        </Typography.Text>
        <Tag
          color={field.required ? "processing" : "default"}
          style={{ marginInlineEnd: 0, flexShrink: 0 }}
        >
          {field.required ? "Required" : "Optional"}
        </Tag>
      </div>
      {metaParts.length > 0 ? (
        <div className="import-wb-field-card__meta">{metaParts.join(" · ")}</div>
      ) : (
        <div className="import-wb-field-card__meta">
          Header: {field.label}
          {field.aliases[0] ? ` / ${field.aliases[0]}` : ""}
        </div>
      )}
    </div>
  );
}

function FieldSection<TValues extends object>({
  fields,
  title,
}: {
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
  title: string;
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="import-wb-fields__section">
      <div className="import-wb-fields__section-title">
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Text type="secondary">{fields.length}</Typography.Text>
      </div>
      <div className="import-wb-fields__grid">
        {fields.map((field) => (
          <FieldCard key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}

/** Detailed row layout kept for popover Column Guide. */
function DetailedFieldRow<TValues extends object>({
  field,
  isLast,
}: {
  field: SpreadsheetImportFieldDefinition<TValues>;
  isLast: boolean;
}) {
  const { token } = theme.useToken();
  const examples = getExampleValues(field);
  const formatHint = getSpreadsheetImportFormatHint(field);
  const headers = [field.label, ...field.aliases].slice(0, 2);

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : `1px solid ${token.colorBorderSecondary}`,
        paddingBlock: token.paddingSM,
      }}
    >
      <Flex vertical gap={token.marginXS}>
        <Flex align="center" gap={token.marginXS} wrap>
          <Typography.Text strong>{field.label}</Typography.Text>
          <Tag color={field.required ? "processing" : "default"}>
            {field.required ? "Required" : "Optional"}
          </Tag>
        </Flex>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Header: {headers.join(", ")}
          {examples[0] ? ` · Example: ${examples[0]}` : ""}
          {formatHint ? ` · ${formatHint}` : ""}
        </Typography.Text>
      </Flex>
    </div>
  );
}

export function ImportFieldOverview<TValues extends object>({
  fields,
  compact = false,
}: ImportFieldOverviewProps<TValues>) {
  const { token } = theme.useToken();
  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);

  if (compact) {
    return (
      <div className="import-wb-fields">
        <FieldSection fields={requiredFields} title="Required fields" />
        <FieldSection fields={optionalFields} title="Optional fields" />
      </div>
    );
  }

  return (
    <Flex vertical gap={token.marginMD}>
      <div>
        <Typography.Text strong>Required</Typography.Text>
        <div
          style={{
            marginTop: token.marginXS,
            paddingInline: token.paddingSM,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
          }}
        >
          {requiredFields.map((field, index) => (
            <DetailedFieldRow
              key={field.key}
              field={field}
              isLast={index === requiredFields.length - 1}
            />
          ))}
        </div>
      </div>
      {optionalFields.length > 0 ? (
        <div>
          <Typography.Text strong>Optional</Typography.Text>
          <div
            style={{
              marginTop: token.marginXS,
              paddingInline: token.paddingSM,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
            }}
          >
            {optionalFields.map((field, index) => (
              <DetailedFieldRow
                key={field.key}
                field={field}
                isLast={index === optionalFields.length - 1}
              />
            ))}
          </div>
        </div>
      ) : null}
    </Flex>
  );
}
