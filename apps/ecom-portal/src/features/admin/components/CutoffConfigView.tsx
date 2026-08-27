// Modified by Sekar Nagarajan (2026-08-27 15:00)
/**
 * Cutoff Configuration — parity with CutoffConfiguration.jsp / CutoffConfigurationView.jsp.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormCheckbox,
  FormInputNumber,
  FormSelect,
} from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Tag, Typography } from "antd";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { adminApi } from "../api/admin.api";
import { ADMIN_KEYS } from "../hooks/use-admin-controller";
import {
  CutoffConfigFormSchema,
  type CutoffConfig,
  type CutoffConfigFormValues,
} from "../types/admin.types";
import { AdminLoadingCenter } from "./admin-loading-center";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const DEFAULT_FORM: CutoffConfigFormValues = {
  portCode: "",
  terminalCode: "",
  cfsClosing: undefined as unknown as number,
  vgmClosing: undefined as unknown as number,
  documentClosing: undefined as unknown as number,
  ediDecClosing: undefined as unknown as number,
  fullCntrGateClosing: undefined as unknown as number,
  excludeWeekends: false,
};

interface CutoffConfigViewProps {
  cutoffConfigs: CutoffConfig[];
  isLoading?: boolean;
  onCreate: (
    data: CutoffConfigFormValues & {
      portName: string;
      terminalName: string;
    },
  ) => Promise<CutoffConfig>;
  onUpdate: (payload: {
    id: string;
    data: Omit<CutoffConfigFormValues, "portCode" | "terminalCode">;
  }) => Promise<CutoffConfig>;
  onDelete: (id: string) => Promise<void>;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

export function CutoffConfigView({
  cutoffConfigs,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete,
}: CutoffConfigViewProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CutoffConfigFormValues>({
    resolver: zodResolver(
      CutoffConfigFormSchema,
    ) as Resolver<CutoffConfigFormValues>,
    defaultValues: DEFAULT_FORM,
    mode: "onChange",
  });

  const portCode = form.watch("portCode");
  const isEditMode = Boolean(editingId);

  const portsQuery = useQuery({
    queryKey: ADMIN_KEYS.cutoffPorts,
    queryFn: adminApi.getCutoffPorts,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const terminalsQuery = useQuery({
    queryKey: ADMIN_KEYS.cutoffTerminals(portCode || ""),
    queryFn: () => adminApi.getCutoffTerminals(portCode),
    enabled: Boolean(portCode),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const portOptions = (portsQuery.data ?? []).map((p) => ({
    value: p.portCode,
    label: p.label,
  }));

  const terminalOptions = (terminalsQuery.data ?? []).map((t) => ({
    value: t.terminalCode,
    label: t.terminalName,
  }));

  const resetForm = () => {
    setEditingId(null);
    form.reset(DEFAULT_FORM);
  };

  const handleEdit = (row: CutoffConfig) => {
    setEditingId(row.id);
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
  };

  const handleDelete = (row: CutoffConfig) => {
    confirm.danger({
      title: "Delete Cutoff Configuration",
      content: `Do you want to delete ${row.portCode} / ${row.terminalName}?`,
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await onDelete(row.id);
          if (editingId === row.id) {
            resetForm();
          }
          toast.success("Cutoff configuration deleted");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to delete cutoff configuration",
          );
        }
      },
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      if (isEditMode && editingId) {
        await onUpdate({
          id: editingId,
          data: {
            cfsClosing: values.cfsClosing,
            vgmClosing: values.vgmClosing,
            documentClosing: values.documentClosing,
            ediDecClosing: values.ediDecClosing,
            fullCntrGateClosing: values.fullCntrGateClosing,
            excludeWeekends: values.excludeWeekends,
          },
        });
        toast.success("Cutoff configuration updated");
      } else {
        const port = (portsQuery.data ?? []).find(
          (p) => p.portCode === values.portCode,
        );
        const terminal = (terminalsQuery.data ?? []).find(
          (t) => t.terminalCode === values.terminalCode,
        );
        await onCreate({
          ...values,
          portName: port?.portName ?? values.portCode,
          terminalName: terminal?.terminalName ?? values.terminalCode,
        });
        toast.success("Cutoff configuration saved");
      }
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save cutoff configuration",
      );
    } finally {
      setIsSaving(false);
    }
  });

  const columnDefs: DataViewColumn<CutoffConfig>[] = [
    {
      ...buildActionsColumn<CutoffConfig>({
        field: "id",
        width: 110,
        cellRenderer: (params) => {
          if (!params.data) return null;
          const row = params.data;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Edit"
                tone="edit"
                icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
              />
              <ListActionButton
                title="Delete"
                tone="delete"
                icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
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
      flex: 1.2,
      minWidth: 160,
      valueGetter: (params) => {
        const row = params.data;
        if (!row) return "";
        return `${row.portCode} - ${row.portName}`;
      },
    },
    {
      headerName: "Terminal",
      field: "terminalName",
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "CFS Full Container Gate-in Closing",
      field: "cfsClosing",
      width: 160,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? null : (
          <Tag className="admin-code-tag">{params.value}</Tag>
        ),
    },
    {
      headerName: "VGM Closing",
      field: "vgmClosing",
      width: 120,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? null : (
          <Tag className="admin-code-tag">{params.value}</Tag>
        ),
    },
    {
      headerName: "Document Closing",
      field: "documentClosing",
      width: 140,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? null : (
          <Tag className="admin-code-tag">{params.value}</Tag>
        ),
    },
    {
      headerName: "EDI Declaration Closing",
      field: "ediDecClosing",
      width: 160,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? null : (
          <Tag className="admin-code-tag">{params.value}</Tag>
        ),
    },
    {
      headerName: "Full Container Gate-in Closing",
      field: "fullCntrGateClosing",
      width: 170,
      cellRenderer: (params: { value?: number }) =>
        params.value == null ? null : (
          <Tag className="admin-code-tag">{params.value}</Tag>
        ),
    },
    {
      headerName: "Exclude Weekends",
      field: "excludeWeekends",
      width: 140,
      cellRenderer: (params: { value?: boolean }) => (
        <Tag
          className="admin-status-tag"
          color={params.value ? "success" : "default"}
        >
          {params.value ? "Y" : "N"}
        </Tag>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AdminPanelShell
        icon={Icons.clock}
        title="Cutoff Configuration"
        subtitle="Configure port and terminal closing hours for CFS, VGM, documents, EDI, and gate-in."
      >
        <AdminLoadingCenter />
      </AdminPanelShell>
    );
  }

  return (
    <AdminPanelShell
      icon={Icons.clock}
      title="Cutoff Configuration"
      subtitle="Configure port and terminal closing hours for CFS, VGM, documents, EDI, and gate-in."
    >
      <div className="admin-cutoff-form">
        <form
          className="admin-cutoff-create"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Row 1 — 5 columns */}
          <div className="admin-cutoff-create__row admin-cutoff-create__row--5">
            <FormSelect
              control={form.control}
              name="portCode"
              label={reqLabel("Port")}
              size="large"
              showSearch
              optionFilterProp="label"
              placeholder="Select port"
              options={portOptions}
              disabled={isEditMode || isSaving}
              formItemProps={FIELD_ITEM_PROPS}
              className="admin-stack-full"
              onSelect={() => {
                form.setValue("terminalCode", "", { shouldValidate: true });
              }}
            />

            <FormSelect
              control={form.control}
              name="terminalCode"
              label={reqLabel("Terminal")}
              size="large"
              placeholder="Select Terminal"
              options={terminalOptions}
              disabled={isEditMode || isSaving || !portCode}
              formItemProps={FIELD_ITEM_PROPS}
              className="admin-stack-full"
            />

            <FormInputNumber
              control={form.control}
              name="cfsClosing"
              label={reqLabel("CFS Full Container Gate-in Closing")}
              size="large"
              min={1}
              max={999}
              placeholder="In hours"
              numericMode="positive-integer"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />

            <FormInputNumber
              control={form.control}
              name="vgmClosing"
              label={reqLabel("VGM Closing")}
              size="large"
              min={1}
              max={999}
              placeholder="In hours"
              numericMode="positive-integer"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />

            <FormInputNumber
              control={form.control}
              name="documentClosing"
              label={reqLabel("Document Closing")}
              size="large"
              min={1}
              max={999}
              placeholder="In hours"
              numericMode="positive-integer"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </div>

          {/* Row 2 — remaining fields + Cancel / Save */}
          <div className="admin-cutoff-create__row admin-cutoff-create__row--2">
            <FormInputNumber
              control={form.control}
              name="ediDecClosing"
              label={reqLabel("EDI Declaration Closing")}
              size="large"
              min={1}
              max={999}
              placeholder="In hours"
              numericMode="positive-integer"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />

            <FormInputNumber
              control={form.control}
              name="fullCntrGateClosing"
              label={reqLabel("Full Container Gate-In Closing")}
              size="large"
              min={1}
              max={999}
              placeholder="In hours"
              numericMode="positive-integer"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />

            <div className="admin-cutoff-weekend">
              <FormCheckbox
                control={form.control}
                name="excludeWeekends"
                disabled={isSaving}
                formItemProps={FIELD_ITEM_PROPS}
              >
                Exclude Weekends
              </FormCheckbox>
            </div>

            <div className="admin-cutoff-create__actions form-step-footer">
              <AppButton
                danger
                htmlType="button"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </AppButton>
              <AppButton
                type="primary"
                htmlType="submit"
                loading={isSaving}
                icon={
                  <AppIcon
                    icon={isEditMode ? Icons.edit : Icons.save}
                    size={16}
                  />
                }
              >
                {isEditMode ? "Update" : "Save"}
              </AppButton>
            </div>
          </div>
        </form>

        <div className="admin-cutoff-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={cutoffConfigs}
            columnDefs={columnDefs}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="admin-cutoff-data-view"
            listOptions={{
              showToolbar: false,
              sideBar: false,
              gridOptions: {
                getRowId: (params: { data: CutoffConfig }) => params.data.id,
                overlayNoRowsTemplate: 'No cutoff configurations found.',
              },
            }}
          />
        </div>
      </div>
    </AdminPanelShell>
  );
}
