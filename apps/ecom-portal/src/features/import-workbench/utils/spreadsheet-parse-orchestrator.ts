/**
 * Orchestrates spreadsheet parsing between a Web Worker and the main thread.
 *
 * Strategy:
 *   1. Try to coerce rows in a Web Worker (header matching + value coercion).
 *   2. Validate + build grid rows on the main thread (chunked yields).
 *   3. If the worker is unavailable, fall back to fully main-thread parsing.
 */
import type {
  SpreadsheetImportAdapter,
  SpreadsheetImportParseState,
} from '../types/import-workbench.types';
import type {
  CoerceWorkerResponse,
  CoerceWorkerSuccess,
  WorkerFieldDefinition,
} from '../types/spreadsheet-worker-protocol';
import {
  type CoercedRowData,
  parseSpreadsheetRows,
  validateAndBuildGridRows,
} from './import-workbook.utils';

// ---------------------------------------------------------------------------
// Worker singleton — lazy-initialized, permanently disabled on first failure
// ---------------------------------------------------------------------------

let workerInstance: Worker | null = null;
let workerSupported = true;
let nextRequestId = 0;

function getOrCreateWorker(): Worker | null {
  if (!workerSupported) return null;

  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('../workers/spreadsheet-parse.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch {
      workerSupported = false;
      return null;
    }
  }

  return workerInstance;
}

/**
 * Terminate the worker when the import workbench unmounts.
 * Subsequent calls to `getOrCreateWorker` will create a fresh instance.
 */
export function terminateParseWorker(): void {
  workerInstance?.terminate();
  workerInstance = null;
}

// ---------------------------------------------------------------------------
// Phase 1 via Worker — coerce rows off the main thread
// ---------------------------------------------------------------------------

function coerceInWorker(
  rawRows: readonly unknown[][],
  fields: readonly WorkerFieldDefinition[],
  templateValues: Record<string, unknown>
): Promise<CoerceWorkerSuccess> {
  const worker = getOrCreateWorker();

  if (!worker) {
    return Promise.reject(new Error('Worker unavailable'));
  }

  const activeWorker = worker;
  const requestId = nextRequestId++;

  return new Promise((resolve, reject) => {
    function cleanup() {
      activeWorker.removeEventListener('message', onMessage);
      activeWorker.removeEventListener('error', onError);
    }

    function onMessage(event: MessageEvent<CoerceWorkerResponse>) {
      if (event.data.requestId !== requestId) return;
      cleanup();

      if (event.data.type === 'error') {
        reject(new Error(event.data.message));
        return;
      }

      resolve(event.data);
    }

    function onError(event: ErrorEvent) {
      cleanup();
      workerSupported = false;
      workerInstance = null;
      reject(new Error(event.message || 'Worker error'));
    }

    activeWorker.addEventListener('message', onMessage);
    activeWorker.addEventListener('error', onError);

    activeWorker.postMessage({ requestId, rawRows, fields, templateValues });
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse spreadsheet rows using a Web Worker for coercion and main-thread
 * chunked validation. Falls back to fully main-thread parsing if the worker
 * is unavailable.
 *
 * Drop-in replacement for `parseSpreadsheetRows`.
 */
export async function parseSpreadsheetWithWorker<
  TValues extends object,
  TPayload
>(
  rawRows: readonly unknown[][],
  adapter: SpreadsheetImportAdapter<TValues, TPayload>
): Promise<SpreadsheetImportParseState<TValues>> {
  try {
    // Widen to wire-format types — structured clone erases generics anyway
    const workerResult = await coerceInWorker(
      rawRows,
      adapter.fields as readonly WorkerFieldDefinition[],
      adapter.createDefaultValues() as Record<string, unknown>
    );

    // The worker returns Record<string, unknown> values via structured clone.
    // They were built from the same field definitions that define TValues,
    // so the runtime shape IS TValues — this is the single narrowing point.
    const coercedRows = workerResult.coercedRows as CoercedRowData<TValues>[];
    const gridRows = await validateAndBuildGridRows(coercedRows, adapter);

    return {
      headers: workerResult.headers,
      rows: gridRows,
      unmatchedHeaders: workerResult.unmatchedHeaders,
    };
  } catch {
    return parseSpreadsheetRows(rawRows, adapter);
  }
}
