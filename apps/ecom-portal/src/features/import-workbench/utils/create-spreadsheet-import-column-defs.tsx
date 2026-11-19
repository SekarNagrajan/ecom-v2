import type { DataViewColumn } from "@solverminds/shared-ui/data-view";
import type { ColDefField } from "ag-grid-community";
import { Tag } from "antd";

import { ImportSelectCellEditor } from "../components/import-select-cell-editor";
import {
  type SpreadsheetImportAdapter,
  type SpreadsheetImportFieldKey,
  type SpreadsheetImportGridRow,
  SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
} from "../types/import-workbench.types";
import { SPREADSHEET_IMPORT_TEXT_EXCEL_STYLE_ID } from "./spreadsheet-import-export.utils";

export interface SpreadsheetImportColumnLabels {
  row: string;
  status: string;
  ready: string;
  fixed: string;
  errorsCount: (count: number) => string;
  yes: string;
  no: string;
  emptyValue: string;
}

function asGridField<TValues extends object>(
  field: string,
): ColDefField<SpreadsheetImportGridRow<TValues>, unknown> {
  return field as ColDefField<SpreadsheetImportGridRow<TValues>, unknown>;
}

function formatBooleanCellValue(
  value: unknown,
  labels: Pick<SpreadsheetImportColumnLabels, "yes" | "no" | "emptyValue">,
) {
  if (typeof value === "boolean") {
    return value ? labels.yes : labels.no;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return labels.emptyValue;
}

export function createSpreadsheetImportColumnDefs<TValues extends object>(
  adapter: SpreadsheetImportAdapter<TValues, unknown>,
  colors: {
    errorBackground: string;
    errorBorder: string;
    fixedBackground: string;
    fixedBorder: string;
  },
  options: {
    highlightedFieldKey?: SpreadsheetImportFieldKey<TValues>;
    labels: SpreadsheetImportColumnLabels;
  },
): DataViewColumn<SpreadsheetImportGridRow<TValues>>[] {
  const { labels } = options;
  const columns: DataViewColumn<SpreadsheetImportGridRow<TValues>>[] = [
    {
      field: asGridField<TValues>("__rowNumber"),
      headerName: labels.row,
      pinned: "left",
      width: 50,
      sortable: false,
      editable: false,
    },
    {
      field: asGridField<TValues>("__issueCount"),
      headerName: labels.status,
      pinned: "left",
      width: 100,
      sortable: false,
      editable: false,
      cellRenderer: (params: { data?: SpreadsheetImportGridRow<TValues> }) => {
        const issueCount = params.data?.__issueCount ?? 0;
        const fixedCount = params.data?.__fixedFieldKeys.length ?? 0;
        return issueCount > 0 ? (
          <Tag color="error">{labels.errorsCount(issueCount)}</Tag>
        ) : fixedCount > 0 ? (
          <Tag color="success">{labels.fixed}</Tag>
        ) : (
          <Tag color="success">{labels.ready}</Tag>
        );
      },
    },
  ];

  for (const field of adapter.fields) {
    const optionLabelByValue = new Map(
      (field.options ?? []).map((option) => [option.value, option.label]),
    );

    columns.push({
      field: asGridField<TValues>(field.key),
      headerName: field.label,
      minWidth: field.width ?? 180,
      editable: true,
      headerClass:
        options.highlightedFieldKey === field.key
          ? "import-wb-col-highlight"
          : undefined,
      cellClass:
        [
          field.exportAsText ? SPREADSHEET_IMPORT_TEXT_EXCEL_STYLE_ID : "",
          options.highlightedFieldKey === field.key
            ? "import-wb-col-highlight-cell"
            : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined,
      filterType:
        field.kind === "select"
          ? "select"
          : field.kind === "boolean"
            ? "boolean"
            : field.kind === "number"
              ? "number"
              : "text",
      cellEditor: field.kind === "select" ? ImportSelectCellEditor : undefined,
      cellEditorParams:
        field.kind === "select"
          ? {
              options: field.options ?? [],
            }
          : undefined,
      cellEditorPopup: field.kind === "select",
      cellEditorPopupPosition: field.kind === "select" ? "under" : undefined,
      tooltipValueGetter: (params) => {
        const rowIssues = params.data?.__issues ?? [];
        return rowIssues
          .filter(
            (issue) =>
              issue.fieldKey === field.key &&
              issue.code !== SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
          )
          .map((issue) => issue.message)
          .join("\n");
      },
      valueFormatter:
        field.kind === "select"
          ? (params) =>
              optionLabelByValue.get(String(params.value ?? "")) ??
              String(params.value ?? "")
          : field.kind === "boolean"
            ? (params) => formatBooleanCellValue(params.value, labels)
            : undefined,
      cellStyle: (params) => {
        const rowData = params.data;
        // Server-error issues are row-level (BE `field` is null) — skip them
        // here so the per-cell red highlight only reflects real field-level
        // client-side validation.
        const hasIssue = (rowData?.__issues ?? []).some(
          (issue) =>
            issue.fieldKey === field.key &&
            issue.code !== SPREADSHEET_IMPORT_SERVER_ERROR_CODE,
        );
        const isFixed = (rowData?.__fixedFieldKeys ?? []).includes(field.key);

        if (hasIssue) {
          return {
            backgroundColor: colors.errorBackground,
            border: `1px solid ${colors.errorBorder}`,
          };
        }

        if (isFixed) {
          return {
            backgroundColor: colors.fixedBackground,
            border: `1px solid ${colors.fixedBorder}`,
          };
        }

        return undefined;
      },
    });
  }

  return columns;
}
