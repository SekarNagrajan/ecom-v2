// Modified by Sekar Nagarajan (2026-11-11 15:10)
import { AppButton } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Space, Tag, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import {
  useDeleteSubUserMutation,
  useResendInviteMutation,
  useSubUsersQuery,
  useToggleSubUserStatusMutation,
  useUserLimitQuery,
} from "../api/user-creation.queries";
import type { SubUser } from "../types/user-creation.types";
import { EMPTY_USER_LIMIT } from "../types/user-creation.types";
import {
  filterSubUsersByStatus,
  getSubUserFullName,
  type UscStatusFilter,
} from "../utils/usc.utils";
import { UscStatusFilterBar } from "./UscStatusFilterBar";
import { UscUpsertDrawer } from "./upsert/UscUpsertDrawer";
import { UscLoadingCenter } from "./usc-loading-center";

export function UserCreationListing() {
  const MODULE_TITLES = useModuleTitles();
  const toast = useToast();
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("user-creation");
  const [statusFilter, setStatusFilter] = useState<UscStatusFilter>("all");
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);

  const {
    data: subUsers = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSubUsersQuery();
  const { data: limitInfo = EMPTY_USER_LIMIT } = useUserLimitQuery();
  const { mutate: toggleStatus } = useToggleSubUserStatusMutation();
  const { mutate: deleteSubUser } = useDeleteSubUserMutation();
  const { mutate: resendInvite } = useResendInviteMutation();

  const filteredUsers = filterSubUsersByStatus(subUsers, statusFilter);
  const limitToastShown = useRef(false);

  useEffect(() => {
    if (!limitInfo.limitReached) {
      limitToastShown.current = false;
      return;
    }
    if (limitToastShown.current) return;
    limitToastShown.current = true;
    toast.warning(
      "Your user profile quota is full. Contact a system admin to expand allowed users.",
      { title: "Creation limit reached" },
    );
  }, [limitInfo.limitReached, toast]);

  const openCreate = () => {
    if (limitInfo.limitReached) {
      toast.warning(
        "Your user profile quota is full. Contact a system admin to expand allowed users.",
        { title: "Creation limit reached" },
      );
      return;
    }
    setEditingUser(null);
    setDrawerMode("create");
  };

  const openEdit = (user: SubUser) => {
    setEditingUser(user);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingUser(null);
  };

  const handleToggleStatus = (record: SubUser, active: boolean) => {
    if (!active) {
      confirm.danger({
        title: "Disable account",
        content: `Disable ${record.loginName}? They will lose portal access until re-enabled.`,
        okText: "Disable",
        cancelText: "Cancel",
        onOk: () => toggleStatus({ id: record.id, active: false }),
      });
      return;
    }
    toggleStatus({ id: record.id, active: true });
  };

  const handleDelete = (record: SubUser) => {
    confirm.danger({
      title: "Delete sub-user",
      content: `Permanently remove ${record.loginName}? This cannot be undone.`,
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => deleteSubUser(record.id),
    });
  };

  const handleResendInvite = (record: SubUser) => {
    confirm.show({
      title: "Resend invitation",
      content: `Send a new invitation email to ${record.email}?`,
      okText: "Resend",
      cancelText: "Cancel",
      onOk: () => resendInvite(record.id),
    });
  };

  const columns: DataViewColumn<SubUser>[] = [
    {
      ...buildActionsColumn<SubUser>({
        field: "id",
        width: 148,
        cellRenderer: (params) => {
          if (!params.data) return null;
          const record = params.data;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Edit"
                tone="edit"
                icon={<AppIcon icon={Icons.edit} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(record);
                }}
              />
              <ListActionButton
                title={record.isActive ? "Disable account" : "Enable account"}
                tone={record.isActive ? "reject" : "approve"}
                icon={
                  <AppIcon
                    icon={record.isActive ? Icons.circleX : Icons.checkCircle}
                    size={16} tone={record.isActive ? "delete" : "create"}
                  />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(record, !record.isActive);
                }}
              />
              {record.inviteStatus === "PENDING" ? (
                <ListActionButton
                  title="Resend invite"
                  tone="navigate"
                  icon={<AppIcon icon={Icons.send} size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResendInvite(record);
                  }}
                />
              ) : null}
              <ListActionButton
                title="Delete"
                danger
                icon={<AppIcon icon={Icons.trash} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Login Username",
      field: "loginName",
      sortable: true,
      minWidth: 160,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <span className="usc-login-cell">
            
            {record.loginName}
          </span>
        );
      },
    },
    {
      headerName: "Full Name",
      field: "firstName",
      sortable: true,
      valueGetter: (params: { data?: SubUser }) =>
        params.data ? getSubUserFullName(params.data) : "",
    },
    {
      headerName: "Email Address",
      field: "email",
      sortable: true,
      minWidth: 180,
    },
    {
      headerName: "Company Name",
      field: "companyName",
      sortable: true,
    },
    {
      headerName: "Contact Phone",
      field: "custPhoneNo",
      sortable: true,
    },
    {
      headerName: "Modules",
      field: "allowedModules",
      sortable: false,
      minWidth: 160,
      cellRenderer: (params: { data?: SubUser }) => {
        const mods = params.data?.allowedModules || [];
        return (
          <Space wrap size={[4, 4]}>
            {mods.map((m) => (
              <Tag className="usc-module-tag" key={m}>
                {m}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      headerName: "Invite",
      field: "inviteStatus",
      sortable: true,
      width: 110,
      cellRenderer: (params: { data?: SubUser }) => {
        const status = params.data?.inviteStatus ?? "NONE";
        if (status === "NONE") {
          return (
            <span>-</span>
          );
        }
        return (
          <span
            className={[
              "",
              status === "ACCEPTED" ? "usc-invite-pill--accepted" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {status === "PENDING" ? "Pending" : "Accepted"}
          </span>
        );
      },
    },
    {
      headerName: "Status",
      field: "isActive",
      sortable: true,
      width: 120,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <span
            className={[
              "usc-status-pill",
              record.isActive
                ? "usc-status-pill--active"
                : "usc-status-pill--disabled",
            ].join(" ")}
          >
            <span  aria-hidden />
            {record.isActive ? "Active" : "Disabled"}
          </span>
        );
      },
    },
  ];

  const showLoading = isLoading && subUsers.length === 0;
  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title="Couldn't load sub-users"
      message="The request didn't complete. Check your connection and try again."
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant={statusFilter === "all" ? "blank" : "filtered"}
      title={
        statusFilter === "all"
          ? "No sub-users yet"
          : "No sub-users in this status"
      }
      message={
        statusFilter === "all"
          ? "Add a sub-user to grant an employee or delegate access."
          : "Try another status filter or clear it to see all sub-users."
      }
    />
  );

  return (
    <div className="usc-page-layout">
      <div className="usc-page-header">
        <ModuleScreenHeader
          icon={NavIcons.userCreation}
          title={MODULE_TITLES.userCreation}
         
          subtitle="Create and manage sub-user credentials for company employees, agents, and delegates."
          marginBottom={0}
          extra={
            <Tooltip
              title={
                limitInfo.limitReached
                  ? "User profile limit reached"
                  : "Add Sub-User"
              }
            >
              <AppButton
                type="primary"
                size="medium"
                icon={<AppIcon icon={Icons.userPlus} size={16} tone="create" />}
                onClick={openCreate}
              >
                Add Sub-User
              </AppButton>
            </Tooltip>
          }
        />
      </div>

      <UscStatusFilterBar
        users={subUsers}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {showLoading ? (
        <UscLoadingCenter fill />
      ) : isError && subUsers.length === 0 ? (
        emptyState
      ) : (
        <div className="usc-grid-wrap responsive-table-wrap custom-scroll">
          <div className="usc-table-card">
            <DataView
              columnDefs={columns}
              rowData={filteredUsers}
              loading={isFetching}
              emptyState={emptyState}
              allowedViewModes={["list"]}
              defaultViewMode="list"
              renderToolbar={() => null}
              className="usc-data-view"
              listOptions={{
                ...profileHandlers,
                showToolbar: { showTotalCount: true, fullScreen: true },
                sideBar: true,
                pagination: true,
                paginationPageSize: 20,
                pageSizeOptions: [10, 20, 50, 100],
                defaultColDef: { filter: true },
                gridOptions: {
                  getRowId: (params: { data: SubUser }) => params.data.id,
                },
              }}
            />
          </div>
        </div>
      )}

      {drawerMode ? (
        <UscUpsertDrawer
          open
          mode={drawerMode}
          editingUser={editingUser}
          limitReached={limitInfo.limitReached}
          onClose={closeDrawer}
          onLimitBlocked={() =>
            toast.warning(
              "Your user profile quota is full. Contact a system admin to expand allowed users.",
              { title: "Creation limit reached" },
            )
          }
        />
      ) : null}
    </div>
  );
}
