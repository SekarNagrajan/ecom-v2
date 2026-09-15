import { DateTime } from 'luxon';

import type {
  SpreadsheetImportFieldDefinition,
  SpreadsheetImportFieldKind,
} from '../types/import-workbench.types';

export const STANDARD_IMPORT_DATE_FORMAT = 'yyyy-MM-dd';
export const STANDARD_IMPORT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/**
 * Keep import rules centralized so each feature only describes field metadata.
 * The workbench can then apply consistent parsing, guidance, and bulk-edit UI
 * across leads, opportunities, and future import screens.
 */
export function isPhoneImportField<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  return field.valueFormat === 'phone-e164';
}

export function isCurrencyAmountImportField<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  return field.valueFormat === 'currency-amount';
}

export function isEmailImportField<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  return field.valueFormat === 'email';
}

export function isDateImportField<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  return field.kind === 'date';
}

export function isDateTimeImportField<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  return field.kind === 'datetime';
}

export function getSpreadsheetImportFormatHint<TValues extends object>(
  field: SpreadsheetImportFieldDefinition<TValues>
) {
  if (field.importFormatHint) {
    return field.importFormatHint;
  }

  if (isPhoneImportField(field)) {
    return 'International format with country code';
  }

  if (isEmailImportField(field)) {
    return 'Standard email address';
  }

  if (isCurrencyAmountImportField(field)) {
    return 'Numeric amount';
  }

  if (field.kind === 'date') {
    return STANDARD_IMPORT_DATE_FORMAT;
  }

  if (field.kind === 'datetime') {
    return STANDARD_IMPORT_DATETIME_FORMAT;
  }

  if (field.kind === 'number') {
    return 'Numeric value';
  }

  return null;
}

export function normalizeImportedEmailValue(rawValue: unknown) {
  return String(rawValue ?? '')
    .trim()
    .toLowerCase();
}

export function normalizeImportedNumberValue(
  rawValue: unknown,
  options?: {
    allowFormattedCurrency?: boolean;
  }
) {
  if (typeof rawValue === 'number') {
    return rawValue;
  }

  const normalizedValue = String(rawValue ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  const sanitizedValue = options?.allowFormattedCurrency
    ? normalizedValue.replace(/[^0-9,.-]/g, '')
    : normalizedValue;
  const normalizedDecimalValue = sanitizedValue.replace(/,/g, '');
  const parsedValue = Number(normalizedDecimalValue);

  return Number.isFinite(parsedValue) ? parsedValue : normalizedValue;
}

export function normalizeImportedTemporalValue(
  rawValue: unknown,
  kind: Extract<SpreadsheetImportFieldKind, 'date' | 'datetime'>
) {
  const format =
    kind === 'date'
      ? STANDARD_IMPORT_DATE_FORMAT
      : STANDARD_IMPORT_DATETIME_FORMAT;

  if (rawValue instanceof Date) {
    const dateTime = DateTime.fromJSDate(rawValue);
    return dateTime.isValid ? dateTime.toFormat(format) : '';
  }

  const normalizedValue = String(rawValue ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  const strictParsed = DateTime.fromFormat(normalizedValue, format);
  if (strictParsed.isValid) {
    return strictParsed.toFormat(format);
  }

  const isoParsed = DateTime.fromISO(normalizedValue);
  if (isoParsed.isValid) {
    return isoParsed.toFormat(format);
  }

  return normalizedValue;
}
