import { useToast } from '@solverminds/shared-ui/hooks';
import type {
  CellValueChangedEvent,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';

import { extractApiError } from '@solverminds/platform';
import {
  SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
  type SpreadsheetImportAdapter,
  type SpreadsheetImportCommitResult,
  type SpreadsheetImportEngine,
  type SpreadsheetImportFieldDefinition,
  type SpreadsheetImportFieldKey,
  type SpreadsheetImportGridRow,
  type SpreadsheetImportIssueRecord,
  type SpreadsheetImportServerRowError,
  type SpreadsheetImportValidateResult,
} from '../types/import-workbench.types';
import {
  applyBatchValidationIssues,
  applyBulkSpreadsheetPhoneCountryCode,
  applyBulkSpreadsheetValue,
  applyServerErrorsToRows,
  coerceCellValue,
  dropPersistedRows,
  isSpreadsheetImportValueEmpty,
  updateSpreadsheetRowValue,
} from '../utils/import-workbook.utils';
import {
  buildSpreadsheetImportExportFileName,
  buildSpreadsheetImportPayloads,
} from '../utils/spreadsheet-import-export.utils';
import { PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE } from '../utils/spreadsheet-import-phone.utils';
import {
  parseSpreadsheetWithWorker,
  terminateParseWorker,
} from '../utils/spreadsheet-parse-orchestrator';

type RowFilterValue = 'all' | 'errors';

interface UseSpreadsheetImportWorkbenchProps<TValues extends object, TPayload> {
  adapter: SpreadsheetImportAdapter<TValues, TPayload>;
  engine: SpreadsheetImportEngine;
  /**
   * Validates the batch on the server (BE `dryRun: true`). Should resolve
   * with the per-row errors[] reported by the import endpoint.
   */
  onValidate: (
    payloads: TPayload[]
  ) => Promise<SpreadsheetImportValidateResult>;
  /**
   * Commits the batch on the server (BE `dryRun: false`). Resolves with the
   * full per-row breakdown — partial success is normal and the workbench
   * surfaces server errors back into the grid.
   */
  onCommit: (payloads: TPayload[]) => Promise<SpreadsheetImportCommitResult>;
  submitDisabledReason?: string | null;
}

function computeFieldStats<TValues extends object>(
  rows: SpreadsheetImportGridRow<TValues>[],
  fields: readonly {
    key: SpreadsheetImportFieldKey<TValues>;
    required?: boolean;
  }[]
) {
  const statsByKey = new Map<
    SpreadsheetImportFieldKey<TValues>,
    {
      emptyCount: number;
      invalidCount: number;
      issueCodeCounts: Map<string, number>;
    }
  >();

  for (const field of fields) {
    statsByKey.set(field.key, {
      emptyCount: 0,
      invalidCount: 0,
      issueCodeCounts: new Map<string, number>(),
    });
  }

  for (const row of rows) {
    const issuesByFieldKey = new Map<
      SpreadsheetImportFieldKey<TValues>,
      SpreadsheetImportIssueRecord<TValues>[]
    >();

    for (const issue of row.__issues) {
      const fieldIssues = issuesByFieldKey.get(issue.fieldKey) ?? [];
      fieldIssues.push(issue);
      issuesByFieldKey.set(issue.fieldKey, fieldIssues);
    }

    for (const field of fields) {
      const fieldStats = statsByKey.get(field.key);
      if (!fieldStats) continue;

      const cellValue = row[field.key];

      // Only required fields surface empty-state warnings in the workbench.
      if (field.required && isSpreadsheetImportValueEmpty(cellValue)) {
        fieldStats.emptyCount += 1;
        continue;
      }

      const fieldIssues = issuesByFieldKey.get(field.key) ?? [];

      if (fieldIssues.length > 0) {
        fieldStats.invalidCount += 1;
        for (const issue of fieldIssues) {
          if (!issue.code) {
            continue;
          }

          fieldStats.issueCodeCounts.set(
            issue.code,
            (fieldStats.issueCodeCounts.get(issue.code) ?? 0) + 1
          );
        }
      }
    }
  }

  return statsByKey;
}

export function useSpreadsheetImportWorkbench<
  TValues extends object,
  TPayload
>({
  adapter,
  engine,
  onValidate,
  onCommit,
  submitDisabledReason,
}: UseSpreadsheetImportWorkbenchProps<TValues, TPayload>) {
  const toast = useToast();
  const gridApiRef = useRef<GridApi<SpreadsheetImportGridRow<TValues>> | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState<string>();
  const [availableSheetNames, setAvailableSheetNames] = useState<string[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [unmatchedHeaders, setUnmatchedHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<SpreadsheetImportGridRow<TValues>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileSelectionError, setFileSelectionError] = useState<string | null>(
    null
  );
  const [rowFilter, setRowFilter] = useState<RowFilterValue>('all');
  const [isErrorsPanelVisible, setIsErrorsPanelVisible] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [selectedBulkFieldKey, setSelectedBulkFieldKey] = useState<
    SpreadsheetImportFieldKey<TValues> | undefined
  >(undefined);
  const [bulkActionMode, setBulkActionMode] = useState<
    'empty' | 'invalid' | 'countryCode' | null
  >(null);

  // Terminate the Web Worker when the workbench unmounts
  useEffect(() => terminateParseWorker, []);

  // Defer rows for expensive stats — grid updates immediately, metrics catch up
  const deferredRows = useDeferredValue(rows);

  const allIssues = rows.flatMap((row) => row.__issues);

  // O(rows × fields) — computed against deferred rows so cell edits stay snappy
  const fieldStatsByKey = computeFieldStats(deferredRows, adapter.fields);

  let validRowCount = 0;
  for (const row of deferredRows) {
    if (row.__isValid) validRowCount += 1;
  }
  const invalidRowCount = deferredRows.length - validRowCount;

  const bulkField = selectedBulkFieldKey
    ? adapter.fields.find((field) => field.key === selectedBulkFieldKey)
    : undefined;
  const bulkFieldStats = bulkField
    ? fieldStatsByKey.get(bulkField.key)
    : undefined;
  const missingCountryCodeCount =
    bulkFieldStats?.issueCodeCounts.get(
      PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE
    ) ?? 0;

  const navigationIssues = bulkField
    ? allIssues.filter((issue) => issue.fieldKey === bulkField.key)
    : allIssues;

  // When a bulk column is selected, show only rows that need work on that
  // column so the chosen field is easy to find in the grid list.
  const visibleRows = rows.filter((row) => {
    if (rowFilter === 'errors' && row.__issueCount === 0) {
      return false;
    }

    if (!bulkField) {
      return true;
    }

    const hasIssueOnField = row.__issues.some(
      (issue) => issue.fieldKey === bulkField.key
    );
    if (hasIssueOnField) {
      return true;
    }

    return (
      Boolean(bulkField.required) &&
      isSpreadsheetImportValueEmpty(row[bulkField.key])
    );
  });

  const activeNavigationIndex =
    navigationIssues.length === 0
      ? -1
      : !activeIssueId
      ? 0
      : navigationIssues.findIndex((issue) => issue.id === activeIssueId);

  // Early-exit check — avoids full count for submit gating
  const hasAnyInvalidRow = rows.some((row) => !row.__isValid);
  const canSubmit =
    rows.length > 0 &&
    !hasAnyInvalidRow &&
    !isSubmitting &&
    !submitDisabledReason;

  const sheetOptions = availableSheetNames.map((sheetName) => ({
    label: sheetName,
    value: sheetName,
  }));

  const refreshGridCells = () => {
    gridApiRef.current?.refreshCells({ force: true });
  };

  const focusCell = (
    rowId: string,
    fieldKey: SpreadsheetImportFieldKey<TValues>
  ) => {
    const api = gridApiRef.current;
    if (!api) return;

    const rowNode = api.getRowNode(rowId);
    const rowIndex = rowNode?.rowIndex;
    if (rowIndex == null) return;

    api.ensureColumnVisible(fieldKey);
    api.ensureIndexVisible(rowIndex, 'middle');
    api.setFocusedCell(rowIndex, fieldKey);
    api.startEditingCell({ rowIndex, colKey: fieldKey });
  };

  const focusBulkFieldColumn = (
    fieldKey?: SpreadsheetImportFieldKey<TValues>
  ) => {
    const api = gridApiRef.current;
    if (!api || !fieldKey) {
      return;
    }

    api.ensureColumnVisible(fieldKey);

    const firstIssue = rows
      .flatMap((row) => row.__issues)
      .find((issue) => issue.fieldKey === fieldKey);

    if (firstIssue) {
      // Defer until visibleRows re-filter settles in the grid.
      requestAnimationFrame(() => {
        focusCell(firstIssue.rowId, fieldKey);
      });
      setActiveIssueId(firstIssue.id);
      return;
    }

    const firstEmptyRow = rows.find(
      (row) =>
        Boolean(
          adapter.fields.find((field) => field.key === fieldKey)?.required
        ) && isSpreadsheetImportValueEmpty(row[fieldKey])
    );

    if (firstEmptyRow) {
      requestAnimationFrame(() => {
        focusCell(firstEmptyRow.__rowId, fieldKey);
      });
    }
  };

  const handleSelectBulkField = (
    fieldKey?: SpreadsheetImportFieldKey<TValues>
  ) => {
    setSelectedBulkFieldKey(fieldKey);
    focusBulkFieldColumn(fieldKey);
  };

  const loadWorkbook = async (file: File, sheetName?: string) => {
    setIsParsing(true);
    setParseError(null);

    try {
      const workbook = await engine.parseWorkbook(file, { sheet: sheetName });
      const parsedSheet = await parseSpreadsheetWithWorker(
        workbook.rows,
        adapter
      );

      // Hard cap from the adapter — the BE bulk-import endpoint accepts at
      // most `maxRowCount` rows per request, so we refuse the file outright
      // rather than silently truncating.
      if (
        typeof adapter.maxRowCount === 'number' &&
        parsedSheet.rows.length > adapter.maxRowCount
      ) {
        startTransition(() => {
          setAvailableSheetNames(workbook.sheetNames);
          setSelectedSheetName(workbook.sheetName);
          setHeaders([]);
          setRows([]);
          setUnmatchedHeaders([]);
          setActiveIssueId(null);
          setParseError(
            `This sheet has ${parsedSheet.rows.length} rows. The bulk import accepts a maximum of ${adapter.maxRowCount} ${adapter.entityLabel} per file. Split the workbook and try again.`
          );
        });
        return;
      }

      // Modified by Sekar Nagarajan (2026-07-14 15:57)
      const batchValidatedRows = applyBatchValidationIssues(
        parsedSheet.rows,
        adapter
      );
      const firstIssue = batchValidatedRows[0]?.__issues[0];

      startTransition(() => {
        setAvailableSheetNames(workbook.sheetNames);
        setSelectedSheetName(workbook.sheetName);
        setHeaders(parsedSheet.headers);
        setRows(batchValidatedRows);
        setUnmatchedHeaders(parsedSheet.unmatchedHeaders);
        setActiveIssueId(firstIssue?.id ?? null);
        setIsErrorsPanelVisible(false);
        setBulkActionMode(null);
      });
    } catch (error) {
      startTransition(() => {
        setHeaders([]);
        setRows([]);
        setUnmatchedHeaders([]);
        setActiveIssueId(null);
        setParseError(
          error instanceof Error
            ? error.message
            : 'Unable to read the selected Excel file.'
        );
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setFileSelectionError(null);
    setSelectedFile(file);
    await loadWorkbook(file);
  };

  const handleSheetChange = async (nextSheetName: string) => {
    if (!selectedFile || nextSheetName === selectedSheetName) return;
    await loadWorkbook(selectedFile, nextSheetName);
  };

  const jumpToIssue = (issue: SpreadsheetImportIssueRecord<TValues>) => {
    setActiveIssueId(issue.id);
    focusCell(issue.rowId, issue.fieldKey);
  };

  const navigateTarget = (direction: -1 | 1) => {
    if (navigationIssues.length === 0) return;

    const baseIndex =
      activeNavigationIndex >= 0
        ? activeNavigationIndex
        : direction === 1
        ? -1
        : 0;
    const nextIndex =
      (baseIndex + direction + navigationIssues.length) %
      navigationIssues.length;
    const nextIssue = navigationIssues[nextIndex];
    if (!nextIssue) return;

    jumpToIssue(nextIssue);
  };

  const handleGridReady = (
    params: GridReadyEvent<SpreadsheetImportGridRow<TValues>>
  ) => {
    gridApiRef.current = params.api;
  };

  const handleCellValueChanged = (
    event: CellValueChangedEvent<SpreadsheetImportGridRow<TValues>>
  ) => {
    const rowId = event.data?.__rowId;
    const fieldKey = event.colDef.field;

    if (!rowId || typeof fieldKey !== 'string' || !event.data) return;

    const typedFieldKey =
      fieldKey as unknown as SpreadsheetImportFieldKey<TValues>;
    const fieldDefinition = adapter.fields.find(
      (field) => field.key === typedFieldKey
    ) as
      | (SpreadsheetImportFieldDefinition<TValues> & {
          key: typeof typedFieldKey;
        })
      | undefined;
    if (!fieldDefinition) return;
    const nextValue = coerceCellValue(
      event.data[typedFieldKey],
      fieldDefinition
    ) as TValues[typeof typedFieldKey];
    const nextRow = updateSpreadsheetRowValue(
      event.data,
      typedFieldKey,
      nextValue,
      adapter
    );

    // Modified by Sekar Nagarajan (2026-07-14 16:09)
    const previousRows = rows;
    const updatedRows = previousRows.map((row) =>
      row.__rowId === rowId ? nextRow : row
    );

    const batchValidatedRows = applyBatchValidationIssues(updatedRows, adapter);
    setRows(batchValidatedRows);

    const previousRowById = new Map(
      previousRows.map((row) => [row.__rowId, row])
    );
    for (const row of batchValidatedRows) {
      if (previousRowById.get(row.__rowId) !== row) {
        event.api.getRowNode(row.__rowId)?.setData(row);
      }
    }

    requestAnimationFrame(() => {
      refreshGridCells();
    });
  };

  const handleBulkApply = async (replacementValue: unknown) => {
    if (!bulkField || !bulkActionMode) return;

    const typedBulkField =
      bulkField as SpreadsheetImportFieldDefinition<TValues> & {
        key: typeof bulkField.key;
      };
    const coercedReplacement = coerceCellValue(
      replacementValue,
      typedBulkField
    ) as TValues[typeof bulkField.key];

    const result =
      bulkActionMode === 'countryCode'
        ? await applyBulkSpreadsheetPhoneCountryCode(
            rows,
            typedBulkField,
            String(replacementValue),
            adapter,
            {
              issueCode: PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE,
            }
          )
        : await applyBulkSpreadsheetValue(
            rows,
            bulkField.key,
            coercedReplacement,
            bulkActionMode,
            adapter
          );

    const { affectedCount, rows: nextRows } = result;

    if (affectedCount === 0) {
      setBulkActionMode(null);
      return;
    }

    // Modified by Sekar Nagarajan (2026-07-14 15:57)
    const batchValidatedRows = applyBatchValidationIssues(nextRows, adapter);

    startTransition(() => {
      setRows(batchValidatedRows);
      setBulkActionMode(null);
    });

    requestAnimationFrame(() => {
      refreshGridCells();
    });
  };

  const focusFirstServerError = (
    nextRows: readonly SpreadsheetImportGridRow<TValues>[]
  ) => {
    for (const row of nextRows) {
      const serverIssue = row.__issues.find(
        (issue) => issue.code === SPREADSHEET_IMPORT_SERVER_ERROR_CODE
      );
      if (serverIssue) {
        setActiveIssueId(serverIssue.id);
        focusCell(serverIssue.rowId, serverIssue.fieldKey);
        return;
      }
    }
  };

  const remapErrorsAfterDrop = (
    originalRowCount: number,
    persistedRowNumbers: readonly number[],
    errors: readonly SpreadsheetImportServerRowError[]
  ): SpreadsheetImportServerRowError[] => {
    // After dropping the rows that succeeded, the index space shifts. Map
    // each remaining error from its original 1-based position to the new
    // 1-based position in the kept-rows array so applyServerErrorsToRows
    // can match them.
    const persisted = new Set(persistedRowNumbers);
    const oldToNewRowNumber = new Map<number, number>();
    let nextRowNumber = 0;

    for (let oldIndex = 0; oldIndex < originalRowCount; oldIndex += 1) {
      const oldRowNumber = oldIndex + 1;
      if (persisted.has(oldRowNumber)) {
        continue;
      }
      nextRowNumber += 1;
      oldToNewRowNumber.set(oldRowNumber, nextRowNumber);
    }

    const remapped: SpreadsheetImportServerRowError[] = [];
    for (const error of errors) {
      const nextRowNumberForError = oldToNewRowNumber.get(error.rowNumber);
      if (nextRowNumberForError !== undefined) {
        remapped.push({
          rowNumber: nextRowNumberForError,
          message: error.message,
        });
      }
    }
    return remapped;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      // Snapshot the rows that map to the payloads we're about to send. The
      // BE returns rowNumbers as 1-based indices into THIS array, so we
      // anchor all subsequent server-error mapping against this snapshot
      // rather than against `rows` (which may change while we await).
      const submitRows = rows;
      const payloads = buildSpreadsheetImportPayloads(submitRows, adapter);

      // Step 1 — silent dry-run. Any server-side issue here aborts before we
      // touch the database.
      let validateResult: SpreadsheetImportValidateResult;
      try {
        validateResult = await onValidate(payloads);
      } catch (error) {
        toast.error(extractApiError(error));
        return;
      }

      if (validateResult.errors.length > 0) {
        const nextRows = applyServerErrorsToRows(
          submitRows,
          validateResult.errors,
          adapter
        );
        startTransition(() => {
          setRows(nextRows);
          setIsErrorsPanelVisible(true);
        });
        requestAnimationFrame(() => {
          focusFirstServerError(nextRows);
          refreshGridCells();
        });
        toast.error(
          `${validateResult.errors.length} ${
            validateResult.errors.length === 1 ? 'row' : 'rows'
          } failed server validation. Fix and re-submit.`
        );
        return;
      }

      // Dry-run was clean — clear any stale server errors carried over from
      // a previous failed submit before we move on to commit.
      const clearedRows = applyServerErrorsToRows(submitRows, [], adapter);
      const hasStaleServerErrors = clearedRows.some(
        (row, index) => row !== submitRows[index]
      );
      if (hasStaleServerErrors) {
        startTransition(() => {
          setRows(clearedRows);
        });
      }

      // Step 2 — commit. Each row runs in its own server-side transaction,
      // so partial success is normal and surfaces per-row failures in
      // commitResult.errors.
      let commitResult: SpreadsheetImportCommitResult;
      try {
        commitResult = await onCommit(payloads);
      } catch (error) {
        toast.error(extractApiError(error));
        return;
      }

      if (commitResult.failedCount === 0) {
        // Page-level handler is responsible for the success toast and any
        // navigation. Workbench just resets state.
        return;
      }

      // Partial success — drop the rows that landed in the DB so retries
      // only resubmit the failures, then map the remaining errors onto the
      // new index space.
      const persistedRowNumbers = commitResult.created
        .filter((entry) => entry.uuid !== null)
        .map((entry) => entry.rowNumber);
      const remainingRows = dropPersistedRows(submitRows, persistedRowNumbers);
      const remappedErrors = remapErrorsAfterDrop(
        submitRows.length,
        persistedRowNumbers,
        commitResult.errors
      );
      const nextRows = applyServerErrorsToRows(
        remainingRows,
        remappedErrors,
        adapter
      );

      startTransition(() => {
        setRows(nextRows);
        setIsErrorsPanelVisible(true);
      });
      requestAnimationFrame(() => {
        focusFirstServerError(nextRows);
        refreshGridCells();
      });
      toast.warning(
        `Imported ${commitResult.successCount} of ${commitResult.totalRows} ${
          adapter.entityLabel
        }. ${commitResult.failedCount} ${
          commitResult.failedCount === 1 ? 'row needs' : 'rows need'
        } attention — fix and re-submit.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportReview = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi || rows.length === 0) return;

    gridApi.exportDataAsExcel({
      fileName: buildSpreadsheetImportExportFileName(selectedFile?.name),
      exportedRows: 'all',
      columnKeys: adapter.fields.map((field) => field.key),
    });
  };

  return {
    activeIssueId,
    activeNavigationIndex,
    allIssues,
    bulkActionMode,
    bulkField,
    canSubmit,
    fieldStatsByKey,
    bulkFieldStats,
    fileSelectionError,
    handleBulkApply,
    handleCellValueChanged,
    handleExportReview,
    handleFileSelect,
    handleGridReady,
    handleSheetChange,
    handleSubmit,
    headers,
    invalidRowCount,
    missingCountryCodeCount,
    isErrorsPanelVisible,
    isParsing,
    isSubmitting,
    jumpToIssue,
    navigationIssues,
    navigationTargetCount: navigationIssues.length,
    navigateTarget,
    parseError,
    rowFilter,
    rows,
    selectedFile,
    selectedSheetName,
    setBulkActionMode,
    setFileSelectionError,
    setIsErrorsPanelVisible,
    setRowFilter,
    setSelectedBulkFieldKey: handleSelectBulkField,
    sheetOptions,
    unmatchedHeaders,
    validRowCount,
    visibleRows,
  };
}
