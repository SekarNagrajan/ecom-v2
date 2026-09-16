// Modified by Sekar Nagarajan (2026-09-15 17:20)
import type { DataViewColumn } from "@solverminds/shared-ui/data-view";
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import type { CellValueChangedEvent, GridReadyEvent } from "ag-grid-community";
import { Empty, Flex, Spin, theme } from "antd";

import type {
  SpreadsheetImportGridRow,
  SpreadsheetImportIssueRecord,
} from "../types/import-workbench.types";
import { createSpreadsheetImportGridOptions } from "../utils/create-spreadsheet-import-grid-options";
import { ImportErrorsDrawer } from "./import-errors-drawer";

interface ImportReviewGridSectionProps<TValues extends object> {
  activeIssueId?: string | null;
  columnDefs: DataViewColumn<SpreadsheetImportGridRow<TValues>>[];
  isErrorsPanelVisible: boolean;
  isParsing: boolean;
  issues: readonly SpreadsheetImportIssueRecord<TValues>[];
  onCloseErrors: () => void;
  onGridReady: (
    params: GridReadyEvent<SpreadsheetImportGridRow<TValues>>,
  ) => void;
  onJumpToIssue: (issue: SpreadsheetImportIssueRecord<TValues>) => void;
  onMobileJumpToIssue: (issue: SpreadsheetImportIssueRecord<TValues>) => void;
  onCellValueChanged: (
    event: CellValueChangedEvent<SpreadsheetImportGridRow<TValues>>,
  ) => void;
  rows: SpreadsheetImportGridRow<TValues>[];
  unmatchedHeaders: readonly string[];
}

export function ImportReviewGridSection<TValues extends object>({
  activeIssueId,
  columnDefs,
  isErrorsPanelVisible,
  isParsing,
  issues,
  onCloseErrors,
  onGridReady,
  onJumpToIssue,
  onMobileJumpToIssue,
  onCellValueChanged,
  rows,
  unmatchedHeaders,
}: ImportReviewGridSectionProps<TValues>) {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const gridOptions = createSpreadsheetImportGridOptions<TValues>();

  return (
    <>
      <div className="import-wb-review__grid">
        {isParsing ? (
          <div className="import-wb-grid-shell">
            <Flex
              align="center"
              justify="center"
              vertical
              gap={token.marginMD}
              style={{ height: "100%", minHeight: 240 }}
            >
              <Spin size="medium" />
              <Empty
                description="Analyzing workbook..."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Flex>
          </div>
        ) : (
          <div className="import-wb-grid-shell">
            <ListView<SpreadsheetImportGridRow<TValues>>
              dataMode="client"
              rowData={rows}
              columnDefs={columnDefs}
              style={{ height: "100%" }}
              showToolbar={false}
              sideBar={false}
              pagination
              paginationPageSize={50}
              pageSizeOptions={[20, 50, 100]}
              editable
              cellSelection
              onGridReady={onGridReady}
              onCellValueChanged={onCellValueChanged}
              gridOptions={gridOptions}
            />
          </div>
        )}

        {!isMobile && isErrorsPanelVisible ? (
          <div className="import-wb-errors-pane">
            <ImportErrorsDrawer
              open={isErrorsPanelVisible}
              onClose={onCloseErrors}
              issues={issues}
              activeIssueId={activeIssueId}
              unmatchedHeaders={unmatchedHeaders}
              onJumpToIssue={onJumpToIssue}
            />
          </div>
        ) : null}
      </div>

      {isMobile ? (
        <ImportErrorsDrawer
          open={isErrorsPanelVisible}
          mobileMode
          onClose={onCloseErrors}
          issues={issues}
          activeIssueId={activeIssueId}
          unmatchedHeaders={unmatchedHeaders}
          onJumpToIssue={onMobileJumpToIssue}
        />
      ) : null}
    </>
  );
}
