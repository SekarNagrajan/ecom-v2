// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { useToast } from "@solverminds/shared-ui/hooks";
import { Alert, theme } from "antd";
import { useState } from "react";

import { NavigationBlocker } from "../../../components/shared/navigation-blocker";
import { useSpreadsheetImportWorkbench } from "../hooks/use-spreadsheet-import-workbench";
import type {
  SpreadsheetImportAdapter,
  SpreadsheetImportCommitResult,
  SpreadsheetImportEngine,
  SpreadsheetImportFieldKey,
  SpreadsheetImportValidateResult,
} from "../types/import-workbench.types";
import { createSpreadsheetImportColumnDefs } from "../utils/create-spreadsheet-import-column-defs";
import { downloadSpreadsheetImportTemplate } from "../utils/spreadsheet-import-template.utils";
import { ImportBulkFixModal } from "./import-bulk-fix-modal";
import { ImportEmptyState } from "./import-empty-state";
import { ImportReviewGridSection } from "./import-review-grid-section";
import { ImportReviewMetrics } from "./import-review-metrics";
import { ImportReviewToolbar } from "./import-review-toolbar";
import { ImportWorkbenchHeader } from "./import-workbench-header";

const ACCEPTED_SPREADSHEET_FILES = ".xlsx";
const MAX_SPREADSHEET_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface SpreadsheetImportWorkbenchProps<TValues extends object, TPayload> {
  adapter: SpreadsheetImportAdapter<TValues, TPayload>;
  engine: SpreadsheetImportEngine;
  onCancel: () => void;
  onValidate: (
    payloads: TPayload[],
  ) => Promise<SpreadsheetImportValidateResult>;
  onCommit: (payloads: TPayload[]) => Promise<SpreadsheetImportCommitResult>;
  submitDisabledReason?: string | null;
  subtitle?: string;
  title: string;
}

export function SpreadsheetImportWorkbench<TValues extends object, TPayload>({
  adapter,
  engine,
  onCancel,
  onValidate,
  onCommit,
  submitDisabledReason,
  subtitle,
  title,
}: SpreadsheetImportWorkbenchProps<TValues, TPayload>) {
  const { token } = theme.useToken();
  const toast = useToast();
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const {
    activeIssueId,
    allIssues,
    bulkActionMode,
    bulkField,
    bulkFieldStats,
    canSubmit,
    fieldStatsByKey,
    fileSelectionError,
    handleBulkApply,
    handleCellValueChanged,
    handleExportReview,
    handleFileSelect,
    handleGridReady,
    handleSheetChange,
    handleSubmit,
    invalidRowCount,
    isErrorsPanelVisible,
    isParsing,
    isSubmitting,
    jumpToIssue,
    navigationIssues,
    navigateTarget,
    navigationTargetCount,
    missingCountryCodeCount,
    parseError,
    rowFilter,
    selectedFile,
    selectedSheetName,
    setBulkActionMode,
    setFileSelectionError,
    setIsErrorsPanelVisible,
    setRowFilter,
    setSelectedBulkFieldKey,
    sheetOptions,
    unmatchedHeaders,
    validRowCount,
    visibleRows,
    rows,
  } = useSpreadsheetImportWorkbench({
    adapter,
    engine,
    onValidate,
    onCommit,
    submitDisabledReason,
  });
  const isBusy = isParsing || isSubmitting;

  const columnDefs = createSpreadsheetImportColumnDefs(adapter, {
    errorBackground: token.colorErrorBg,
    errorBorder: token.colorErrorBorder,
    fixedBackground: token.colorSuccessBg,
    fixedBorder: token.colorSuccessBorder,
  }, {
    highlightedFieldKey: bulkField?.key,
  });

  const submitLabel =
    adapter.getSubmitLabel?.(validRowCount) ??
    `Submit ${validRowCount} ${adapter.entityLabel}`;

  const handleSheetToggle = (sheetName: string) => {
    void handleSheetChange(sheetName);
  };

  const handleBulkFieldChange = (fieldKey?: string) => {
    setSelectedBulkFieldKey(
      fieldKey as SpreadsheetImportFieldKey<TValues> | undefined,
    );
  };

  const handleMobileJumpToIssue = (
    issue: (typeof navigationIssues)[number],
  ) => {
    jumpToIssue(issue);
    setIsErrorsPanelVisible(false);
  };

  const handleDownloadTemplate = async () => {
    if (isDownloadingTemplate) {
      return;
    }
    setIsDownloadingTemplate(true);
    try {
      await downloadSpreadsheetImportTemplate(adapter);
    } catch {
      toast.error("Could not generate the import template. Please try again.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const hasAlerts = Boolean(
    submitDisabledReason || fileSelectionError || parseError,
  );

  return (
    <>
      <NavigationBlocker
        shouldBlock={Boolean(selectedFile) && !isSubmitting}
        title="Leave import?"
        message="Your loaded workbook and fixes will be lost. Stay on this page to continue, or discard and leave."
      />

      <div className="import-wb">
        <ImportWorkbenchHeader
          accept={ACCEPTED_SPREADSHEET_FILES}
          canSubmit={canSubmit}
          canExport={!isBusy && rows.length > 0}
          disableFileActions={isBusy}
          fileName={selectedFile?.name}
          fields={adapter.fields}
          isSubmitting={isSubmitting}
          isDownloadingTemplate={isDownloadingTemplate}
          maxSizeBytes={MAX_SPREADSHEET_FILE_SIZE_BYTES}
          onBack={onCancel}
          onDownloadTemplate={handleDownloadTemplate}
          onExportReview={handleExportReview}
          onFileSelect={handleFileSelect}
          onSubmit={handleSubmit}
          onValidationError={setFileSelectionError}
          submitLabel={submitLabel}
          subtitle={subtitle}
          title={title}
        />

        <div className="import-wb__body">
          {hasAlerts ? (
            <div className="import-wb__alerts">
              {submitDisabledReason ? (
                <Alert type="info" showIcon message={submitDisabledReason} />
              ) : null}
              {fileSelectionError ? (
                <Alert type="error" showIcon message={fileSelectionError} />
              ) : null}
              {parseError ? (
                <Alert type="error" showIcon message={parseError} />
              ) : null}
            </div>
          ) : null}

          {!selectedFile ? (
            <ImportEmptyState
              accept={ACCEPTED_SPREADSHEET_FILES}
              maxSizeBytes={MAX_SPREADSHEET_FILE_SIZE_BYTES}
              fields={adapter.fields}
              onFileSelect={handleFileSelect}
              onValidationError={setFileSelectionError}
              disabled={isParsing || isSubmitting}
            />
          ) : (
            <div className="import-wb-review">
              <ImportReviewMetrics
                fileName={selectedFile.name}
                rowCount={rows.length}
                validRowCount={validRowCount}
                invalidRowCount={invalidRowCount}
                issueCount={allIssues.length}
              />

              <ImportReviewToolbar
                sheetOptions={sheetOptions}
                selectedSheetName={selectedSheetName}
                onToggleSheet={handleSheetToggle}
                rowFilter={rowFilter}
                onChangeRowFilter={setRowFilter}
                onPreviousError={() => navigateTarget(-1)}
                onNextError={() => navigateTarget(1)}
                errorsVisible={isErrorsPanelVisible}
                onToggleErrors={() => setIsErrorsPanelVisible((prev) => !prev)}
                supportedFields={adapter.fields}
                bulkField={bulkField}
                bulkFieldStats={bulkFieldStats}
                fieldStatsByKey={fieldStatsByKey}
                onChangeBulkField={handleBulkFieldChange}
                navigationTargetCount={navigationTargetCount}
                missingCountryCodeCount={missingCountryCodeCount}
                onAddCountryCode={() => setBulkActionMode("countryCode")}
                onReplaceInvalid={() => setBulkActionMode("invalid")}
                onFillEmpty={() => setBulkActionMode("empty")}
                isBusy={isBusy}
              />

              <ImportReviewGridSection
                activeIssueId={activeIssueId}
                columnDefs={columnDefs}
                isErrorsPanelVisible={isErrorsPanelVisible}
                isParsing={isParsing}
                issues={navigationIssues}
                onCloseErrors={() => setIsErrorsPanelVisible(false)}
                onGridReady={handleGridReady}
                onJumpToIssue={jumpToIssue}
                onMobileJumpToIssue={handleMobileJumpToIssue}
                onCellValueChanged={handleCellValueChanged}
                rows={visibleRows}
                unmatchedHeaders={unmatchedHeaders}
              />

              {bulkField && bulkActionMode ? (
                <ImportBulkFixModal
                  key={`${bulkField.key}-${bulkActionMode}`}
                  open
                  field={bulkField}
                  mode={bulkActionMode}
                  affectedCount={
                    bulkActionMode === "countryCode"
                      ? missingCountryCodeCount
                      : bulkActionMode === "invalid"
                        ? (fieldStatsByKey.get(bulkField.key)?.invalidCount ??
                          0)
                        : (fieldStatsByKey.get(bulkField.key)?.emptyCount ?? 0)
                  }
                  emptyCount={
                    fieldStatsByKey.get(bulkField.key)?.emptyCount ?? 0
                  }
                  issueCodeCounts={
                    fieldStatsByKey.get(bulkField.key)?.issueCodeCounts
                  }
                  onClose={() => setBulkActionMode(null)}
                  onApply={handleBulkApply}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
