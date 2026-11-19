/**
 * Shared message protocol between the spreadsheet parse worker and main thread.
 *
 * These types define the **wire format** — the serializable shape that crosses
 * the postMessage boundary. No TypeScript generics survive structured clone.
 */
import type { SpreadsheetImportFieldDefinition } from './import-workbench.types';

/**
 * Wire-format field definition — erases the generic from
 * SpreadsheetImportFieldDefinition so the worker can consume any adapter's fields.
 */
export type WorkerFieldDefinition = SpreadsheetImportFieldDefinition<
  Record<string, unknown>
>;

// ---------------------------------------------------------------------------
// Main thread → Worker
// ---------------------------------------------------------------------------

export interface CoerceWorkerRequest {
  requestId: number;
  rawRows: readonly unknown[][];
  fields: readonly WorkerFieldDefinition[];
  templateValues: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Worker → Main thread
// ---------------------------------------------------------------------------

export interface CoercedWorkerRow {
  values: Record<string, unknown>;
  rowId: string;
  rowNumber: number;
}

export interface CoerceWorkerSuccess {
  type: 'success';
  requestId: number;
  headers: string[];
  coercedRows: CoercedWorkerRow[];
  unmatchedHeaders: string[];
}

export interface CoerceWorkerError {
  type: 'error';
  requestId: number;
  message: string;
}

export type CoerceWorkerResponse = CoerceWorkerSuccess | CoerceWorkerError;
