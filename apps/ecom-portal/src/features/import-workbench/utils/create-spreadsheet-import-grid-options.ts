import type {
  GetRowIdParams,
  GridOptions,
  ExcelStyle,
} from 'ag-grid-community';

import type { SpreadsheetImportGridRow } from '../types/import-workbench.types';
import { SPREADSHEET_IMPORT_TEXT_EXCEL_STYLE_ID } from './spreadsheet-import-export.utils';

const SPREADSHEET_IMPORT_EXCEL_STYLES: ExcelStyle[] = [
  {
    id: SPREADSHEET_IMPORT_TEXT_EXCEL_STYLE_ID,
    dataType: 'String',
  },
];

function getSpreadsheetImportRowId<TValues extends object>(
  params: GetRowIdParams<SpreadsheetImportGridRow<TValues>>
) {
  return params.data.__rowId;
}

export function createSpreadsheetImportGridOptions<
  TValues extends object
>(): GridOptions<SpreadsheetImportGridRow<TValues>> {
  return {
    getRowId: getSpreadsheetImportRowId,
    singleClickEdit: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 100,
    excelStyles: SPREADSHEET_IMPORT_EXCEL_STYLES,
  };
}
