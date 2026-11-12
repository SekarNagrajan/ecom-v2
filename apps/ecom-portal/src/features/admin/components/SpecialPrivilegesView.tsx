// Modified by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Module Mapping — SpecialPrivilege.jsp parity with friendlier dual-list + drag-drop UX.
 */
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Input, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import {
  useAddModulePrivilegesMutation,
  useModuleMappingCustomersQuery,
  useModuleMappingQuery,
  useRemoveModulePrivilegesMutation,
} from "../api/admin.queries";
import type { ModuleMappingCustomer } from "../types/admin.types";
import { AdminLoadingCenter } from "./shared/admin-loading-center";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { ModuleMappingBoard } from "./module-mapping-board";

const { Text, Title } = Typography;

export function SpecialPrivilegesView() {
  const toast = useToast();
  const [selectedCustomer, setSelectedCustomer] =
    useState<ModuleMappingCustomer | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>(
    [],
  );
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<string[]>([]);

  const customersQuery = useModuleMappingCustomersQuery();
  const mappingQuery = useModuleMappingQuery(selectedCustomer);
  const addMutation = useAddModulePrivilegesMutation(selectedCustomer);
  const removeMutation = useRemoveModulePrivilegesMutation(selectedCustomer);

  const menus = mappingQuery.data ?? [];
  const isLoadingMenus = mappingQuery.isLoading;
  const customers = customersQuery.data ?? [];
  const isLoadingCustomers = customersQuery.isLoading;
  const isAdding = addMutation.isPending;
  const isRemoving = removeMutation.isPending;

  const availableMenus = menus.filter((m) => m.category === "P");
  const defaultMenus = menus.filter((m) => m.category === "D");
  const assignedMenus = menus.filter((m) => m.category === "NP");

  const filteredCustomers = customers.filter(
    (c) =>
      c.custCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.compName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.webId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clearSelection = () => {
    setSelectedAvailableIds([]);
    setSelectedAssignedIds([]);
  };

  const handleSelectCustomer = (customer: ModuleMappingCustomer) => {
    setSelectedCustomer(customer);
    clearSelection();
    setSearchOpen(false);
    setSearchTerm("");
  };

  const handleReset = () => {
    setSelectedCustomer(null);
    clearSelection();
  };

  const toggleId = (
    id: string,
    list: string[],
    setList: (next: string[]) => void,
  ) => {
    setList(
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    );
  };

  const runAdd = async (menuIds: string[]) => {
    if (!selectedCustomer) {
      toast.error("Select Customer");
      return;
    }
    if (menuIds.length === 0) {
      toast.error("Select Any Privilege Menu to Add");
      return;
    }
    try {
      await addMutation.mutateAsync(menuIds);
      clearSelection();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  };

  const runRemove = async (menuIds: string[]) => {
    if (!selectedCustomer) {
      toast.error("Select Customer");
      return;
    }
    if (menuIds.length === 0) {
      toast.error("Select Any Privilege Menu to Remove");
      return;
    }
    try {
      await removeMutation.mutateAsync(menuIds);
      clearSelection();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  };

  return (
    <AdminSectionPage>
      <div className="admin-mapping-form">
        <div className="admin-mapping-customer">
          <label className="form-field-label" htmlFor="mapping-customer">
            Select Customer <Text type="danger">*</Text>
          </label>
          <div className="admin-mapping-customer__row">
            <Input
              id="mapping-customer"
              size="large"
              readOnly
              value={
                selectedCustomer
                  ? `${selectedCustomer.custCode} ~~ ${selectedCustomer.compName}`
                  : ""
              }
              placeholder="Search and select a customer"
              prefix={<AppIcon icon={Icons.building} size={16} />}
            />
            <Tooltip title="Search Customer">
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.search} size={16} />}
                onClick={() => setSearchOpen(true)}
                aria-label="Search customer"
              >
                Search
              </AppButton>
            </Tooltip>
            <Tooltip title="Clear Selection">
              <AppButton
                icon={<AppIcon icon={Icons.refreshCw} size={16} />}
                onClick={handleReset}
                aria-label="Reset"
              >
                Reset
              </AppButton>
            </Tooltip>
          </div>

          {selectedCustomer ? (
            <div className="admin-mapping-customer__meta">
              <Tag color="blue" className="admin-status-tag">
                {selectedCustomer.custCode}
              </Tag>
              <Text>{selectedCustomer.compName}</Text>
              <Text type="secondary">Web ID: {selectedCustomer.webId}</Text>
              <span className="admin-mapping-summary">
                <Tag className="admin-status-tag">
                  {availableMenus.length} available
                </Tag>
                <Tag className="admin-status-tag" color="success">
                  {defaultMenus.length} default
                </Tag>
                <Tag className="admin-status-tag" color="processing">
                  {assignedMenus.length} assigned
                </Tag>
              </span>
            </div>
          ) : null}
        </div>

        {!selectedCustomer ? (
          <div className="admin-mapping-empty">
            <ModuleEmptyState
              variant="blank"
              title="Select a customer to map modules"
              actions={[
                {
                  key: "search-customer",
                  label: "Search Customer",
                  type: "primary",
                  icon: <AppIcon icon={Icons.search} size={16} />,
                  onClick: () => setSearchOpen(true),
                },
              ]}
              artSize="md"
            />
          </div>
        ) : isLoadingMenus ? (
          <AdminLoadingCenter />
        ) : (
          <>
            <ModuleMappingBoard
              availableMenus={availableMenus}
              defaultMenus={defaultMenus}
              assignedMenus={assignedMenus}
              selectedAvailableIds={selectedAvailableIds}
              selectedAssignedIds={selectedAssignedIds}
              onToggleAvailable={(id) =>
                toggleId(id, selectedAvailableIds, setSelectedAvailableIds)
              }
              onToggleAssigned={(id) =>
                toggleId(id, selectedAssignedIds, setSelectedAssignedIds)
              }
              onAddSelected={() => runAdd(selectedAvailableIds)}
              onRemoveSelected={() => runRemove(selectedAssignedIds)}
              onQuickAdd={(id) => runAdd([id])}
              onQuickRemove={(id) => runRemove([id])}
              onDropToAssigned={(ids) => runAdd(ids)}
              onDropToAvailable={(ids) => runRemove(ids)}
              isAdding={isAdding}
              isRemoving={isRemoving}
            />
          </>
        )}
      </div>

      <AppModal
        title="Customer Search"
        open={searchOpen}
        onCancel={() => setSearchOpen(false)}
        footer={null}
        dialogSize="md"
      >
        <Input
          size="large"
          allowClear
          autoFocus
          prefix={<AppIcon icon={Icons.search} size={16} />}
          placeholder="Search by customer code or company name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-mapping-search-input"
        />
        <div className="admin-mapping-search-list custom-scroll">
          {isLoadingCustomers ? (
            <AdminLoadingCenter />
          ) : filteredCustomers.length === 0 ? (
            <ModuleEmptyState
              variant="filtered"
              title="No customers found"
              message="Try a different customer code or company name."
              artSize="sm"
            />
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={`${customer.custCode}-${customer.webId}`}
                type="button"
                className="admin-mapping-search-item"
                onClick={() => handleSelectCustomer(customer)}
              >
                <AppIcon icon={Icons.building} size={18} />
                <span>
                  <Title level={5} className="admin-mapping-search-item__title">
                    {customer.compName}
                  </Title>
                  <Text type="secondary">
                    {customer.custCode} · {customer.webId}
                  </Text>
                </span>
                <AppIcon icon={Icons.chevronRight} size={16} />
              </button>
            ))
          )}
        </div>
      </AppModal>
    </AdminSectionPage>
  );
}
