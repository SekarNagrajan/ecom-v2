// Modified by Sekar Nagarajan (2026-11-12 14:10)
/**
 * Customer Advisories — operational notices in a DataView grid with a publish drawer (severity,
 * headline, message, validity window) and a read-only detail drawer.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormDatePicker,
  FormInput,
  FormSegmented,
  FormTextarea,
  FormattedDate,
} from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Descriptions, Typography } from "antd";
import { DateTime } from "luxon";
import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  FIELD_ITEM_PROPS,
  optLabel,
  reqLabel,
} from "../../../components/shared/form-field-label";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildClearFiltersAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useAiTextAssist } from "../../ai-assist";
import {
  ADVISORY_SEVERITY_OPTIONS,
  AdvisoryUpsertSchema,
  type AdvisorySeverity,
  type AdvisoryUpsertValues,
  type CustomerAdvisory,
} from "../types/admin.types";
import { advisoryStatus, todayIsoDate, type AdvisoryStatus } from "../utils/admin.utils";
import { AdminDrawer } from "./shared/AdminDrawer";
import { AdminFilterPills } from "./shared/AdminFilterPills";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill, type AdminPillTone } from "./shared/AdminStatusPill";

const { Text, Paragraph } = Typography;

type AdvisoryFilter = "all" | "active" | "scheduled" | "expired" | "urgent";

const STATUS_META: Record<AdvisoryStatus, { label: string; tone: AdminPillTone }> = {
  active: { label: "Active", tone: "success" },
  scheduled: { label: "Scheduled", tone: "processing" },
  expired: { label: "Expired", tone: "neutral" },
  inactive: { label: "Inactive", tone: "neutral" },
};

const SEVERITY_META: Record<
  AdvisorySeverity,
  { label: string; tone: AdminPillTone; icon: typeof Icons.info }
> = {
  INFO: { label: "Info", tone: "info", icon: Icons.info },
  WARNING: { label: "Warning", tone: "warning", icon: Icons.alertTriangle },
  URGENT: { label: "Urgent", tone: "error", icon: Icons.megaphone },
};

interface CustomerAdvisoryViewProps {
  advisories: CustomerAdvisory[];
  onCreate: (advisory: Omit<CustomerAdvisory, "id">) => Promise<CustomerAdvisory>;
  isCreating: boolean;
  isFetching: boolean;
}

function SeverityPill({ severity }: { severity: AdvisorySeverity }) {
  const meta = SEVERITY_META[severity];
  return (
    <AdminStatusPill tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </AdminStatusPill>
  );
}

export function CustomerAdvisoryView({
  advisories,
  onCreate,
  isCreating,
  isFetching,
}: CustomerAdvisoryViewProps) {
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("admin-advisories");
  const { textareaAssistProps } = useAiTextAssist();
  const publishButtonRef = useRef<HTMLSpanElement>(null);
  const [filter, setFilter] = useState<AdvisoryFilter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<CustomerAdvisory | null>(null);

  const today = todayIsoDate();
  const withStatus = advisories.map((a) => ({ ...a, status: advisoryStatus(a, today) }));
  const counts = {
    active: withStatus.filter((a) => a.status === "active").length,
    scheduled: withStatus.filter((a) => a.status === "scheduled").length,
    expired: withStatus.filter((a) => a.status === "expired").length,
    urgent: withStatus.filter((a) => a.severity === "URGENT").length,
  };
  const rows = withStatus.filter((a) => {
    if (filter === "all") return true;
    if (filter === "urgent") return a.severity === "URGENT";
    return a.status === filter;
  });

  const defaults = (): AdvisoryUpsertValues => ({
    severity: "WARNING",
    title: "",
    message: "",
    effectiveFrom: today,
    effectiveTo: "",
  });

  const form = useForm<AdvisoryUpsertValues>({
    resolver: zodResolver(AdvisoryUpsertSchema) as Resolver<AdvisoryUpsertValues>,
    defaultValues: defaults(),
    mode: "onChange",
  });
  const effectiveFrom = form.watch("effectiveFrom");

  const openDrawer = () => {
    form.reset(defaults());
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    form.reset(defaults());
  };

  const publish = async (values: AdvisoryUpsertValues) => {
    try {
      await onCreate({
        title: values.title,
        message: values.message,
        severity: values.severity,
        effectiveFrom: values.effectiveFrom,
        effectiveTo: values.effectiveTo || "",
        isActive: true,
      });
      closeDrawer();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  };

  const handlePublish = form.handleSubmit((values) => {
    if (values.severity === "URGENT") {
      confirm.show({
        title: "Publish Urgent Advisory",
        content: "Urgent advisories are shown prominently to every customer. Publish now?",
        okText: "Publish",
        cancelText: "Cancel",
        onOk: () => publish(values),
      });
      return;
    }
    return publish(values);
  });

  type Row = CustomerAdvisory & { status: AdvisoryStatus };
  const columnDefs: DataViewColumn<Row>[] = [
    {
      ...buildActionsColumn<Row>({
        field: "id",
        width: 72,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title="View Details"
                tone="view"
                icon={<AppIcon icon={Icons.eye} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewing(row);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Status",
      field: "status",
      width: 130,
      cellRenderer: (params: { value?: AdvisoryStatus }) =>
        params.value ? (
          <AdminStatusPill tone={STATUS_META[params.value].tone}>
            {STATUS_META[params.value].label}
          </AdminStatusPill>
        ) : null,
      valueFormatter: (params) => (params.value ? STATUS_META[params.value as AdvisoryStatus].label : ""),
    },
    {
      headerName: "Severity",
      field: "severity",
      width: 130,
      cellRenderer: (params: { value?: AdvisorySeverity }) =>
        params.value ? <SeverityPill severity={params.value} /> : null,
      valueFormatter: (params) => (params.value ? SEVERITY_META[params.value as AdvisorySeverity].label : ""),
    },
    {
      headerName: "Headline",
      field: "title",
      flex: 1.3,
      minWidth: 200,
      cellRenderer: (params: { value?: string }) => <Text strong>{params.value}</Text>,
    },
    {
      headerName: "Message",
      field: "message",
      flex: 2,
      minWidth: 240,
      tooltipField: "message",
    },
    {
      headerName: "Effective From",
      field: "effectiveFrom",
      width: 150,
      cellRenderer: (params: { value?: string }) => <FormattedDate value={params.value || null} />,
    },
    {
      headerName: "Effective To",
      field: "effectiveTo",
      width: 150,
      cellRenderer: (params: { value?: string }) => (
        <FormattedDate value={params.value || null} fallback={<Text type="secondary">Open-ended</Text>} />
      ),
    },
  ];

  return (
    <AdminSectionPage
      recordCount={advisories.length}
      extra={
        <span ref={publishButtonRef} className="admin-section__action">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={openDrawer}
          >
            Publish Advisory
          </AppButton>
        </span>
      }
    >
      <div className="admin-advisory-form">
        <AdminFilterPills<AdvisoryFilter>
          ariaLabel="Filter advisories"
          value={filter}
          onChange={setFilter}
          items={[
            { key: "all", label: "All", count: advisories.length, tone: "primary" },
            { key: "active", label: "Active", count: counts.active, tone: "success" },
            { key: "scheduled", label: "Scheduled", count: counts.scheduled, tone: "info" },
            { key: "expired", label: "Expired", count: counts.expired, tone: "neutral" },
            { key: "urgent", label: "Urgent", count: counts.urgent, tone: "error" },
          ]}
        />

        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columnDefs}
            loading={isFetching}
            emptyState={
              filter === "all" ? (
                <ModuleEmptyState
                  variant="blank"
                  title="No advisories published"
                  message="Publish an operational advisory to inform customers."
                  actions={[{ key: "publish", label: "Publish Advisory", type: "primary", onClick: openDrawer }]}
                />
              ) : (
                <ModuleEmptyState
                  variant="filtered"
                  title="No advisories match this filter"
                  actions={[buildClearFiltersAction(() => setFilter("all"))]}
                />
              )
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
                getRowId: (params: { data: Row }) => params.data.id,
              },
            }}
          />
        </div>
      </div>

      {drawerOpen ? (
        <AdminDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          icon={Icons.megaphone}
          title="Publish Advisory"
          subtitle="Shown to customers on the portal while it is in effect."
          isPending={isCreating}
          isDirty={form.formState.isDirty}
          primaryLabel="Publish Advisory"
          primaryIcon={Icons.send}
          onPrimary={() => void handlePublish()}
          returnFocusRef={publishButtonRef}
        >
          <AdminFormSection step={1} title="Classification" hint="How prominently the notice is shown.">
            <FormSegmented
              control={form.control}
              name="severity"
              label={reqLabel("Severity")}
              options={ADVISORY_SEVERITY_OPTIONS}
              block
              formItemProps={FIELD_ITEM_PROPS}
              aria-label="Severity"
            />
          </AdminFormSection>

          <AdminFormSection step={2} title="Content" hint="Keep the headline short; details go in the message.">
            <FormInput
              control={form.control}
              name="title"
              label={reqLabel("Headline")}
              size="large"
              maxLength={120}
              showCount
              placeholder="e.g. Typhoon delay at Shanghai"
              formItemProps={FIELD_ITEM_PROPS}
            />
            <FormTextarea
              control={form.control}
              name="message"
              label={reqLabel("Message")}
              rows={5}
              maxLength={1000}
              showCount
              className="custom-scroll"
              formItemProps={FIELD_ITEM_PROPS}
              {...textareaAssistProps}
            />
          </AdminFormSection>

          <AdminFormSection step={3} title="Validity" hint="Leave the end date empty for an open-ended advisory.">
            <FormDatePicker
              control={form.control}
              name="effectiveFrom"
              label={reqLabel("Effective From")}
              size="large"
              valueFormat="calendar-date"
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />
            <FormDatePicker
              control={form.control}
              name="effectiveTo"
              label={optLabel("Effective To")}
              size="large"
              valueFormat="calendar-date"
              minDate={effectiveFrom ? DateTime.fromISO(effectiveFrom) : undefined}
              className="admin-stack-full"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </AdminFormSection>
        </AdminDrawer>
      ) : null}

      {viewing ? (
        <AdminDrawer
          open={viewing !== null}
          onClose={() => setViewing(null)}
          icon={SEVERITY_META[viewing.severity].icon}
          title={viewing.title}
          subtitle={
            <span className="admin-drawer-title__pills">
              <SeverityPill severity={viewing.severity} />
              <AdminStatusPill tone={STATUS_META[advisoryStatus(viewing, today)].tone}>
                {STATUS_META[advisoryStatus(viewing, today)].label}
              </AdminStatusPill>
            </span>
          }
          dialogSize="sm"
          cancelLabel="Close"
        >
          <AdminFormSection title="Details">
            <Descriptions column={1} size="small" colon={false} className="admin-descriptions">
              <Descriptions.Item label="Effective From">
                <FormattedDate value={viewing.effectiveFrom || null} />
              </Descriptions.Item>
              <Descriptions.Item label="Effective To">
                <FormattedDate value={viewing.effectiveTo || null} fallback="Open-ended" />
              </Descriptions.Item>
            </Descriptions>
            <Paragraph className="admin-prewrap">{viewing.message}</Paragraph>
          </AdminFormSection>
        </AdminDrawer>
      ) : null}
    </AdminSectionPage>
  );
}
