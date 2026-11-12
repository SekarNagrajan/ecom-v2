// Modified by Sekar Nagarajan (2026-11-12 14:10)
/**
 * Field Configuration — visibility / mandatory flags per form field in a DataView grid. Edits are
 * kept as per-row overrides (useDraftList) until Save; dirty rows show a revert action.
 */
import { AppSwitch } from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Input, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildClearFiltersAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import { useDraftList } from "../hooks/use-draft-list";
import type { FieldConfig } from "../types/admin.types";
import { AdminFilterPills } from "./shared/AdminFilterPills";
import { AdminFormFooter } from "./shared/AdminFormFooter";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminUnsavedGuard } from "./shared/AdminUnsavedGuard";

const { Text } = Typography;

interface FieldConfigViewProps {
  fields: FieldConfig[];
  onSave: (fields: FieldConfig[]) => Promise<void>;
  isSaving: boolean;
  isFetching: boolean;
}

export function FieldConfigView({
  fields,
  onSave,
  isSaving,
  isFetching,
}: FieldConfigViewProps) {
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("admin-field-config");
  const draft = useDraftList(fields, (field) => field.id);
  const [formFilter, setFormFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const formNames = Array.from(new Set(fields.map((f) => f.formName))).sort();
  const query = search.trim().toLowerCase();
  const rows = draft.items.filter(
    (row) =>
      (formFilter === "all" || row.formName === formFilter) &&
      (!query ||
        row.fieldId.toLowerCase().includes(query) ||
        row.fieldLabel.toLowerCase().includes(query)),
  );
  const isFiltered = formFilter !== "all" || query.length > 0;

  const setFlag = (row: FieldConfig, key: "isVisible" | "isRequired", value: boolean) => {
    // A hidden field cannot be mandatory.
    if (key === "isVisible" && !value) {
      draft.updateItem(row.id, { isVisible: false, isRequired: false });
      return;
    }
    draft.updateItem(row.id, { [key]: value });
  };

  const save = async () => {
    await onSave(draft.items);
    draft.reset();
  };

  const handleCancel = () => {
    if (draft.dirtyCount >= 5) {
      confirm.show({
        title: "Discard changes?",
        content: `${draft.dirtyCount} field changes will be lost.`,
        okText: "Discard",
        cancelText: "Keep editing",
        okButtonProps: { danger: true },
        onOk: draft.reset,
      });
      return;
    }
    draft.reset();
  };

  const columnDefs: DataViewColumn<FieldConfig>[] = [
    {
      ...buildActionsColumn<FieldConfig>({
        field: "id",
        width: 80,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          const dirty = draft.isItemDirty(row.id);
          return (
            <ListActionsRow>
              <ListActionButton
                title="Revert Row"
                tone="history"
                disabled={!dirty || isSaving}
                icon={<AppIcon icon={Icons.undo2} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  draft.revertItem(row.id);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Form Module",
      field: "formName",
      width: 150,
      cellRenderer: (params: { value?: string }) =>
        params.value ? <Tag className="admin-code-tag">{params.value}</Tag> : null,
    },
    {
      headerName: "Field Identifier",
      field: "fieldId",
      flex: 1,
      minWidth: 160,
      cellRenderer: (params: { value?: string }) => <Text code>{params.value}</Text>,
    },
    {
      headerName: "Field Label",
      field: "fieldLabel",
      flex: 1.4,
      minWidth: 200,
      cellRenderer: (params: { value?: string; data?: FieldConfig }) => (
        <span className="admin-cell-text">
          {params.value}
          {params.data && draft.isItemDirty(params.data.id) ? (
            <Tooltip title="Unsaved change">
              <span className="admin-dirty-dot" aria-label="Unsaved change" />
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    {
      headerName: "Visible",
      field: "isVisible",
      width: 110,
      sortable: true,
      cellRenderer: (params: { data?: FieldConfig }) =>
        params.data ? (
          <span className="admin-switch-cell">
            <AppSwitch
              {...yesNoSwitchInner}
              className={FORM_YES_NO_SWITCH_CLASS}
              checked={params.data.isVisible}
              disabled={isSaving}
              aria-label={`Visible: ${params.data.fieldLabel}`}
              onChange={(checked) => setFlag(params.data!, "isVisible", checked)}
            />
          </span>
        ) : null,
    },
    {
      headerName: "Required",
      field: "isRequired",
      width: 120,
      sortable: true,
      cellRenderer: (params: { data?: FieldConfig }) =>
        params.data ? (
          <Tooltip title={params.data.isVisible ? undefined : "Hidden fields can't be required"}>
            <span className="admin-switch-cell">
              <AppSwitch
                {...yesNoSwitchInner}
                className={FORM_YES_NO_SWITCH_CLASS}
                checked={params.data.isRequired}
                disabled={isSaving || !params.data.isVisible}
                aria-label={`Required: ${params.data.fieldLabel}`}
                onChange={(checked) => setFlag(params.data!, "isRequired", checked)}
              />
            </span>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <AdminSectionPage recordCount={fields.length}>
      <AdminUnsavedGuard
        isDirty={draft.isDirty}
        onSave={async () => {
          await save();
          return true;
        }}
        onDiscard={draft.reset}
      />

      <div className="admin-field-form">
        <div className="admin-toolbar">
          <AdminFilterPills
            ariaLabel="Filter by form module"
            value={formFilter}
            onChange={setFormFilter}
            items={[
              { key: "all", label: "All", count: fields.length, tone: "primary" },
              ...formNames.map((name) => ({
                key: name,
                label: name,
                count: fields.filter((f) => f.formName === name).length,
                tone: "neutral" as const,
              })),
            ]}
            className="admin-toolbar__filters"
          />
          <Input
            size="large"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search field id or label"
            aria-label="Search fields"
            prefix={<AppIcon icon={Icons.search} size={16} />}
            className="admin-toolbar__search"
          />
        </div>

        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columnDefs}
            loading={isFetching || isSaving}
            emptyState={
              <ModuleEmptyState
                variant={isFiltered ? "filtered" : "blank"}
                title={isFiltered ? "No fields match this filter" : "No field configurations available"}
                actions={
                  isFiltered
                    ? [
                        buildClearFiltersAction(() => {
                          setFormFilter("all");
                          setSearch("");
                        }),
                      ]
                    : undefined
                }
              />
            }
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="admin-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                domLayout: "autoHeight",
                getRowId: (params: { data: FieldConfig }) => params.data.id,
              },
            }}
          />
        </div>

        {draft.isDirty ? (
          <AdminFormFooter
            isDirty={draft.isDirty}
            isSaving={isSaving}
            dirtyCount={draft.dirtyCount}
            onCancel={handleCancel}
            onSave={() => void save()}
          />
        ) : null}
      </div>
    </AdminSectionPage>
  );
}
