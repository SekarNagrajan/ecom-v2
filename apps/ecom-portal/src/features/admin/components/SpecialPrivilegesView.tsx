// Modified by Sekar Nagarajan (2026-08-27 12:56)
/**
 * Module Mapping — SpecialPrivilege.jsp parity with friendlier dual-list + drag-drop UX.
 */
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Alert, Empty, Input, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useModuleMappingController } from "../hooks/use-admin-controller";
import type { ModuleMappingCustomer } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";
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
  const [statusMessage, setStatusMessage] = useState<{
    type: "add" | "remove";
    text: string;
  } | null>(null);

  const {
    menus,
    isLoadingMenus,
    customers,
    isLoadingCustomers,
    addPrivileges,
    removePrivileges,
    isAdding,
    isRemoving,
  } = useModuleMappingController(selectedCustomer);

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
    setStatusMessage(null);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const handleReset = () => {
    setSelectedCustomer(null);
    clearSelection();
    setStatusMessage(null);
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
      await addPrivileges(menuIds);
      clearSelection();

      toast.success(
        menuIds.length === 1
          ? "Module assigned to customer"
          : `${menuIds.length} modules assigned`,
      );
    } catch {
      toast.error("Failed to add privileges");
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
      await removePrivileges(menuIds);
      clearSelection();

      toast.success(
        menuIds.length === 1
          ? "Module removed from customer"
          : `${menuIds.length} modules removed`,
      );
    } catch {
      toast.error("Failed to remove privileges");
    }
  };

  return (
    <AdminPanelShell
      icon={Icons.key}
      title="Module Mapping"
      subtitle="Assign privileged modules to a customer — drag between lists, or select and transfer."
    >
      <div className="admin-mapping-form">
        {statusMessage ? (
          <Alert
            type="success"
            showIcon
            closable
            className="admin-mapping-alert"
            message="Success!"
            description={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        ) : null}

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
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select a customer to map modules"
            >
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.search} size={16} />}
                onClick={() => setSearchOpen(true)}
              >
                Search Customer
              </AppButton>
            </Empty>
          </div>
        ) : isLoadingMenus ? (
          <div
            className="admin-loading-center"
            role="status"
            aria-label="Loading"
          >
            <Spin size="medium" />
          </div>
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
            <div
              className="admin-loading-center"
              role="status"
              aria-label="Loading"
            >
              <Spin size="medium" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <Empty description="No customers found" />
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
    </AdminPanelShell>
  );
}
