import readXlsxFile, { readSheetNames } from 'read-excel-file/browser';

import type {
  SpreadsheetImportEngine,
  SpreadsheetWorkbookData,
} from '../types/import-workbench.types';

const FALLBACK_SHEET_NAME = 'Sheet1';

function resolveSelectedSheetName(
  sheetNames: string[],
  selectedSheet: number | string | undefined
) {
  if (typeof selectedSheet === 'string' && selectedSheet.trim()) {
    return selectedSheet;
  }

  if (typeof selectedSheet === 'number') {
    return (
      sheetNames[selectedSheet - 1] ?? sheetNames[0] ?? FALLBACK_SHEET_NAME
    );
  }

  return sheetNames[0] ?? FALLBACK_SHEET_NAME;
}

export const readExcelFileEngine: SpreadsheetImportEngine = {
  async parseWorkbook(
    file: File,
    options?: {
      sheet?: number | string;
    }
  ): Promise<SpreadsheetWorkbookData> {
    const sheetNames = await readSheetNames(file);
    const sheetName = resolveSelectedSheetName(sheetNames, options?.sheet);
    const rows = await readXlsxFile(file, { sheet: sheetName });

    return {
      rows,
      sheetName,
      sheetNames,
    };
  },
};
