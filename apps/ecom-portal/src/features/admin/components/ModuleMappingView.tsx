// Modified by Sekar Nagarajan (2026-11-12 15:10)
/**
 * Module Mapping — assign privileged modules to a customer (SpecialPrivilege.jsp parity).
 * Pick the customer in a searchable select, then move modules between the two lists (checkbox +
 * transfer buttons, quick-move arrows, or drag-and-drop). Removing access asks first.
 */
import { AppButton, AppSegmented, AppSelect } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Tag, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { reqLabel } from "../../../components/shared/form-field-label";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import {
  useAddModulePrivilegesMutation,
  useModuleMappingCustomersQuery,
  useModuleMappingQuery,
  useRemoveModulePrivilegesMutation,
} from "../api/admin.queries";
import type { ModuleMappingCustomer, ModuleMappingMenu } from "../types/admin.types";
import { errorMessage, menuDisplayName } from "../utils/admin.utils";
import { ModuleMappingBoard, type MappingVisibleColumn } from "./module-mapping-board";
import { AdminLoadingCenter } from "./shared/admin-loading-center";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill } from "./shared/AdminStatusPill";

const { Text } = Typography;

const CUSTOMER_SELECT_ID = "admin-mapping-customer";

const customerKey = (c: Pick<ModuleMappingCustomer, "custCode" | "webId">) =>
  `${c.custCode}|${c.webId}`;

export function ModuleMappingView() {
  const confirm = useConfirm();
  const titles = useModuleTitles();
  const { isMobileTier } = useResponsiveLayout();
  const [selectedCustomer, setSelectedCustomer] = useState<ModuleMappingCustomer | null>(null);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>([]);
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<string[]>([]);
  const [mobilePane, setMobilePane] = useState<MappingVisibleColumn>("available");

  const customersQuery = useModuleMappingCustomersQuery();
  const mappingQuery = useModuleMappingQuery(selectedCustomer);
  const addMutation = useAddModulePrivilegesMutation(selectedCustomer);
  const removeMutation = useRemoveModulePrivilegesMutation(selectedCustomer);

  const customers = customersQuery.data ?? [];
  const menus = mappingQuery.data ?? [];
  const availableMenus = menus.filter((m) => m.category === "P");
  const defaultMenus = menus.filter((m) => m.category === "D");
  const assignedMenus = menus.filter((m) => m.category === "NP");

  const displayName = (menu: ModuleMappingMenu) => menuDisplayName(menu, titles);

  const clearSelection = () => {
    setSelectedAvailableIds([]);
    setSelectedAssignedIds([]);
  };

  const handleSelectCustomer = (key: string | undefined) => {
    const next = key ? customers.find((c) => customerKey(c) === key) ?? null : null;
    setSelectedCustomer(next);
    clearSelection();
  };

  const toggleId = (id: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  };

  const runAdd = async (menuIds: string[]) => {
    if (!selectedCustomer || menuIds.length === 0) return;
    try {
      await addMutation.mutateAsync(menuIds);
      clearSelection();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  };

  const runRemove = (menuIds: string[]) => {
    if (!selectedCustomer || menuIds.length === 0) return;
    const names = menus
      .filter((m) => menuIds.includes(m.menuId))
      .map(displayName);
    const what = names.length === 1 ? names[0] : `${names.length} modules`;
    confirm.danger({
      title: "Remove Module Access",
      content: `Remove ${what} from ${selectedCustomer.compName}? Their users lose access immediately.`,
      okText: "Remove",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMutation.mutateAsync(menuIds);
          clearSelection();
        } catch {
          /* surfaced by the mutation's onError toast */
        }
      },
    });
  };

  const customerOptions = customers.map((c) => ({
    value: customerKey(c),
    label: `${c.compName} (${c.custCode})`,
    compName: c.compName,
    custCode: c.custCode,
    webId: c.webId,
  }));

  return (
    <AdminSectionPage
      extra={
        selectedCustomer ? (
          <AppButton
            icon={<AppIcon icon={Icons.x} size={16} />}
            onClick={() => handleSelectCustomer(undefined)}
          >
            Clear Selection
          </AppButton>
        ) : undefined
      }
    >
      <div className="admin-mapping-form">
        <div className="admin-mapping-customer">
          <label className="form-field-label" htmlFor={CUSTOMER_SELECT_ID}>
            {reqLabel("Customer")}
          </label>
          <AppSelect
            id={CUSTOMER_SELECT_ID}
            size="large"
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Search by company name, customer code or web ID"
            loading={customersQuery.isLoading}
            value={selectedCustomer ? customerKey(selectedCustomer) : undefined}
            onChange={(value) => handleSelectCustomer(value ? String(value) : undefined)}
            options={customerOptions}
            filterOption={(input, option) => {
              const q = input.toLowerCase();
              const o = option as (typeof customerOptions)[number] | undefined;
              return Boolean(
                o &&
                  (o.compName.toLowerCase().includes(q) ||
                    o.custCode.toLowerCase().includes(q) ||
                    o.webId.toLowerCase().includes(q)),
              );
            }}
            optionRender={(option) => {
              const o = option.data as (typeof customerOptions)[number];
              return (
                <span className="admin-mapping-option">
                  <span className="admin-mapping-option__name">{o.compName}</span>
                  <Text type="secondary" className="admin-mapping-option__meta">
                    {o.custCode} · {o.webId}
                  </Text>
                </span>
              );
            }}
            prefix={<AppIcon icon={Icons.building} size={16} />}
            className="admin-stack-full"
          />
          {customersQuery.isError ? (
            <Text type="danger" className="form-field-error">
              {errorMessage(customersQuery.error, "Couldn't load customers.")}{" "}
              <AppButton type="link" size="small" onClick={() => void customersQuery.refetch()}>
                Try again
              </AppButton>
            </Text>
          ) : null}

          {selectedCustomer ? (
            <div className="admin-mapping-customer__meta">
              <Tag className="admin-code-tag">{selectedCustomer.custCode}</Tag>
              <Text strong>{selectedCustomer.compName}</Text>
              <Text type="secondary">Web ID: {selectedCustomer.webId}</Text>
              {!mappingQuery.isLoading && !mappingQuery.isError ? (
                <span className="admin-mapping-summary">
                  <AdminStatusPill tone="neutral">{availableMenus.length} available</AdminStatusPill>
                  <AdminStatusPill tone="success">{defaultMenus.length} default</AdminStatusPill>
                  <AdminStatusPill tone="processing">{assignedMenus.length} assigned</AdminStatusPill>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {!selectedCustomer ? (
          <div className="admin-mapping-empty">
            <ModuleEmptyState
              variant="blank"
              title="Select a customer to map modules"
              message="Default modules are always on; privileged modules are added per customer."
              artSize="md"
            />
          </div>
        ) : mappingQuery.isLoading ? (
          <AdminLoadingCenter />
        ) : mappingQuery.isError ? (
          <ModuleEmptyState
            variant="error"
            title="Couldn't load this customer's modules"
            message={errorMessage(mappingQuery.error, "The server did not return the module mapping.")}
            actions={[buildRetryAction(() => void mappingQuery.refetch())]}
          />
        ) : (
          <>
            {isMobileTier ? (
              <AppSegmented<MappingVisibleColumn>
                value={mobilePane}
                onChange={(value) => setMobilePane(value)}
                block
                options={[
                  { value: "available", label: `Available (${availableMenus.length})` },
                  { value: "assigned", label: `Customer Access (${defaultMenus.length + assignedMenus.length})` },
                ]}
                aria-label="Board column"
              />
            ) : null}
            <ModuleMappingBoard
              availableMenus={availableMenus}
              defaultMenus={defaultMenus}
              assignedMenus={assignedMenus}
              selectedAvailableIds={selectedAvailableIds}
              selectedAssignedIds={selectedAssignedIds}
              onToggleAvailable={(id) => toggleId(id, selectedAvailableIds, setSelectedAvailableIds)}
              onToggleAssigned={(id) => toggleId(id, selectedAssignedIds, setSelectedAssignedIds)}
              onAddSelected={() => void runAdd(selectedAvailableIds)}
              onRemoveSelected={() => runRemove(selectedAssignedIds)}
              onQuickAdd={(id) => void runAdd([id])}
              onQuickRemove={(id) => runRemove([id])}
              onDropToAssigned={(ids) => void runAdd(ids)}
              onDropToAvailable={(ids) => runRemove(ids)}
              displayName={displayName}
              isAdding={addMutation.isPending}
              isRemoving={removeMutation.isPending}
              visibleColumn={isMobileTier ? mobilePane : "both"}
            />
          </>
        )}
      </div>
    </AdminSectionPage>
  );
}
