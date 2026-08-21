import { Input, type InputProps } from 'antd';
import { useCallback, useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import { type NumberFormatValues, NumericFormat } from 'react-number-format';

import { useAppConfig } from '../../../hooks';
import { getCurrencyMetadata } from '../../../utils/i18n/currency-helpers';
import {
  detectNumericGroupingStyle,
  getLocaleNumberSeparators,
} from '../../../utils/i18n/locale-helpers';
import type { NumberFormatterProps } from './types';

// -----------------------------------------------------------------------------
// THE ADAPTER
// -----------------------------------------------------------------------------
const AntInputAdapter = ({
  visualPrefix,
  visualSuffix,
  ...props
}: InputProps & {
  visualPrefix?: React.ReactNode;
  visualSuffix?: React.ReactNode;
}) => {
  return <Input {...props} prefix={visualPrefix} suffix={visualSuffix} />;
};

export const NumberFormatter = <T extends FieldValues>({
  field,
  numericMode = 'standard',
  valueType = 'number',
  isCurrency = false,
  className,
  prefix,
  suffix,
  onBlur,
  ...props
}: NumberFormatterProps<T>) => {
  const { formattingRegion, currency, currencyDisplay } = useAppConfig();

  const { value, onBlur: fieldOnBlur, onChange, ...restField } = field;

  // A. Locale Data (Separators)
  const { decimal, group } = useMemo(
    () => getLocaleNumberSeparators(formattingRegion),
    [formattingRegion]
  );

  const groupingStyle = useMemo(
    () => detectNumericGroupingStyle(formattingRegion),
    [formattingRegion]
  );

  // B. Currency Data
  const currencyMeta = useMemo(() => {
    if (!isCurrency) return null;
    return getCurrencyMetadata(formattingRegion, currency, currencyDisplay);
  }, [formattingRegion, currency, currencyDisplay, isCurrency]);

  const handleChange = useCallback(
    (values: NumberFormatValues) => {
      const { floatValue, value: stringValue } = values;

      // 1. User cleared input -> Set null
      if (stringValue === '') {
        onChange(valueType === 'string' ? '' : null);
        return;
      }

      // 2. User typed "-" or "-." -> Don't update state yet!
      // If we update state to null here, the input will clear the "-" sign.
      // By doing nothing, we let the library keep the "-" visible locally.
      if (floatValue === undefined) {
        return;
      }

      // 3. Valid number -> Update state using configured storage shape
      onChange(valueType === 'string' ? stringValue : floatValue);
    },
    [onChange, valueType]
  );

  // D. Constraints
  const allowNegative = numericMode === 'standard' || numericMode === 'integer';
  const decimalScale =
    numericMode === 'integer' || numericMode === 'positive-integer' ? 0 : 20;

  // E. Calculate Visuals
  const currencySymbol = currencyMeta?.symbol;
  const currencyPosition = currencyMeta?.position;
  const handleBlur = useCallback<NonNullable<InputProps['onBlur']>>(
    (event) => {
      fieldOnBlur();
      onBlur?.(event);
    },
    [fieldOnBlur, onBlur]
  );

  return (
    <NumericFormat
      // --- LOGIC (React Number Format) ---

      {...restField}
      // Spreading value from field causes issue
      value={value ?? ''}
      valueIsNumericString={valueType === 'string'}
      thousandSeparator={group}
      decimalSeparator={decimal}
      // Grouping Logic
      thousandsGroupStyle={groupingStyle} // 'thousand' | 'lakh' | 'wan'
      allowNegative={allowNegative}
      decimalScale={decimalScale}
      fixedDecimalScale={false}
      className={className}
      onValueChange={handleChange}
      // --- UI (Ant Design via Adapter) ---
      customInput={AntInputAdapter}
      getInputRef={field.ref}
      onBlur={handleBlur}
      visualPrefix={
        isCurrency ? currencyPosition === 'start' && currencySymbol : prefix
      }
      visualSuffix={
        isCurrency ? currencyPosition === 'end' && currencySymbol : suffix
      }
      {...props}
    />
  );
};
