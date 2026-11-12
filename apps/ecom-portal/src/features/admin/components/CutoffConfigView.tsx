// Modified by Sekar Nagarajan (2026-11-12 15:40)
/**
 * Cutoff Configuration — per port / terminal closing hours (CutoffConfiguration.jsp parity).
 * The grid is the page; create and edit happen in a drawer. A duplicate port+terminal (409) is
 * shown on the Terminal field, and the saved row is scrolled into view and flashed.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormInputNumber,
  FormSelect,
  FormSwitch,
} from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import type { GridApi, RowDataUpdatedEvent } from "ag-grid-community";
import { Col, Row } from "antd";
import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  FIELD_GUTTER,
  FIELD_ITEM_PROPS,
  optLabel,
  reqLabel,
} from "../../../components/shared/form-field-label";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { AdminApiError } from "../api/admin-request";
import type { CutoffCreatePayload, CutoffUpdatePayload } from "../api/admin.api";
import { useCutoffPortsQuery, useCutoffTerminalsQuery } from "../api/admin.queries";
import {
  CUTOFF_FORM_DEFAULTS,
  CutoffConfigFormSchema,
  type CutoffConfig,
  type CutoffConfigFormInput,
  type CutoffConfigFormValues,
} from "../types/admin.types";
import { AdminDrawer } from "./shared/AdminDrawer";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminLockedField } from "./shared/AdminLockedField";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill } from "./shared/AdminStatusPill";

type DrawerState = { mode: "create" } | { mode: "edit"; row: CutoffConfig } | null;

interface CutoffConfigViewProps {
  cutoffConfigs: CutoffConfig[];
  onCreate: (data: CutoffCreatePayload) => Promise<CutoffConfig>;
  onUpdate: (payload: { id: string; data: CutoffUpdatePayload }) => Promise<CutoffConfig>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
  isFetching: boolean;
}

const CLOSING_FIELDS: {
  name: keyof Pick<
    CutoffConfigFormValues,
    "cfsClosing" | "vgmClosing" | "documentClosing" | "ediDecClosing" | "fullCntrGateClosing"
  >;
  label: string;
  header: string;
}[] = [
  { name: "cfsClosing", label: "CFS Closing", header: "CFS" },
  { name: "vgmClosing", label: "VGM Closing", header: "VGM" },
  { name: "documentClosing", label: "Document Closing", header: "Docs" },
  { name: "ediDecClosing", label: "EDI Declaration Closing", header: "EDI" },
  { name: "fullCntrGateClosing", label: "Full Container Gate-in Closing", header: "Gate-in" },
];

const hoursFormatter = (params: { value?: number | null }) =>
  params.value == null ? "" : `${params.value} h`;

export function CutoffConfigView({
  cutoffConfigs,
  onCreate,
  onUpdate,
  onDelete,
  isSaving,
  isFetching,
}: CutoffConfigViewProps) {
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("admin-cutoff");
  const addButtonRef = useRef<HTMLSpanElement>(null);
  const gridApiRef = useRef<GridApi<CutoffConfig> | null>(null);
  const pendingHighlightId = useRef<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const form = useForm<CutoffConfigFormInput, unknown, CutoffConfigFormValues>({
    resolver: zodResolver(CutoffConfigFormSchema) as Resolver<
      CutoffConfigFormInput,
      unknown,
      CutoffConfigFormValues
    >,
    defaultValues: CUTOFF_FORM_DEFAULTS,
    mode: "onChange",
  });
  const portCode = form.watch("portCode") ?? "";
  const isEdit = drawer?.mode === "edit";

  const portsQuery = useCutoffPortsQuery({ enabled: drawer !== null });
  const terminalsQuery = useCutoffTerminalsQuery(isEdit ? "" : portCode);

  const portOptions = (portsQuery.data ?? []).map((p) => ({ value: p.portCode, label: p.label }));
  const terminalOptions = (terminalsQuery.data ?? []).map((t) => ({
    value: t.terminalCode,
    label: t.terminalName,
  }));

  const openCreate = () => {
    form.reset(CUTOFF_FORM_DEFAULTS);
    setDrawer({ mode: "create" });
  };
  const openEdit = (row: CutoffConfig) => {
    form.reset({
      portCode: row.portCode,
      terminalCode: row.terminalCode,
      cfsClosing: row.cfsClosing,
      vgmClosing: row.vgmClosing,
      documentClosing: row.documentClosing,
      ediDecClosing: row.ediDecClosing,
      fullCntrGateClosing: row.fullCntrGateClosing,
      excludeWeekends: row.excludeWeekends,
    });
    setDrawer({ mode: "edit", row });
  };
  const closeDrawer = () => {
    setDrawer(null);
    form.reset(CUTOFF_FORM_DEFAULTS);
  };

  const highlightRow = (id: string) => {
    pendingHighlightId.current = id;
    const api = gridApiRef.current;
    const node = api?.getRowNode(id);
    if (api && node) {
      api.ensureNodeVisible(node);
      api.flashCells({ rowNodes: [node] });
      pendingHighlightId.current = null;
    }
  };

  const onRowDataUpdated = (event: RowDataUpdatedEvent<CutoffConfig>) => {
    const id = pendingHighlightId.current;
    if (!id) return;
    const node = event.api.getRowNode(id);
    if (!node) return;
    event.api.ensureNodeVisible(node);
    event.api.flashCells({ rowNodes: [node] });
    pendingHighlightId.current = null;
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (drawer?.mode === "edit") {
        const { portCode: _port, terminalCode: _terminal, ...data } = values;
        const saved = await onUpdate({ id: drawer.row.id, data });
        closeDrawer();
        highlightRow(saved.id);
        return;
      }
      const port = (portsQuery.data ?? []).find((p) => p.portCode === values.portCode);
      const terminal = (terminalsQuery.data ?? []).find((t) => t.terminalCode === values.terminalCode);
      const saved = await onCreate({
        ...values,
        portName: port?.portName ?? values.portCode,
        terminalName: terminal?.terminalName ?? values.terminalCode,
      });
      closeDrawer();
      highlightRow(saved.id);
    } catch (error: unknown) {
      if (error instanceof AdminApiError && error.code === "DUPLICATE") {
        form.setError("terminalCode", {
          message: "A cutoff already exists for this port and terminal",
        });
      }
      /* other failures are surfaced by the mutation's onError toast */
    }
  });

  const handleDelete = (row: CutoffConfig) => {
    confirm.danger({
      title: "Delete Cutoff Configuration",
      content: `Delete the cutoff for ${row.portName} / ${row.terminalName}? Bookings fall back to the default closing times.`,
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await onDelete(row.id);
          if (drawer?.mode === "edit" && drawer.row.id === row.id) closeDrawer();
        } catch {
          /* surfaced by the mutation's onError toast */
        }
      },
    });
  };

  const columnDefs: DataViewColumn<CutoffConfig>[] = [
    {
      ...buildActionsColumn<CutoffConfig>({
        field: "id",
        width: 100,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Edit"
                tone="edit"
                icon={<AppIcon icon={Icons.edit} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(row);
                }}
              />
              <ListActionButton
                title="Delete"
                tone="delete"
                icon={<AppIcon icon={Icons.trash} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Port",
      field: "portCode",
      flex: 1.3,
      minWidth: 180,
      valueGetter: (params) =>
        params.data ? `${params.data.portCode} – ${params.data.portName}` : "",
    },
    { headerName: "Terminal", field: "terminalName", flex: 1, minWidth: 140 },
    ...CLOSING_FIELDS.map<DataViewColumn<CutoffConfig>>((f) => ({
      headerName: f.header,
      headerTooltip: `${f.label} (hours before ETD)`,
      field: f.name,
      width: 104,
      type: "numericColumn",
      valueFormatter: hoursFormatter,
    })),
    {
      headerName: "Weekends",
      headerTooltip: "Exclude weekends when counting hours",
      field: "excludeWeekends",
      width: 130,
      cellRenderer: (params: { value?: boolean }) => (
        <AdminStatusPill tone={params.value ? "info" : "neutral"}>
          {params.value ? "Excluded" : "Counted"}
        </AdminStatusPill>
      ),
      valueFormatter: (params) => (params.value ? "Excluded" : "Counted"),
    },
  ];

  return (
    <AdminSectionPage
      extra={
        <span ref={addButtonRef} className="admin-section__action">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={openCreate}
          >
            Add Cutoff
          </AppButton>
        </span>
      }
    >
      <div className="admin-cutoff-form">
        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={cutoffConfigs}
            columnDefs={columnDefs}
            loading={isFetching}
            emptyState={
              <ModuleEmptyState
                variant="blank"
                title="No cutoff configurations yet"
                message="Add a port and terminal to set its closing hours."
                actions={[{ key: "add", label: "Add Cutoff", type: "primary", onClick: openCreate }]}
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
              onGridReady: (params) => {
                gridApiRef.current = params.api;
              },
              gridOptions: {
                domLayout: "autoHeight",
                getRowId: (params: { data: CutoffConfig }) => params.data.id,
                onRowDataUpdated,
              },
            }}
          />
        </div>
      </div>

      {drawer ? (
        <AdminDrawer
          open
          onClose={closeDrawer}
          icon={Icons.clock}
          title={isEdit ? "Edit Cutoff" : "Add Cutoff"}
          subtitle={
            isEdit
              ? `${drawer.row.portName} / ${drawer.row.terminalName}`
              : "Closing hours are counted back from the vessel ETD."
          }
          isPending={isSaving}
          isDirty={form.formState.isDirty}
          primaryLabel={isEdit ? "Save Changes" : "Add Cutoff"}
          primaryIcon={isEdit ? Icons.save : Icons.plus}
          onPrimary={() => void handleSubmit()}
          returnFocusRef={addButtonRef}
        >
          <AdminFormSection step={1} title="Location" hint="The port and terminal this cutoff applies to.">
            {isEdit ? (
              <Row gutter={FIELD_GUTTER}>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <AdminLockedField
                    label="Port"
                    icon={Icons.anchor}
                    value={`${drawer.row.portCode} – ${drawer.row.portName}`}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <AdminLockedField label="Terminal" value={drawer.row.terminalName} />
                </Col>
              </Row>
            ) : (
              <Row gutter={FIELD_GUTTER}>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormSelect
                    control={form.control}
                    name="portCode"
                    label={reqLabel("Port")}
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select port"
                    options={portOptions}
                    loading={portsQuery.isLoading}
                    className="admin-stack-full"
                    formItemProps={FIELD_ITEM_PROPS}
                    onSelect={() => form.setValue("terminalCode", "", { shouldValidate: true })}
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormSelect
                    control={form.control}
                    name="terminalCode"
                    label={reqLabel("Terminal")}
                    size="large"
                    placeholder={portCode ? "Select terminal" : "Select a port first"}
                    options={terminalOptions}
                    loading={terminalsQuery.isLoading}
                    disabled={!portCode}
                    className="admin-stack-full"
                    formItemProps={FIELD_ITEM_PROPS}
                  />
                </Col>
              </Row>
            )}
          </AdminFormSection>

          <AdminFormSection step={2} title="Closing Times" hint="Hours before the vessel's estimated departure.">
            <Row gutter={FIELD_GUTTER}>
              {CLOSING_FIELDS.map((f) => (
                <Col key={f.name} {...RESPONSIVE_COL.formHalf}>
                  <FormInputNumber
                    control={form.control}
                    name={f.name}
                    label={reqLabel(f.label)}
                    size="large"
                    min={1}
                    max={999}
                    numericMode="positive-integer"
                    addonAfter="hrs"
                    className="admin-stack-full"
                    formItemProps={FIELD_ITEM_PROPS}
                  />
                </Col>
              ))}
            </Row>
          </AdminFormSection>

          <AdminFormSection step={3} title="Calendar">
            <FormSwitch
              control={form.control}
              name="excludeWeekends"
              label={optLabel("Exclude Weekends")}
              description="Skip Saturday and Sunday when counting the hours."
              formItemProps={FIELD_ITEM_PROPS}
            />
          </AdminFormSection>
        </AdminDrawer>
      ) : null}
    </AdminSectionPage>
  );
}
