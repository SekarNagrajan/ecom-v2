import { FilterOutlined } from '@ant-design/icons';
import { Tag, Flex, Typography, theme } from 'antd';
import type { ReactNode } from 'react';

import { useDateFormat } from '../../../../hooks';
import { FormattedCurrency, FormattedNumber } from '../../../formatted-number';
import {
  useFilters,
  useFilterConfig,
  useDataViewActions,
} from '../../context/data-view-context';
import type {
  FilterValue,
  FilterFieldConfig,
} from '../../stores/data-view-types';

const { Text } = Typography;

export interface FilterChipsProps {
  maxVisible?: number;
  compact?: boolean;
}

function withOperatorPrefix(value: ReactNode, operator?: string): ReactNode {
  const operatorPrefix: Record<string, string> = {
    contains: '~ ',
    startsWith: '^ ',
    endsWith: '$ ',
    greaterThan: '> ',
    lessThan: '< ',
    notEquals: '≠ ',
    before: '< ',
    after: '> ',
  };

  if (!operator || operator === 'equals') {
    return value;
  }

  const prefix = operatorPrefix[operator] ?? '';
  if (!prefix) return value;

  return (
    <span>
      {prefix}
      {value}
    </span>
  );
}

function renderNumberValue(
  value: unknown,
  format: 'number' | 'currency'
): ReactNode {
  if (format === 'currency') {
    return (
      <FormattedCurrency value={value as number | string | null | undefined} />
    );
  }

  return (
    <FormattedNumber value={value as number | string | null | undefined} />
  );
}

function renderDateValue(
  value: string | null | undefined,
  formatDate: (v: string | null | undefined) => string
): ReactNode {
  return formatDate(value);
}

function getFilterDisplayValue(
  filter: FilterValue,
  config: FilterFieldConfig | undefined,
  formatDate: (v: string | null | undefined) => string
): ReactNode {
  const { value, operator } = filter;

  if (operator === 'blank') {
    return 'Is empty';
  }
  if (operator === 'notBlank') {
    return 'Is not empty';
  }

  if (value === undefined || value === null) {
    return '';
  }

  if (Array.isArray(value)) {
    if (config?.type === 'multiselect' || config?.type === 'select') {
      const options = config.options ?? [];

      const labels = value.map((v) => {
        const option = options.find((o) => String(o.value) === String(v));
        return option?.label ?? String(v);
      });

      if (labels.length > 2) {
        return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
      }
      return labels.join(', ');
    }

    if (
      (config?.type === 'daterange' || config?.type === 'date') &&
      value.length === 2
    ) {
      return (
        <span>
          {renderDateValue(value[0] as string, formatDate)} –{' '}
          {renderDateValue(value[1] as string, formatDate)}
        </span>
      );
    }

    if (config?.type === 'number' && value.length === 2) {
      const format =
        config.displayFormat === 'currency' ? 'currency' : 'number';
      return (
        <span>
          {renderNumberValue(value[0], format)} –{' '}
          {renderNumberValue(value[1], format)}
        </span>
      );
    }

    return value.join(', ');
  }

  if (config?.type === 'select') {
    const options = config.options ?? [];
    const option = options.find((o) => String(o.value) === String(value));
    return option?.label ?? String(value);
  }

  if (config?.type === 'date') {
    return withOperatorPrefix(
      renderDateValue(value as string, formatDate),
      operator
    );
  }

  if (config?.type === 'number') {
    const format = config.displayFormat === 'currency' ? 'currency' : 'number';
    return withOperatorPrefix(renderNumberValue(value, format), operator);
  }

  return withOperatorPrefix(String(value), operator);
}

export function FilterChips({
  maxVisible = 5,
  compact = false,
}: FilterChipsProps) {
  const { token } = theme.useToken();

  const filters = useFilters();
  const filterConfig = useFilterConfig();
  const actions = useDataViewActions();
  const { formatDate } = useDateFormat();

  const configMap = new Map<string, FilterFieldConfig>();
  filterConfig.forEach((c) => configMap.set(c.field, c));

  const activeFilters = filters.filter((f) => {
    if (f.operator === 'blank' || f.operator === 'notBlank') {
      return true;
    }
    if (f.value === undefined || f.value === null || f.value === '') {
      return false;
    }
    if (Array.isArray(f.value) && f.value.length === 0) {
      return false;
    }
    return true;
  });

  const handleRemove = (field: string) => {
    actions.setFilters(filters.filter((f) => f.field !== field));
  };

  const handleClearAll = () => {
    actions.setFilters([]);
  };

  const visibleFilters = activeFilters.slice(0, maxVisible);
  const hiddenCount = activeFilters.length - maxVisible;

  const labelTag = (
    <Tag
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXXS,
        margin: 0,
        padding: `${token.paddingXXS / 2}px ${token.paddingSM}px`,
        borderRadius: token.borderRadiusLG,
        background: token.colorPrimaryBg,
        borderColor: token.colorPrimaryBorder,
        color: token.colorPrimaryText,
        fontWeight: 600,
      }}
    >
      <FilterOutlined style={{ fontSize: 12 }} />
      <span>Filters</span>
    </Tag>
  );

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Flex wrap="wrap" gap={token.marginXXS} align="center">
      {labelTag}

      {visibleFilters.map((filter) => {
        const config = configMap.get(filter.field);
        const label = config?.label ?? filter.field;
        const displayValue = getFilterDisplayValue(filter, config, formatDate);

        return (
          <Tag
            key={filter.field}
            closable
            onClose={() => handleRemove(filter.field)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: token.marginXXS,
              margin: 0,
              padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillTertiary,
              borderColor: token.colorPrimaryBorder,
            }}
          >
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {label}:
            </Text>
            <Text style={{ fontSize: token.fontSizeSM }}>{displayValue}</Text>
          </Tag>
        );
      })}

      {hiddenCount > 0 && (
        <Tag
          style={{
            margin: 0,
            padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
            borderRadius: token.borderRadiusLG,
            background: token.colorFillTertiary,
            borderColor: token.colorPrimaryBorder,
          }}
        >
          +{hiddenCount} more
        </Tag>
      )}

      {activeFilters.length > 1 && (
        <Tag
          onClick={handleClearAll}
          style={{
            cursor: 'pointer',
            margin: 0,
            padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
            borderRadius: token.borderRadiusLG,
            color: token.colorError,
            borderColor: token.colorErrorBorder,
          }}
        >
          Clear all
        </Tag>
      )}
    </Flex>
  );
}
