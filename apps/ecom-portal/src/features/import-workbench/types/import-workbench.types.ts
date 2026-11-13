export type SpreadsheetImportFieldKind =
  | 'text'
  | 'select'
  | 'boolean'
  | 'number'
  | 'date'
  | 'datetime';

export type SpreadsheetImportFieldValueFormat =
  | 'email'
  | 'phone-e164'
  | 'currency-amount';

export interface SpreadsheetImportFieldOption {
  label: string;
  value: string;
}

export interface SpreadsheetImportFieldDefinition<TValues extends object> {
  key: Extract<keyof TValues, string>;
  label: string;
  aliases: readonly string[];
  description?: string;
  acceptedValueHint?: string;
  exampleValues?: readonly string[];
  defaultDisplayValue?: string;
  importFormatHint?: string;
  kind: SpreadsheetImportFieldKind;
  valueFormat?: SpreadsheetImportFieldValueFormat;
  exportAsText?: boolean;
  required?: boolean;
  useDefaultOnEmpty?: boolean;
  width?: number;
  options?: readonly SpreadsheetImportFieldOption[];
}

export interface SpreadsheetImportValidationIssue<TValues extends object> {
  code?: string;
  fieldKey: Extract<keyof TValues, string>;
  message: string;
}

export type SpreadsheetImportFieldKey<TValues extends object> = Extract<
  keyof TValues,
  string
>;

export interface SpreadsheetImportAdapter<TValues extends object, TPayload> {
  entityLabel: string;
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
  /**
   * Hard cap on rows this import can submit in one batch. Enforced by the
   * workbench when a workbook is loaded — exceeding it shows a parse error
   * instead of silently truncating. Leave undefined for no cap.
   */
  maxRowCount?: number;
  createDefaultValues: () => TValues;
  validateRecord: (
    values: TValues
  ) => SpreadsheetImportValidationIssue<TValues>[];
  // Modified by Sekar Nagarajan (2026-07-14 15:57)
  validateBatch?: (
    rows: readonly SpreadsheetImportGridRow<TValues>[]
  ) => Map<string, SpreadsheetImportValidationIssue<TValues>[]>;
  toPayload: (values: TValues) => TPayload;
  getSubmitLabel?: (validRowCount: number) => string;
}

export interface SpreadsheetImportIssueRecord<TValues extends object> {
  id: string;
  code?: string;
  fieldKey: SpreadsheetImportFieldKey<TValues>;
  message: string;
  rowId: string;
  rowNumber: number;
  fieldLabel: string;
}

export type SpreadsheetImportGridRow<TValues extends object> = TValues & {
  __rowId: string;
  __rowNumber: number;
  __isValid: boolean;
  __issueCount: number;
  __issues: SpreadsheetImportIssueRecord<TValues>[];
  __editedFieldKeys: SpreadsheetImportFieldKey<TValues>[];
  __fixedFieldKeys: SpreadsheetImportFieldKey<TValues>[];
  __initialIssueFieldKeys: SpreadsheetImportFieldKey<TValues>[];
  /**
   * Server-side row-level error message returned from the import endpoint.
   * Set after a dry-run / commit reports a failure for this row, cleared on
   * any cell edit so the user has to re-validate before the next submit.
   */
  __serverError?: string;
};

export interface SpreadsheetWorkbookData {
  rows: unknown[][];
  sheetName: string;
  sheetNames: string[];
}

export interface SpreadsheetImportParseState<TValues extends object> {
  headers: string[];
  rows: SpreadsheetImportGridRow<TValues>[];
  unmatchedHeaders: string[];
}

/**
 * Issue code attached to synthetic issues we build from server-side row errors
 * returned by the import endpoint. Used by the cell renderer to skip
 * field-level cell highlighting (BE `field` is always null today) and by the
 * errors drawer to label the issue as a server-side failure.
 */
export const SPREADSHEET_IMPORT_SERVER_ERROR_CODE = 'server-error';

// Modified by Sekar Nagarajan (2026-07-14 15:57)
export const SPREADSHEET_IMPORT_DUPLICATE_ISSUE_CODE = 'duplicate';

/**
 * Per-row server error returned by the import endpoint. `rowNumber` is
 * 1-based into the original `payloads` array sent on submit (NOT into the
 * spreadsheet — that's `__rowNumber`).
 */
export interface SpreadsheetImportServerRowError {
  rowNumber: number;
  message: string;
}

/**
 * Per-row success returned by the import endpoint. `uuid` is null on dry-run
 * responses and populated with the persisted entity's UUID on commit.
 */
export interface SpreadsheetImportServerRowSuccess {
  rowNumber: number;
  uuid: string | null;
}

/** Result returned by the workbench's `onValidate` (dry-run) callback. */
export interface SpreadsheetImportValidateResult {
  errors: SpreadsheetImportServerRowError[];
}

/** Result returned by the workbench's `onCommit` (real import) callback. */
export interface SpreadsheetImportCommitResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  created: SpreadsheetImportServerRowSuccess[];
  errors: SpreadsheetImportServerRowError[];
}

export interface SpreadsheetImportEngine {
  parseWorkbook: (
    file: File,
    options?: {
      sheet?: number | string;
    }
  ) => Promise<SpreadsheetWorkbookData>;
}
