import type {
  SpreadsheetImportAdapter,
  SpreadsheetImportGridRow,
} from '../types/import-workbench.types';

export const SPREADSHEET_IMPORT_TEXT_EXCEL_STYLE_ID = 'import-export-text';

export function buildSpreadsheetImportExportFileName(fileName?: string) {
  const trimmedName = fileName?.trim();

  if (!trimmedName) {
    return `import-review-${Date.now()}.xlsx`;
  }

  return trimmedName.replace(/\.xlsx$/i, '-review.xlsx');
}

export function buildSpreadsheetImportPayloads<
  TValues extends object,
  TPayload
>(
  rows: readonly SpreadsheetImportGridRow<TValues>[],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
) {
  return rows.map((row) => {
    const {
      __editedFieldKeys: _editedFieldKeys,
      __fixedFieldKeys: _fixedFieldKeys,
      __initialIssueFieldKeys: _initialIssueFieldKeys,
      __isValid: _isValid,
      __issueCount: _issueCount,
      __issues: _issues,
      __rowId: _rowId,
      __rowNumber: _rowNumber,
      ...values
    } = row;

    return adapter.toPayload(values as TValues);
  });
}
