// Modified by Sekar Nagarajan (2026-08-24 19:09)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer, FormInput } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  Input,
  Progress,
  Row,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useUserCreationController } from "../hooks/use-user-creation-controller";
import {
  createSubUserSchema,
  type CreateSubUserPayload,
  type SubUser,
} from "../types/user-creation.types";
import { UserCreationModuleStyles } from "./user-creation-module-styles";

const { Title, Text } = Typography;

const MODULE_OPTIONS = [
  { label: "Schedules (SCH)", value: "SCH" },
  { label: "Tracking (TRK)", value: "TRK" },
  { label: "e-Booking (BKG)", value: "BKG" },
  { label: "Shipping Instruction (SI)", value: "SI" },
  { label: "VGM Filing", value: "VGM" },
  { label: "Bill of Lading (BL)", value: "BL" },
];

const CREATE_DEFAULTS: CreateSubUserPayload = {
  loginName: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  companyName: "Apex Shipping Logistics",
  custCountryCode: "+1",
  custPhoneCode: "212",
  custPhoneNo: "",
  mobileCode: "+1",
  defLanguage: "en",
  prefLanguage: "en",
  allowedModules: ["SCH", "TRK", "BKG", "SI"],
};

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

export function UserCreationView() {
  const toast = useToast();
  const controller = useUserCreationController();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const createForm = useForm({
    resolver: zodResolver(createSubUserSchema),
    defaultValues: CREATE_DEFAULTS,
  });

  const openCreateDrawer = () => {
    createForm.reset(CREATE_DEFAULTS);
    setIsDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setIsDrawerOpen(false);
    createForm.reset(CREATE_DEFAULTS);
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (controller.limitInfo.limitReached) {
      toast.error("Creation of user profile limit has been reached");
      return;
    }

    try {
      await controller.createSubUser(values as CreateSubUserPayload);
      toast.success("Sub-user profile created successfully");
      closeCreateDrawer();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to create sub-user profile";
      toast.error(errorMsg);
    }
  });

  const filteredUsers = controller.subUsers.filter(
    (u) =>
      u.loginName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columnDefs: DataViewColumn<SubUser>[] = [
    {
      headerName: "Actions",
      field: "id" as keyof SubUser,
      width: 110,
      pinned: "left",
      sortable: false,
      cellRenderer: (params: { data?: SubUser }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tooltip
            title={record.isActive ? "Disable account" : "Enable account"}
          >
            <Switch
              size="small"
              checked={record.isActive}
              onChange={(checked) =>
                controller.toggleSubUserStatus({
                  id: record.id,
                  active: checked,
                })
              }
            />
          </Tooltip>
        );
      },
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
        params.data ? `${params.data.firstName} ${params.data.lastName}` : "",
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

  const percentUsed = Math.round(
    (controller.limitInfo.currentlyAllocated /
      controller.limitInfo.allowedUserLimit) *
      100,
  );

  const drawerActions = (
    <Space size="middle" className="usc-drawer-actions">
      <AppButton onClick={closeCreateDrawer} disabled={controller.isCreating}>
        Cancel
      </AppButton>
      <AppButton
        type="primary"
        icon={<AppIcon icon={Icons.userPlus} size={16} />}
        loading={controller.isCreating}
        onClick={handleCreate}
      >
        Submit
      </AppButton>
    </Space>
  );

  return (
    <FeaturePageShell>
      <UserCreationModuleStyles />
      <Card className="feature-page-card" bordered={false}>
        <div className="usc-page">
          <ModuleScreenHeader
            icon={Icons.users}
            title={MODULE_TITLES.userCreation}
            subtitle="Create and manage sub-user credentials for company employees, agents, and delegates."
            extra={
              <AppButton
                type="primary"
                size="large"
                icon={<AppIcon icon={Icons.userPlus} size={16} />}
                disabled={controller.limitInfo.limitReached}
                onClick={openCreateDrawer}
              >
                Create New Sub-User
              </AppButton>
            }
          />

          <Card className="usc-limit-card" bordered={false}>
            <Row gutter={[16, 16]} align="middle">
              <Col {...RESPONSIVE_COL.third}>
                <span className="usc-limit-card__label">
                  Customer user profile limit
                </span>
                <Title level={3} className="usc-limit-card__count">
                  {controller.limitInfo.currentlyAllocated} /{" "}
                  {controller.limitInfo.allowedUserLimit} Users
                </Title>
              </Col>
              <Col {...RESPONSIVE_COL.twoThirds} lg={10}>
                <span className="usc-limit-card__label">
                  Account allocation ({controller.limitInfo.remainingSlots}{" "}
                  slots remaining)
                </span>
                <Progress
                  percent={percentUsed}
                  status={
                    controller.limitInfo.limitReached ? "exception" : "active"
                  }
                />
              </Col>
              <Col xs={24} lg={6}>
                <div className="usc-limit-card__status">
                  <Tag
                    className="usc-status-tag"
                    color={
                      controller.limitInfo.limitReached ? "error" : "success"
                    }
                  >
                    {controller.limitInfo.limitReached
                      ? "Limit Reached"
                      : "Slots Available"}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>

          {controller.limitInfo.limitReached ? (
            <Alert
              className="usc-alert"
              message="Creation Limit Exceeded"
              description="Creation of user profile limit has been reached. Please contact system admin to expand your allowed user quota."
              type="warning"
              showIcon
            />
          ) : null}

          <div className="usc-search-panel">
            <Input
              size="large"
              allowClear
              prefix={<AppIcon icon={Icons.search} size={16} />}
              placeholder="Search sub-users by login name, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="usc-grid-wrap responsive-table-wrap">
            <DataView
              columnDefs={columnDefs}
              rowData={filteredUsers}
              loading={controller.isLoadingUsers}
              allowedViewModes={["list"]}
              listOptions={{
                gridOptions: {
                  domLayout: "autoHeight",
                },
              }}
            />
          </div>
        </div>

        <AppDrawer
          open={isDrawerOpen}
          onClose={closeCreateDrawer}
          title="Create Sub-User Account"
          placement="right"
          dialogSize="md"
          destroyOnClose
          maskClosable={!controller.isCreating}
          keyboard={!controller.isCreating}
          footer={drawerActions}
        >
          <div className="usc-drawer-body custom-scroll">
            <div className="usc-form-section">
              <Title level={5} className="usc-form-section__title">
                Credentials
              </Title>
              <Row gutter={[16, 16]}>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="loginName"
                    label={reqLabel("Login Username")}
                    size="large"
                    prefix={<AppIcon icon={Icons.user} size={16} />}
                    placeholder="e.g. SUB_EMP_01"
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="password"
                    type="password"
                    label={reqLabel("Initial Password")}
                    size="large"
                    prefix={<AppIcon icon={Icons.key} size={16} />}
                    placeholder="Enter password"
                  />
                </Col>
              </Row>
            </div>

            <div className="usc-form-section">
              <Title level={5} className="usc-form-section__title">
                Profile
              </Title>
              <Row gutter={[16, 16]}>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="firstName"
                    label={reqLabel("First Name")}
                    size="large"
                    placeholder="John"
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="lastName"
                    label={reqLabel("Last Name")}
                    size="large"
                    placeholder="Doe"
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="email"
                    type="email"
                    label={reqLabel("Email Address")}
                    size="large"
                    prefix={<AppIcon icon={Icons.mail} size={16} />}
                    placeholder="john.doe@company.com"
                  />
                </Col>
                <Col {...RESPONSIVE_COL.formHalf}>
                  <FormInput
                    control={createForm.control}
                    name="custPhoneNo"
                    label={reqLabel("Contact Phone")}
                    size="large"
                    prefix={<AppIcon icon={Icons.phone} size={16} />}
                    placeholder="+1 212 555-0199"
                  />
                </Col>
                <Col {...RESPONSIVE_COL.full}>
                  <FormInput
                    control={createForm.control}
                    name="companyName"
                    label={
                      <span className="form-field-label">Company Profile</span>
                    }
                    size="large"
                  />
                </Col>
              </Row>
            </div>

            <div className="usc-form-section">
              <Title level={5} className="usc-form-section__title">
                Module Access Entitlements
              </Title>
              <div className="usc-modules-group">
                <Controller
                  control={createForm.control}
                  name="allowedModules"
                  render={({ field }) => (
                    <Checkbox.Group
                      options={MODULE_OPTIONS}
                      value={field.value}
                      onChange={(vals) => field.onChange(vals as string[])}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </AppDrawer>
      </Card>
    </FeaturePageShell>
  );
}
