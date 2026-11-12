// Modified by Sekar Nagarajan (2026-11-12 15:40)
/**
 * Module Creation — register portal menus (RegisterMenu.jsp parity) and control their category and
 * visibility. The grid is the page; Register / Edit happen in a drawer whose fields map 1:1 onto
 * MenuConfig. Enable / Disable are immediate (Disable asks first).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@solverminds/auth";
import {
  AppButton,
  FormInput,
  FormInputNumber,
  FormSegmented,
  FormSelect,
  FormSwitch,
} from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Col, Row, Tag, Typography } from "antd";
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
import {
  ModuleEmptyState,
  buildClearFiltersAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  MENU_CATEGORY_OPTIONS,
  MENU_UPSERT_DEFAULTS,
  MENU_USER_TYPE_OPTIONS,
  MenuUpsertSchema,
  type MenuConfig,
  type MenuCreatePayload,
  type MenuUpsertValues,
} from "../types/admin.types";
import { menuRowId, nextOrder } from "../utils/admin.utils";
import { AdminDrawer } from "./shared/AdminDrawer";
import { AdminFilterPills } from "./shared/AdminFilterPills";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminLockedField } from "./shared/AdminLockedField";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill } from "./shared/AdminStatusPill";

const { Text } = Typography;

type MenuFilter = "all" | "enabled" | "disabled" | "default" | "privileged";
type MenuRow = MenuConfig & { rowId: string };
type DrawerState = { mode: "create" } | { mode: "edit"; row: MenuRow } | null;

interface ModuleCreationViewProps {
  menus: MenuConfig[];
  onCreate: (payload: MenuCreatePayload) => Promise<void>;
  onSaveAll: (menus: MenuConfig[]) => Promise<void>;
  isSaving: boolean;
  isFetching: boolean;
}

const USER_TYPE_LABEL: Record<"U" | "V", string> = { U: "User", V: "Vendor" };

function toFormValues(menu: MenuConfig): MenuUpsertValues {
  return {
    menuName: menu.menuName ?? menu.labelValue,
    refNo: menu.refNo,
    labelValue: menu.labelValue,
    orderNo: menu.orderNo,
    userType: menu.userType ?? "U",
    category: menu.category,
    isEnabled: menu.isEnabled,
    attrValue: menu.attrValue,
    classValue: menu.classValue ?? "",
    menuType: menu.menuType ?? "",
    parentMenu: menu.parentMenu ?? "ROOT",
    developedBy: menu.developedBy ?? "",
    createdBy: menu.createdBy ?? "",
  };
}

function toMenuConfig(values: MenuUpsertValues): MenuConfig {
  return {
    refNo: values.refNo.trim(),
    labelValue: values.labelValue.trim(),
    menuName: values.menuName.trim(),
    category: values.category,
    classValue: values.classValue.trim(),
    attrValue: values.attrValue.trim(),
    orderNo: values.orderNo,
    isEnabled: values.isEnabled,
    userType: values.userType,
    menuType: values.menuType.trim() || undefined,
    parentMenu: values.parentMenu.trim() || undefined,
    developedBy: values.developedBy.trim() || undefined,
    createdBy: values.createdBy.trim() || undefined,
  };
}

export function ModuleCreationView({
  menus,
  onCreate,
  onSaveAll,
  isSaving,
  isFetching,
}: ModuleCreationViewProps) {
  const confirm = useConfirm();
  const authUser = useAuthStore((s) => s.user);
  const { profileHandlers } = useLocalGridProfiles("admin-menus");
  const registerButtonRef = useRef<HTMLSpanElement>(null);
  const [filter, setFilter] = useState<MenuFilter>("all");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const rows: MenuRow[] = menus.map((m) => ({ ...m, rowId: menuRowId(m) }));
  const visibleRows = rows.filter((r) => {
    switch (filter) {
      case "enabled":
        return r.isEnabled;
      case "disabled":
        return !r.isEnabled;
      case "default":
        return r.category === "D";
      case "privileged":
        return r.category === "P";
      default:
        return true;
    }
  });

  const parentOptions = [
    { value: "ROOT", label: "ROOT (top level)" },
    ...Array.from(
      new Set(
        rows
          .filter((r) => !r.parentMenu || r.parentMenu.toUpperCase() === "ROOT")
          .map((r) => r.refNo),
      ),
    )
      .sort()
      .map((refNo) => ({ value: refNo, label: refNo })),
  ];

  const form = useForm<MenuUpsertValues>({
    resolver: zodResolver(MenuUpsertSchema) as Resolver<MenuUpsertValues>,
    defaultValues: MENU_UPSERT_DEFAULTS,
    mode: "onChange",
  });
  const isEdit = drawer?.mode === "edit";

  const openCreate = () => {
    form.reset({
      ...MENU_UPSERT_DEFAULTS,
      orderNo: nextOrder(menus),
      createdBy: authUser?.email ?? authUser?.name ?? "",
    });
    setDrawer({ mode: "create" });
  };
  const openEdit = (row: MenuRow) => {
    form.reset(toFormValues(row));
    setDrawer({ mode: "edit", row });
  };
  const closeDrawer = () => {
    setDrawer(null);
    form.reset(MENU_UPSERT_DEFAULTS);
  };

  const saveAllWith = (rowId: string, patch: Partial<MenuConfig>) =>
    onSaveAll(
      rows.map(({ rowId: id, ...menu }) => (id === rowId ? { ...menu, ...patch } : menu)),
    );

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const next = toMenuConfig(values);
      if (drawer?.mode === "edit") {
        // refNo / parentMenu / userType are the server key: keep the stored ones.
        await saveAllWith(drawer.row.rowId, {
          ...next,
          refNo: drawer.row.refNo,
          parentMenu: drawer.row.parentMenu,
          userType: drawer.row.userType,
        });
      } else {
        await onCreate(next);
      }
      closeDrawer();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  });

  const handleToggle = (row: MenuRow) => {
    if (row.isEnabled) {
      confirm.danger({
        title: "Disable Menu",
        content: `Hide ${row.menuName || row.labelValue} (${row.refNo}) from every customer sidebar?`,
        okText: "Disable",
        cancelText: "Cancel",
        onOk: () => saveAllWith(row.rowId, { isEnabled: false }),
      });
      return;
    }
    void saveAllWith(row.rowId, { isEnabled: true });
  };

  const columnDefs: DataViewColumn<MenuRow>[] = [
    {
      ...buildActionsColumn<MenuRow>({
        field: "rowId",
        width: 100,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Edit Menu"
                tone="edit"
                disabled={isSaving}
                icon={<AppIcon icon={Icons.edit} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(row);
                }}
              />
              {row.isEnabled ? (
                <ListActionButton
                  title="Disable Menu"
                  tone="reject"
                  disabled={isSaving}
                  icon={<AppIcon icon={Icons.circleX} size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(row);
                  }}
                />
              ) : (
                <ListActionButton
                  title="Enable Menu"
                  tone="approve"
                  disabled={isSaving}
                  icon={<AppIcon icon={Icons.checkCircle} size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(row);
                  }}
                />
              )}
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Status",
      field: "isEnabled",
      width: 120,
      cellRenderer: (params: { value?: boolean }) => (
        <AdminStatusPill tone={params.value ? "success" : "neutral"}>
          {params.value ? "Enabled" : "Disabled"}
        </AdminStatusPill>
      ),
      valueFormatter: (params) => (params.value ? "Enabled" : "Disabled"),
    },
    { headerName: "Order", field: "orderNo", width: 96, type: "numericColumn", sort: "asc" },
    {
      headerName: "Ref Code",
      field: "refNo",
      width: 120,
      cellRenderer: (params: { value?: string }) =>
        params.value ? <Tag className="admin-code-tag">{params.value}</Tag> : null,
    },
    {
      headerName: "Menu Name",
      colId: "menuName",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (params) => params.data?.menuName || params.data?.labelValue || "",
    },
    {
      headerName: "Label Key",
      field: "labelValue",
      flex: 1,
      minWidth: 160,
      cellRenderer: (params: { value?: string }) => <Text code>{params.value}</Text>,
    },
    {
      headerName: "Category",
      field: "category",
      width: 130,
      cellRenderer: (params: { value?: MenuConfig["category"] }) =>
        params.value ? (
          <AdminStatusPill tone={params.value === "D" ? "success" : "warning"} dot={false}>
            {params.value === "D" ? "Default" : "Privileged"}
          </AdminStatusPill>
        ) : null,
      valueFormatter: (params) => (params.value === "D" ? "Default" : "Privileged"),
    },
    {
      headerName: "User Type",
      field: "userType",
      width: 110,
      valueFormatter: (params) => USER_TYPE_LABEL[(params.value as "U" | "V") ?? "U"],
    },
    {
      headerName: "Route Target",
      field: "attrValue",
      flex: 1.2,
      minWidth: 180,
      tooltipField: "attrValue",
      cellRenderer: (params: { value?: string }) => <Text code>{params.value}</Text>,
    },
    { headerName: "Icon Class", field: "classValue", width: 140, hide: true },
    { headerName: "Parent Menu", field: "parentMenu", width: 130 },
    { headerName: "Menu Type", field: "menuType", width: 110, hide: true },
    { headerName: "Developed By", field: "developedBy", width: 150, hide: true },
    { headerName: "Created By", field: "createdBy", width: 150, hide: true },
  ];

  return (
    <AdminSectionPage
      extra={
        <span ref={registerButtonRef} className="admin-section__action">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={openCreate}
          >
            Register Menu
          </AppButton>
        </span>
      }
    >
      <div className="admin-menu-form">
        <AdminFilterPills<MenuFilter>
          ariaLabel="Filter menus"
          value={filter}
          onChange={setFilter}
          items={[
            { key: "all", label: "All", tone: "primary" },
            { key: "enabled", label: "Enabled", tone: "success" },
            { key: "disabled", label: "Disabled", tone: "neutral" },
            { key: "default", label: "Default", tone: "info" },
            { key: "privileged", label: "Privileged", tone: "warning" },
          ]}
        />

        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={visibleRows}
            columnDefs={columnDefs}
            loading={isFetching || isSaving}
            emptyState={
              filter === "all" ? (
                <ModuleEmptyState
                  variant="blank"
                  title="No menus registered yet"
                  message="Register the first portal menu to get started."
                  actions={[{ key: "register", label: "Register Menu", type: "primary", onClick: openCreate }]}
                />
              ) : (
                <ModuleEmptyState
                  variant="filtered"
                  title="No menus match this filter"
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
                getRowId: (params: { data: MenuRow }) => params.data.rowId,
              },
            }}
          />
        </div>
      </div>

      {drawer ? (
        <AdminDrawer
          open
          onClose={closeDrawer}
          icon={Icons.blocks}
          title={isEdit ? "Edit Menu" : "Register Menu"}
          subtitle={
            isEdit
              ? `${drawer.row.refNo} · ${USER_TYPE_LABEL[drawer.row.userType ?? "U"]} menu`
              : "Adds a menu entry that can then be mapped to customers."
          }
          isPending={isSaving}
          isDirty={form.formState.isDirty}
          primaryLabel={isEdit ? "Save Changes" : "Register Menu"}
          primaryIcon={isEdit ? Icons.save : Icons.plus}
          onPrimary={() => void handleSubmit()}
          returnFocusRef={registerButtonRef}
        >
          <AdminFormSection step={1} title="Identity" hint="How the menu is named and keyed.">
            <Row gutter={FIELD_GUTTER}>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="menuName"
                  label={reqLabel("Menu Name")}
                  size="large"
                  placeholder="e.g. Booking"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                {isEdit ? (
                  <AdminLockedField label="Ref No" value={drawer.row.refNo} hint="Part of the menu's key" />
                ) : (
                  <FormInput
                    control={form.control}
                    name="refNo"
                    label={reqLabel("Ref No")}
                    size="large"
                    placeholder="e.g. BKG"
                    transform="uppercase"
                    formItemProps={FIELD_ITEM_PROPS}
                  />
                )}
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="labelValue"
                  label={reqLabel("Label Key")}
                  size="large"
                  placeholder="e.g. ecom.booking"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInputNumber
                  control={form.control}
                  name="orderNo"
                  label={reqLabel("Menu Order")}
                  size="large"
                  min={1}
                  numericMode="positive-integer"
                  className="admin-stack-full"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection step={2} title="Access" hint="Who sees the menu and whether it needs mapping.">
            <Row gutter={FIELD_GUTTER}>
              <Col {...RESPONSIVE_COL.formHalf}>
                {isEdit ? (
                  <AdminLockedField
                    label="User Type"
                    value={USER_TYPE_LABEL[drawer.row.userType ?? "U"]}
                    hint="Part of the menu's key"
                  />
                ) : (
                  <FormSegmented
                    control={form.control}
                    name="userType"
                    label={reqLabel("User Type")}
                    options={MENU_USER_TYPE_OPTIONS}
                    block
                    formItemProps={FIELD_ITEM_PROPS}
                  />
                )}
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormSegmented
                  control={form.control}
                  name="category"
                  label={reqLabel("Category")}
                  options={MENU_CATEGORY_OPTIONS}
                  block
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.full}>
                <FormSwitch
                  control={form.control}
                  name="isEnabled"
                  label={optLabel("Enabled")}
                  description="Disabled menus stay registered but are hidden from every sidebar."
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection step={3} title="Routing" hint="Where the menu navigates and how it is rendered.">
            <Row gutter={FIELD_GUTTER}>
              <Col {...RESPONSIVE_COL.full}>
                <FormInput
                  control={form.control}
                  name="attrValue"
                  label={reqLabel("Route / Attr Value")}
                  size="large"
                  placeholder="e.g. /app/booking"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="classValue"
                  label={optLabel("Icon Class")}
                  size="large"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="menuType"
                  label={optLabel("Menu Type")}
                  size="large"
                  placeholder="e.g. M"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.full}>
                {isEdit ? (
                  <AdminLockedField
                    label="Parent Menu"
                    value={drawer.row.parentMenu || "ROOT"}
                    hint="Part of the menu's key"
                  />
                ) : (
                  <FormSelect
                    control={form.control}
                    name="parentMenu"
                    label={reqLabel("Parent Menu")}
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={parentOptions}
                    className="admin-stack-full"
                    formItemProps={FIELD_ITEM_PROPS}
                  />
                )}
              </Col>
            </Row>
          </AdminFormSection>

          <AdminFormSection step={4} title="Audit">
            <Row gutter={FIELD_GUTTER}>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="developedBy"
                  label={optLabel("Developed By")}
                  size="large"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="createdBy"
                  label={optLabel("Created By")}
                  size="large"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
            </Row>
          </AdminFormSection>
        </AdminDrawer>
      ) : null}
    </AdminSectionPage>
  );
}
