/**
 * Web Worker for spreadsheet row coercion (Phase 1).
 *
 * Runs header matching, alias resolution, and value coercion off the main
 * thread so the UI stays responsive while processing large Excel files.
 *
 * Type-checked via tsconfig.worker.json (lib: webworker, no DOM).
 */
import type {
  CoerceWorkerError,
  CoerceWorkerRequest,
  CoerceWorkerSuccess,
} from '../types/spreadsheet-worker-protocol';
import { coerceSpreadsheetRows } from '../utils/import-workbook.utils';

globalThis.onmessage = (event: MessageEvent<CoerceWorkerRequest>) => {
  const { requestId, rawRows, fields, templateValues } = event.data;

  try {
    const result = coerceSpreadsheetRows(rawRows, fields, templateValues);

    globalThis.postMessage({
      type: 'success',
      requestId,
      headers: result.headers,
      coercedRows: result.coercedRows,
      unmatchedHeaders: result.unmatchedHeaders,
    } satisfies CoerceWorkerSuccess);
  } catch (error) {
    globalThis.postMessage({
      type: 'error',
      requestId,
      message: error instanceof Error ? error.message : 'Worker parsing failed',
    } satisfies CoerceWorkerError);
  }
};
