import { useAntdBreakpoint } from '@solverminds/shared-ui/hooks';
import { Flex, Tag, Typography, theme } from 'antd';

import type { SpreadsheetImportFieldDefinition } from '../types/import-workbench.types';
import { getSpreadsheetImportFormatHint } from '../utils/spreadsheet-import-field-behavior';

interface ImportColumnGuidePopoverContentProps<TValues extends object> {
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
}

function getFieldExampleValues<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  if (field.exampleValues && field.exampleValues.length > 0) {
    return [...field.exampleValues];
  }

  if (field.kind === 'boolean') {
    return ['Yes', 'No'];
  }

  if (field.label.toLowerCase().includes('email')) {
    return ['lead@example.com'];
  }

  if (field.label.toLowerCase().includes('mobile')) {
    return ['+919876543210'];
  }

  if (field.label.toLowerCase().includes('first name')) {
    return ['Ava'];
  }

  if (field.label.toLowerCase().includes('last name')) {
    return ['Sharma'];
  }

  if (field.label.toLowerCase().includes('company')) {
    return ['Northwind Logistics'];
  }

  return ['Free text'];
}

function getAcceptedValues<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  if (field.kind !== 'select') {
    return getFieldExampleValues(field);
  }

  return (field.options ?? []).map((option) =>
    option.label === option.value
      ? option.label
      : `${option.label} (${option.value})`
  );
}

function getDefaultValueLabel<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  if (!field.defaultDisplayValue) {
    return null;
  }

  if (field.kind !== 'select') {
    return field.defaultDisplayValue;
  }

  const matchedOption = field.options?.find(
    (option) => option.label === field.defaultDisplayValue
  );

  if (!matchedOption || matchedOption.value === field.defaultDisplayValue) {
    return field.defaultDisplayValue;
  }

  return `${matchedOption.label} (${matchedOption.value})`;
}

function ColumnGuideRow<TValues extends object>({
  field,
  isLast,
}: {
  field: SpreadsheetImportFieldDefinition<TValues>;
  isLast: boolean;
}) {
  const { token } = theme.useToken();
  const { isExtraSmall } = useAntdBreakpoint();
  const acceptedValues = getAcceptedValues(field);
  const defaultValueLabel = getDefaultValueLabel(field);
  const formatHint = getSpreadsheetImportFormatHint(field);

  return (
    <div
      style={{
        borderBottom: isLast
          ? 'none'
          : `1px solid ${token.colorBorderSecondary}`,
        display: 'grid',
        gap: token.marginSM,
        gridTemplateColumns: isExtraSmall ? '1fr' : '180px minmax(0, 1fr)',
        padding: token.paddingSM,
      }}
    >
      <Flex vertical gap={token.marginXXS}>
        <Flex align="center" gap={token.marginXS} wrap>
          <Typography.Text strong>{field.label}</Typography.Text>
          <Tag
            color={field.required ? 'processing' : 'default'}
            style={{ marginInlineEnd: 0 }}
          >
            {field.required ? 'Required' : 'Optional'}
          </Tag>
        </Flex>
        {field.aliases.length > 0 ? (
          <Typography.Text type="secondary">
            {`Also accepts: ${field.aliases.join(', ')}`}
          </Typography.Text>
        ) : null}
      </Flex>

      <Flex vertical gap={token.marginXXS}>
        <Flex gap={token.marginXXS} wrap>
          {acceptedValues.map((value) => (
            <Tag key={`${field.key}-${value}`} style={{ marginInlineEnd: 0 }}>
              {value}
            </Tag>
          ))}
        </Flex>

        {field.acceptedValueHint ? (
          <Typography.Text type="secondary">
            {field.acceptedValueHint}
          </Typography.Text>
        ) : null}

        {formatHint ? (
          <Typography.Text type="secondary">
            {`Format: ${formatHint}`}
          </Typography.Text>
        ) : null}

        {defaultValueLabel ? (
          <Typography.Text type="secondary">
            {`Defaults to ${defaultValueLabel} when empty`}
          </Typography.Text>
        ) : null}
      </Flex>
    </div>
  );
}

export function ImportColumnGuidePopoverContent<TValues extends object>({
  fields,
}: ImportColumnGuidePopoverContentProps<TValues>) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      gap={token.marginSM}
      style={{
        minWidth: 0,
        width: '100%',
      }}
    >
      <Typography.Text type="secondary">
        Use these sample formats while reviewing or fixing workbook values.
      </Typography.Text>

      <div
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {fields.map((field, index) => (
          <ColumnGuideRow
            key={field.key}
            field={field}
            isLast={index === fields.length - 1}
          />
        ))}
      </div>
    </Flex>
  );
}
