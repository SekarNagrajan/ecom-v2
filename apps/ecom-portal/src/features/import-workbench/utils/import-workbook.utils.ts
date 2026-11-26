import {
  type SpreadsheetImportAdapter,
  SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE,
  type SpreadsheetImportFieldDefinition,
  type SpreadsheetImportFieldKey,
  type SpreadsheetImportGridRow,
  type SpreadsheetImportIssueRecord,
  type SpreadsheetImportParseState,
  type SpreadsheetImportServerRowError,
  SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
} from '../types/import-workbench.types';
import {
  normalizeImportedEmailValue,
  normalizeImportedNumberValue,
  normalizeImportedTemporalValue,
} from './spreadsheet-import-field-behavior';
import {
  applyPhoneCountryCode,
  normalizeImportedPhoneValue,
} from './spreadsheet-import-phone.utils';

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1']);
const FALSE_VALUES = new Set(['false', 'no', 'n', '0']);

const PARSE_CHUNK_SIZE = 500;

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

const normalizeHeaderToken = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
};

const toDisplayString = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

export const isSpreadsheetImportValueEmpty = (value: unknown) => {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  return false;
};

const isRowEmpty = (row: readonly unknown[]) => {
  return row.every((cell) => toDisplayString(cell).length === 0);
};

const getHeaderRowIndex = (rows: readonly unknown[][]) => {
  return rows.findIndex((row) => !isRowEmpty(row));
};

export const coerceCellValue = <
  TValues extends object,
  TKey extends Extract<keyof TValues, string>
>(
  rawValue: unknown,
  field: SpreadsheetImportFieldDefinition<TValues> & { key: TKey }
): TValues[TKey] => {
  if (field.kind === 'select') {
    const normalizedValue = toDisplayString(rawValue);

    if (!normalizedValue) {
      return '' as TValues[TKey];
    }

    const candidate = normalizedValue.trim().toLowerCase();
    const matchedOption = (field.options ?? []).find((option) => {
      const optionValue = option.value.trim().toLowerCase();
      const optionLabel = option.label.trim().toLowerCase();

      return candidate === optionValue || candidate === optionLabel;
    });

    return (matchedOption?.value ?? normalizedValue) as TValues[TKey];
  }

  if (field.kind === 'boolean') {
    if (typeof rawValue === 'boolean') {
      return rawValue as TValues[TKey];
    }

    const normalizedValue = toDisplayString(rawValue).toLowerCase();

    if (TRUE_VALUES.has(normalizedValue)) {
      return true as TValues[TKey];
    }

    if (FALSE_VALUES.has(normalizedValue)) {
      return false as TValues[TKey];
    }

    if (!normalizedValue) {
      return '' as TValues[TKey];
    }

    return normalizedValue as TValues[TKey];
  }

  if (field.kind === 'number') {
    return normalizeImportedNumberValue(rawValue, {
      allowFormattedCurrency: field.valueFormat === 'currency-amount',
    }) as TValues[TKey];
  }

  if (field.kind === 'date' || field.kind === 'datetime') {
    return normalizeImportedTemporalValue(
      rawValue,
      field.kind
    ) as TValues[TKey];
  }

  if (field.valueFormat === 'email') {
    return normalizeImportedEmailValue(rawValue) as TValues[TKey];
  }

  if (field.valueFormat === 'phone-e164') {
    return normalizeImportedPhoneValue(rawValue) as TValues[TKey];
  }

  return toDisplayString(rawValue) as TValues[TKey];
};

const buildFieldAliasMap = <TValues extends object>(
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[]
) => {
  const aliasMap = new Map<string, SpreadsheetImportFieldDefinition<TValues>>();

  for (const field of fields) {
    aliasMap.set(normalizeHeaderToken(field.label), field);

    for (const alias of field.aliases) {
      aliasMap.set(normalizeHeaderToken(alias), field);
    }
  }

  return aliasMap;
};

const buildImportIssueRecords = <TValues extends object>(
  rowId: string,
  rowNumber: number,
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[],
  issues: ReturnType<
    SpreadsheetImportAdapter<TValues, unknown>['validateRecord']
  >
): SpreadsheetImportIssueRecord<TValues>[] => {
  return issues.map((issue, index) => ({
    id: `${rowId}:${issue.fieldKey}:${index}`,
    code: issue.code,
    fieldKey: issue.fieldKey,
    fieldLabel:
      fields.find((field) => field.key === issue.fieldKey)?.label ??
      issue.fieldKey,
    message: issue.message,
    rowId,
    rowNumber,
  }));
};

const collectIssueFieldKeys = <TValues extends object>(
  issues: readonly SpreadsheetImportIssueRecord<TValues>[]
) => {
  return [...new Set(issues.map((issue) => issue.fieldKey))];
};

const mergeFieldKeys = <TValues extends object>(
  ...fieldGroups: ReadonlyArray<readonly SpreadsheetImportFieldKey<TValues>[]>
) => {
  return [...new Set(fieldGroups.flatMap((fieldKeys) => fieldKeys))];
};

const buildSpreadsheetGridRow = <TValues extends object, TPayload>(
  values: TValues,
  rowId: string,
  rowNumber: number,
  adapter: SpreadsheetImportAdapter<TValues, TPayload>,
  metadata?: {
    editedFieldKeys?: readonly SpreadsheetImportFieldKey<TValues>[];
    fixedFieldKeys?: readonly SpreadsheetImportFieldKey<TValues>[];
    initialIssueFieldKeys?: readonly SpreadsheetImportFieldKey<TValues>[];
    previousIssues?: readonly SpreadsheetImportIssueRecord<TValues>[];
  }
): SpreadsheetImportGridRow<TValues> => {
  const issues = buildImportIssueRecords(
    rowId,
    rowNumber,
    adapter.fields,
    adapter.validateRecord(values)
  );
  const issueFieldKeys = collectIssueFieldKeys(issues);
  const previousIssueFieldKeys = collectIssueFieldKeys(
    metadata?.previousIssues ?? []
  );
  const initialIssueFieldKeys =
    metadata?.initialIssueFieldKeys ?? issueFieldKeys;
  const editedFieldKeys = mergeFieldKeys(metadata?.editedFieldKeys ?? []);
  const trackedCandidateFieldKeys = mergeFieldKeys(
    metadata?.fixedFieldKeys ?? [],
    initialIssueFieldKeys,
    previousIssueFieldKeys
  );
  const issueFieldKeySet = new Set(issueFieldKeys);
  const editedFieldKeySet = new Set(editedFieldKeys);
  const fixedFieldKeys = trackedCandidateFieldKeys.filter(
    (fieldKey) =>
      editedFieldKeySet.has(fieldKey) && !issueFieldKeySet.has(fieldKey)
  );

  return {
    ...values,
    __rowId: rowId,
    __rowNumber: rowNumber,
    __isValid: issues.length === 0,
    __issueCount: issues.length,
    __issues: issues,
    __editedFieldKeys: editedFieldKeys,
    __fixedFieldKeys: fixedFieldKeys,
    __initialIssueFieldKeys: [...initialIssueFieldKeys],
  };
};

// ---------------------------------------------------------------------------
// Phase 1: Pure data coercion (runs in Web Worker — no adapter functions needed)
// ---------------------------------------------------------------------------

export interface CoercedRowData<TValues extends object> {
  values: TValues;
  rowId: string;
  rowNumber: number;
}

export interface CoerceResult<TValues extends object> {
  headers: string[];
  coercedRows: CoercedRowData<TValues>[];
  unmatchedHeaders: string[];
}

export function coerceSpreadsheetRows<TValues extends object>(
  rawRows: readonly unknown[][],
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[],
  templateValues: TValues
): CoerceResult<TValues> {
  const headerRowIndex = getHeaderRowIndex(rawRows);

  if (headerRowIndex === -1) {
    return { headers: [], coercedRows: [], unmatchedHeaders: [] };
  }

  const headerRow = rawRows[headerRowIndex] ?? [];
  const headers = headerRow.map((cell) => toDisplayString(cell));
  const aliasMap = buildFieldAliasMap(fields);
  const unmatchedHeaders = new Set<string>();
  const coercedRows: CoercedRowData<TValues>[] = [];

  for (
    let sourceIndex = headerRowIndex + 1;
    sourceIndex < rawRows.length;
    sourceIndex += 1
  ) {
    const sourceRow = rawRows[sourceIndex] ?? [];

    if (isRowEmpty(sourceRow)) {
      continue;
    }

    const values = { ...templateValues };

    headers.forEach((header, columnIndex) => {
      if (!header) {
        return;
      }

      const field = aliasMap.get(normalizeHeaderToken(header));
      const cellValue = sourceRow[columnIndex];

      if (!field) {
        if (toDisplayString(cellValue)) {
          unmatchedHeaders.add(header);
        }
        return;
      }

      if (field.useDefaultOnEmpty && isSpreadsheetImportValueEmpty(cellValue)) {
        return;
      }

      values[field.key] = coerceCellValue(cellValue, field);
    });

    coercedRows.push({
      values,
      rowId: `row-${sourceIndex + 1}`,
      rowNumber: sourceIndex + 1,
    });
  }

  return { headers, coercedRows, unmatchedHeaders: [...unmatchedHeaders] };
}

// ---------------------------------------------------------------------------
// Phase 2: Validation + grid row building (main thread only — needs adapter)
// ---------------------------------------------------------------------------

export async function validateAndBuildGridRows<
  TValues extends object,
  TPayload
>(
  coercedRows: readonly CoercedRowData<TValues>[],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
): Promise<SpreadsheetImportGridRow<TValues>[]> {
  const gridRows: SpreadsheetImportGridRow<TValues>[] = [];
  let processed = 0;

  for (const { values, rowId, rowNumber } of coercedRows) {
    gridRows.push(buildSpreadsheetGridRow(values, rowId, rowNumber, adapter));

    processed += 1;
    if (processed % PARSE_CHUNK_SIZE === 0) {
      await yieldToMain();
    }
  }

  return gridRows;
}

// ---------------------------------------------------------------------------
// Fallback: combined coerce + validate on main thread (chunked)
// ---------------------------------------------------------------------------

export async function parseSpreadsheetRows<TValues extends object, TPayload>(
  rows: readonly unknown[][],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
): Promise<SpreadsheetImportParseState<TValues>> {
  const { headers, coercedRows, unmatchedHeaders } = coerceSpreadsheetRows(
    rows,
    adapter.fields,
    adapter.createDefaultValues()
  );
  const gridRows = await validateAndBuildGridRows(coercedRows, adapter);

  return { headers, rows: gridRows, unmatchedHeaders };
}

function pickRowFieldValues<TValues extends object>(
  row: SpreadsheetImportGridRow<TValues>,
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[]
): TValues {
  // Reconstruct the entity-only values from a grid row by reading each known
  // adapter field — sidesteps the destructure-with-discards pattern and
  // implicitly drops every workbench-private field (`__serverError`, etc.).
  const values = {} as TValues;
  for (const field of fields) {
    values[field.key] = row[field.key];
  }
  return values;
}

export function revalidateSpreadsheetRow<TValues extends object, TPayload>(
  row: SpreadsheetImportGridRow<TValues>,
  adapter: SpreadsheetImportAdapter<TValues, TPayload>,
  options?: {
    editedFieldKeys?: readonly SpreadsheetImportFieldKey<TValues>[];
  }
): SpreadsheetImportGridRow<TValues> {
  // Picking field-by-field also drops `__serverError`, so any cell edit
  // implicitly invalidates the previous dry-run / commit response — the user
  // must re-submit before we can claim the server has accepted the row.
  const values = pickRowFieldValues(row, adapter.fields);

  return buildSpreadsheetGridRow(
    values,
    row.__rowId,
    row.__rowNumber,
    adapter,
    {
      editedFieldKeys: mergeFieldKeys(
        row.__editedFieldKeys,
        options?.editedFieldKeys ?? []
      ),
      fixedFieldKeys: row.__fixedFieldKeys,
      initialIssueFieldKeys: row.__initialIssueFieldKeys,
      previousIssues: row.__issues,
    }
  );
}

export function updateSpreadsheetRowValue<
  TValues extends object,
  TPayload,
  TFieldKey extends SpreadsheetImportFieldKey<TValues>
>(
  row: SpreadsheetImportGridRow<TValues>,
  fieldKey: TFieldKey,
  value: TValues[TFieldKey],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
) {
  return revalidateSpreadsheetRow(
    {
      ...row,
      [fieldKey]: value,
    },
    adapter,
    {
      editedFieldKeys: [fieldKey],
    }
  );
}

export async function applyBulkSpreadsheetValue<
  TValues extends object,
  TPayload,
  TFieldKey extends SpreadsheetImportFieldKey<TValues>
>(
  rows: readonly SpreadsheetImportGridRow<TValues>[],
  fieldKey: TFieldKey,
  value: TValues[TFieldKey],
  mode: 'empty' | 'invalid',
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
) {
  let affectedCount = 0;
  const nextRows: SpreadsheetImportGridRow<TValues>[] = [];
  let processed = 0;

  for (const row of rows) {
    const cellValue = row[fieldKey];
    const hasFieldIssue = row.__issues.some(
      (issue) => issue.fieldKey === fieldKey
    );
    const matchesMode =
      mode === 'invalid'
        ? hasFieldIssue && !isSpreadsheetImportValueEmpty(cellValue)
        : isSpreadsheetImportValueEmpty(cellValue);

    if (!matchesMode || cellValue === value) {
      nextRows.push(row);
    } else {
      affectedCount += 1;
      nextRows.push(updateSpreadsheetRowValue(row, fieldKey, value, adapter));
    }

    processed += 1;
    if (processed % PARSE_CHUNK_SIZE === 0) {
      await yieldToMain();
    }
  }

  return {
    affectedCount,
    rows: nextRows,
  };
}

/**
 * Synthetic field label used for server-side row errors in the issues drawer.
 * Server errors are row-level (BE `field` is null), so we tag them with this
 * label instead of a real field name.
 */
export const SPREADSHEET_IMPORT_SERVER_ERROR_FIELD_LABEL = 'Server';

function buildServerErrorIssueRecord<TValues extends object>(
  rowId: string,
  rowNumber: number,
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[],
  message: string
): SpreadsheetImportIssueRecord<TValues> {
  // Anchor the synthetic issue to the first adapter field so existing
  // navigation (jumpToIssue → focus cell) still scrolls to the row. The cell
  // renderer skips highlighting issues with the server-error code, so this
  // anchor is purely for nav.
  const anchorFieldKey = fields[0]?.key as SpreadsheetImportFieldKey<TValues>;

  return {
    id: `${rowId}:server-error:${rowNumber}`,
    code: SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
    fieldKey: anchorFieldKey,
    fieldLabel: SPREADSHEET_IMPORT_SERVER_ERROR_FIELD_LABEL,
    message,
    rowId,
    rowNumber,
  };
}

/**
 * Reconcile a rows array against a fresh batch of server-side row errors.
 *
 * `errors[i].rowNumber` is 1-based into the **submit array** — i.e. the
 * payloads array sent on the latest dry-run / commit. Callers must therefore
 * pass the same `rows` they used to build the payloads, in the same order.
 *
 * For rows that match an incoming error: attach `__serverError`, push a
 * synthetic issue (`code: SPREADSHEET_IMPORT_SERVER_ERROR_CODE`) so the
 * existing errors drawer / nav surfaces it, and force `__isValid: false`.
 * For rows that previously had a server error but are not in the new batch:
 * clear it. Field-level client-side issues are preserved untouched.
 */
export function applyServerErrorsToRows<TValues extends object, TPayload>(
  rows: readonly SpreadsheetImportGridRow<TValues>[],
  errors: readonly SpreadsheetImportServerRowError[],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
): SpreadsheetImportGridRow<TValues>[] {
  const errorByRowNumber = new Map<number, string>();
  for (const error of errors) {
    errorByRowNumber.set(error.rowNumber, error.message);
  }

  return rows.map((row, index) => {
    const submitRowNumber = index + 1;
    const incomingMessage = errorByRowNumber.get(submitRowNumber);
    const fieldIssues = row.__issues.filter(
      (issue) => issue.code !== SPREADSHEET_IMPORT_SERVER_ERROR_CODE
    );

    if (!incomingMessage) {
      // No new server error for this row. If it carried a stale one, drop it.
      if (!row.__serverError && fieldIssues.length === row.__issues.length) {
        return row;
      }

      // `__serverError` is optional — setting it back to undefined is
      // equivalent to omission for every consumer that reads the field.
      return {
        ...row,
        __serverError: undefined,
        __issues: fieldIssues,
        __issueCount: fieldIssues.length,
        __isValid: fieldIssues.length === 0,
      };
    }

    const serverIssue = buildServerErrorIssueRecord(
      row.__rowId,
      row.__rowNumber,
      adapter.fields,
      incomingMessage
    );
    const nextIssues = [...fieldIssues, serverIssue];

    return {
      ...row,
      __serverError: incomingMessage,
      __issues: nextIssues,
      __issueCount: nextIssues.length,
      __isValid: false,
    };
  });
}

/**
 * Drop rows whose 1-based position in the submit array appears in
 * `persistedRowNumbers`. Used after a partial-success commit — the server has
 * already inserted those rows into the DB, so we remove them from the
 * workbench so retries only re-send the failures.
 */
export function dropPersistedRows<TValues extends object>(
  rows: readonly SpreadsheetImportGridRow<TValues>[],
  persistedRowNumbers: readonly number[]
): SpreadsheetImportGridRow<TValues>[] {
  if (persistedRowNumbers.length === 0) {
    return [...rows];
  }

  const persisted = new Set(persistedRowNumbers);
  return rows.filter((_row, index) => !persisted.has(index + 1));
}

// Modified by Sekar Nagarajan (2026-07-14 15:57)
export function applyBatchValidationIssues<TValues extends object, TPayload>(
  rows: SpreadsheetImportGridRow<TValues>[],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
): SpreadsheetImportGridRow<TValues>[] {
  if (!adapter.validateBatch) return rows;

  const batchIssuesByRowId = adapter.validateBatch(rows);

  return rows.map((row) => {
    const nonDuplicateIssues = row.__issues.filter(
      (issue) => issue.code !== SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE
    );
    const batchIssues = batchIssuesByRowId.get(row.__rowId);

    if (!batchIssues || batchIssues.length === 0) {
      if (nonDuplicateIssues.length === row.__issues.length) return row;
      return {
        ...row,
        __issues: nonDuplicateIssues,
        __issueCount: nonDuplicateIssues.length,
        __isValid: nonDuplicateIssues.length === 0,
      };
    }

    const newIssueRecords: SpreadsheetImportIssueRecord<TValues>[] =
      batchIssues.map((issue, index) => ({
        id: `${row.__rowId}:${SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE}:${issue.fieldKey}:${index}`,
        code: SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE,
        fieldKey: issue.fieldKey,
        fieldLabel:
          adapter.fields.find((f) => f.key === issue.fieldKey)?.label ??
          issue.fieldKey,
        message: issue.message,
        rowId: row.__rowId,
        rowNumber: row.__rowNumber,
      }));

    const allIssues = [...nonDuplicateIssues, ...newIssueRecords];
    const duplicateFieldKeys = [
      ...new Set(batchIssues.map((issue) => issue.fieldKey)),
    ];
    const existingInitialKeys = new Set(row.__initialIssueFieldKeys);
    const mergedInitialKeys = duplicateFieldKeys.some(
      (key) => !existingInitialKeys.has(key)
    )
      ? [...new Set([...row.__initialIssueFieldKeys, ...duplicateFieldKeys])]
      : row.__initialIssueFieldKeys;

    return {
      ...row,
      __issues: allIssues,
      __issueCount: allIssues.length,
      __isValid: false,
      __initialIssueFieldKeys: mergedInitialKeys,
    };
  });
}

export async function applyBulkSpreadsheetPhoneCountryCode<
  TValues extends object,
  TPayload,
  TFieldKey extends SpreadsheetImportFieldKey<TValues>
>(
  rows: readonly SpreadsheetImportGridRow<TValues>[],
  field: SpreadsheetImportFieldDefinition<TValues> & { key: TFieldKey },
  countryCode: string,
  adapter: SpreadsheetImportAdapter<TValues, TPayload>,
  options: {
    issueCode: string;
  }
) {
  let affectedCount = 0;
  const nextRows: SpreadsheetImportGridRow<TValues>[] = [];
  let processed = 0;

  for (const row of rows) {
    const fieldIssue = row.__issues.find(
      (issue) =>
        issue.fieldKey === field.key && issue.code === options.issueCode
    );

    if (!fieldIssue) {
      nextRows.push(row);
    } else {
      const nextValue = applyPhoneCountryCode(
        String(row[field.key] ?? ''),
        countryCode as Parameters<typeof applyPhoneCountryCode>[1]
      );

      if (!nextValue || nextValue === row[field.key]) {
        nextRows.push(row);
      } else {
        affectedCount += 1;
        nextRows.push(
          updateSpreadsheetRowValue(
            row,
            field.key,
            nextValue as TValues[TFieldKey],
            adapter
          )
        );
      }
    }

    processed += 1;
    if (processed % PARSE_CHUNK_SIZE === 0) {
      await yieldToMain();
    }
  }

  return {
    affectedCount,
    rows: nextRows,
  };
}
