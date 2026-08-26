// Created by Sekar Nagarajan (2026-08-26 15:06)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Switch,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  useSubUsersQuery,
  useToggleSubUserStatusMutation,
  useUserLimitQuery,
} from "../api/user-creation.queries";
import type { SubUser } from "../types/user-creation.types";
import { EMPTY_USER_LIMIT } from "../types/user-creation.types";
import {
  filterSubUsers,
  getSubUserFullName,
} from "../utils/usc.utils";
import { UscLoadingCenter } from "./usc-loading-center";
import { UscSearchPanel } from "./usc-search-panel";
import { UscCreateDrawer } from "./upsert/UscCreateDrawer";

export function UserCreationListing() {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: subUsers = [],
    isLoading,
    isFetching,
  } = useSubUsersQuery();
  const { data: limitInfo = EMPTY_USER_LIMIT } = useUserLimitQuery();
  const { mutate: toggleStatus } = useToggleSubUserStatusMutation();

  const filteredUsers = filterSubUsers(subUsers, searchTerm);
  const percentUsed =
    limitInfo.allowedUserLimit > 0
      ? Math.round(
          (limitInfo.currentlyAllocated / limitInfo.allowedUserLimit) * 100,
        )
      : 0;

  const columns: DataViewColumn<SubUser>[] = [
    {
      ...buildActionsColumn<SubUser>({
        field: "id",
        width: 110,
        cellRenderer: (params) => {
          if (!params.data) return null;
          const record = params.data;
          return (
            <Tooltip
              title={record.isActive ? "Disable account" : "Enable account"}
            >
              <Switch
                size="small"
                checked={record.isActive}
                onChange={(checked) =>
                  toggleStatus({ id: record.id, active: checked })
                }
              />
            </Tooltip>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Login Username",
      field: "loginName",
      sortable: true,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Space>
            <AppIcon icon={Icons.user} size={16} />
            <strong>{record.loginName}</strong>
          </Space>
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
      headerName: "Allowed Capabilities",
      field: "allowedModules",
      sortable: false,
      cellRenderer: (params: { data?: SubUser }) => {
        const mods = params.data?.allowedModules || [];
        return (
          <Space wrap size={[2, 4]}>
            {mods.map((m) => (
              <Tag className="usc-module-tag" color="blue" key={m}>
                {m}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      headerName: "Account Status",
      field: "isActive",
      sortable: true,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tag
            className="usc-status-tag"
            color={record.isActive ? "success" : "error"}
          >
            {record.isActive ? "Active" : "Disabled"}
          </Tag>
        );
      },
    },
  ];

  const showLoading = isLoading && subUsers.length === 0;

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
                  : "Create New Sub-User"
              }
            >
              <AppButton
                type="primary"
                size="large"
                icon={
                  <AppIcon icon={Icons.userPlus} size={16} tone="create" />
                }
                disabled={limitInfo.limitReached}
                onClick={() => setIsDrawerOpen(true)}
              >
                Create New Sub-User
              </AppButton>
            </Tooltip>
          }
        />
      </div>

      <Card className="usc-limit-card" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col {...RESPONSIVE_COL.third}>
            <span className="usc-limit-card__label">
              Customer user profile limit
            </span>
            <div className="usc-limit-card__count">
              {limitInfo.currentlyAllocated} / {limitInfo.allowedUserLimit}{" "}
              Users
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.twoThirds} lg={10}>
            <span className="usc-limit-card__label">
              Account allocation ({limitInfo.remainingSlots} slots remaining)
            </span>
            <Progress
              percent={percentUsed}
              status={limitInfo.limitReached ? "exception" : "active"}
            />
          </Col>
          <Col xs={24} lg={6}>
            <div className="usc-limit-card__status">
              <Tag
                className="usc-status-tag"
                color={limitInfo.limitReached ? "error" : "success"}
              >
                {limitInfo.limitReached ? "Limit Reached" : "Slots Available"}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      {limitInfo.limitReached ? (
        <Alert
          className="usc-alert"
          message="Creation Limit Exceeded"
          description="Creation of user profile limit has been reached. Please contact system admin to expand your allowed user quota."
          type="warning"
          showIcon
        />
      ) : null}

      <UscSearchPanel value={searchTerm} onChange={setSearchTerm} />

      {showLoading ? (
        <UscLoadingCenter fill />
      ) : (
        <div className="usc-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            columnDefs={columns}
            rowData={filteredUsers}
            loading={isFetching}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="usc-data-view"
            listOptions={{
              showToolbar: false,
              gridOptions: {
                getRowId: (params: { data: SubUser }) => params.data.id,
                overlayNoRowsTemplate: "No sub-users found.",
              },
            }}
          />
        </div>
      )}

      {isDrawerOpen ? (
        <UscCreateDrawer
          open
          limitReached={limitInfo.limitReached}
          onClose={() => setIsDrawerOpen(false)}
          onLimitBlocked={() =>
            toast.error("Creation of user profile limit has been reached")
          }
        />
      ) : null}
    </div>
  );
}
