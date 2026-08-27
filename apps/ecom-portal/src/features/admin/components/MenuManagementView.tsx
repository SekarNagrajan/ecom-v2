// Modified by Sekar Nagarajan (2026-08-27 12:42)
/**
 * Module Creation — parity with RegisterMenu.jsp:
 * create form + list with enable/disable (Global Menu Management).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppSwitch } from "@solverminds/shared-ui";
import { Collapse, Input, Select, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  MenuCreateSchema,
  type MenuConfig,
  type MenuCreateForm,
} from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

interface MenuManagementViewProps {
  menus: MenuConfig[];
  onSave: (menus: MenuConfig[]) => void | Promise<void>;
  onCreate: (
    menu: Omit<MenuConfig, "isEnabled"> & { isEnabled?: boolean },
  ) => void | Promise<void>;
}

function menusSignature(items: MenuConfig[]) {
  return items
    .map(
      (item) =>
        `${item.refNo}:${item.isEnabled}:${item.orderNo}:${item.category}`,
    )
    .join("|");
}

export function MenuManagementView({
  menus,
  onSave,
  onCreate,
}: MenuManagementViewProps) {
  const [draft, setDraft] = useState<MenuConfig[]>(menus);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    menusSignature(menus),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createForm = useForm<MenuCreateForm>({
    resolver: zodResolver(MenuCreateSchema) as Resolver<MenuCreateForm>,
    defaultValues: {
      menuName: "",
      menuOrder: menus.length + 1,
      userType: undefined,
      developedBy: "",
      refNo: "",
      status: "A",
      category: "P",
      createdBy: "",
      classValue: "",
      attrValue: "",
      labelValue: "",
      menuType: "",
      parentMenu: "",
    },
  });

  const nextSignature = menusSignature(menus);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(menus);
  }

  const enabledCount = draft.filter((item) => item.isEnabled).length;
  const restrictedCount = draft.filter((item) => item.category === "P").length;
  const sortedDraft = [...draft].sort((a, b) => a.orderNo - b.orderNo);

  const handleToggle = (refNo: string, checked: boolean) => {
    setDraft((prev) =>
      prev.map((item) =>
        item.refNo === refNo ? { ...item, isEnabled: checked } : item,
      ),
    );
  };

  const handleCancel = () => {
    setDraft(menus);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = createForm.handleSubmit(async (values) => {
    setIsCreating(true);
    try {
      await onCreate({
        refNo: values.refNo,
        labelValue: values.labelValue,
        menuName: values.menuName,
        category: values.category,
        classValue: values.classValue || "",
        attrValue: values.attrValue,
        orderNo: values.menuOrder,
        isEnabled: values.status === "A",
        userType: values.userType,
        menuType: values.menuType,
        parentMenu: values.parentMenu,
        developedBy: values.developedBy,
        createdBy: values.createdBy,
      });
      createForm.reset({
        menuName: "",
        menuOrder: menus.length + 2,
        userType: undefined,
        developedBy: "",
        refNo: "",
        status: "A",
        category: "P",
        createdBy: "",
        classValue: "",
        attrValue: "",
        labelValue: "",
        menuType: "",
        parentMenu: "",
      });
    } finally {
      setIsCreating(false);
    }
  });

  const {
    control,
    formState: { errors },
  } = createForm;

  const columns: ColumnsType<MenuConfig> = [
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "left",
      render: (_: unknown, record: MenuConfig) => (
        <Tooltip
          title={record.isEnabled ? "Disable Menu Item" : "Enable Menu Item"}
        >
          <span className="admin-menu-action">
            <AppSwitch
              checked={record.isEnabled}
              aria-label={
                record.isEnabled ? "Disable Menu Item" : "Enable Menu Item"
              }
              onChange={(checked) => handleToggle(record.refNo, checked)}
            />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 80,
    },
    {
      title: "Ref Code",
      dataIndex: "refNo",
      key: "refNo",
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: "Menu Name",
      dataIndex: "menuName",
      key: "menuName",
      render: (val: string | undefined, record) => (
        <Text>{val || record.labelValue}</Text>
      ),
    },
    {
      title: "Resource Key / Label",
      dataIndex: "labelValue",
      key: "labelValue",
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: MenuConfig["category"]) => (
        <Tag
          className="admin-status-tag"
          color={cat === "D" ? "success" : "warning"}
        >
          {cat === "D" ? "Default Access" : "Permission Restricted"}
        </Tag>
      ),
    },
    {
      title: "Icon Class",
      dataIndex: "classValue",
      key: "classValue",
      render: (val: string) => <Text type="secondary">{val}</Text>,
    },
    {
      title: "Route Target",
      dataIndex: "attrValue",
      key: "attrValue",
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      key: "isEnabled",
      render: (enabled: boolean) => (
        <Tag
          className="admin-status-tag"
          color={enabled ? "success" : "default"}
        >
          {enabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.list}
      title="Module Creation"
      subtitle="Register new menus and configure visibility / category entitlement rules."
    >
      <div className="admin-menu-form">
        <Collapse
          className="admin-menu-create"
          defaultActiveKey={["create"]}
          items={[
            {
              key: "create",
              label: "Create Menu (Register)",
              children: (
                <form
                  onSubmit={handleCreateSubmit}
                  className="admin-menu-create__form"
                  autoComplete="off"
                >
                  <div className="admin-menu-create__grid">
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Menu Name <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="menuName"
                        render={({ field }) => (
                          <Input
                            {...field}
                            size="large"
                            status={errors.menuName ? "error" : undefined}
                          />
                        )}
                      />
                      {errors.menuName ? (
                        <Text type="danger" className="form-field-error">
                          {errors.menuName.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Menu Order <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="menuOrder"
                        render={({ field }) => (
                          <Input
                            size="large"
                            type="number"
                            value={field.value}
                            status={errors.menuOrder ? "error" : undefined}
                            onChange={(e) => {
                              const next = Number(e.target.value);
                              field.onChange(
                                Number.isFinite(next) ? next : field.value,
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        )}
                      />
                      {errors.menuOrder ? (
                        <Text type="danger" className="form-field-error">
                          {errors.menuOrder.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        User Type <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="userType"
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            placeholder="Select"
                            options={[
                              { value: "U", label: "User" },
                              { value: "V", label: "Vendor" },
                            ]}
                            status={errors.userType ? "error" : undefined}
                          />
                        )}
                      />
                      {errors.userType ? (
                        <Text type="danger" className="form-field-error">
                          {errors.userType.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Ref No <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="refNo"
                        render={({ field }) => (
                          <Input
                            {...field}
                            size="large"
                            status={errors.refNo ? "error" : undefined}
                          />
                        )}
                      />
                      {errors.refNo ? (
                        <Text type="danger" className="form-field-error">
                          {errors.refNo.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Status <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            options={[
                              { value: "A", label: "ACTIVE" },
                              { value: "I", label: "INACTIVE" },
                            ]}
                          />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Category <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            options={[
                              { value: "D", label: "Default" },
                              { value: "P", label: "Privileged" },
                            ]}
                          />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Label Value <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="labelValue"
                        render={({ field }) => (
                          <Input
                            {...field}
                            size="large"
                            placeholder="e.g. ecom.booking"
                            status={errors.labelValue ? "error" : undefined}
                          />
                        )}
                      />
                      {errors.labelValue ? (
                        <Text type="danger" className="form-field-error">
                          {errors.labelValue.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">
                        Attr / Route <Text type="danger">*</Text>
                      </label>
                      <Controller
                        control={control}
                        name="attrValue"
                        render={({ field }) => (
                          <Input
                            {...field}
                            size="large"
                            placeholder="e.g. /app/booking"
                            status={errors.attrValue ? "error" : undefined}
                          />
                        )}
                      />
                      {errors.attrValue ? (
                        <Text type="danger" className="form-field-error">
                          {errors.attrValue.message}
                        </Text>
                      ) : null}
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">Class Value</label>
                      <Controller
                        control={control}
                        name="classValue"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">Developed By</label>
                      <Controller
                        control={control}
                        name="developedBy"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">Created By</label>
                      <Controller
                        control={control}
                        name="createdBy"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">Menu Type</label>
                      <Controller
                        control={control}
                        name="menuType"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="admin-login-page__field">
                      <label className="form-field-label">Parent Menu</label>
                      <Controller
                        control={control}
                        name="parentMenu"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                  </div>
                  <div className="admin-form-footer form-step-footer">
                    <AppButton
                      htmlType="button"
                      onClick={() => createForm.reset()}
                      disabled={isCreating}
                    >
                      Reset
                    </AppButton>
                    <AppButton
                      type="primary"
                      htmlType="submit"
                      loading={isCreating}
                      icon={<AppIcon icon={Icons.plus} size={16} />}
                    >
                      Submit
                    </AppButton>
                  </div>
                </form>
              ),
            },
          ]}
        />

        <div className="admin-menu-summary" aria-label="Menu summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.list} size={14} />
            <Text>
              {draft.length} Item{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.checkCircle} size={14} />
            <Text>{enabledCount} Enabled</Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--warning">
            <AppIcon icon={Icons.lock} size={14} />
            <Text>{restrictedCount} Restricted</Text>
          </span>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table<MenuConfig>
            dataSource={sortedDraft}
            columns={columns}
            rowKey="refNo"
            pagination={false}
            scroll={{ x: true }}
            size="middle"
          />
        </div>

        <div className="admin-form-footer form-step-footer">
          <AppButton onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSaving}
            onClick={handleUpdate}
          >
            Update
          </AppButton>
        </div>
      </div>
    </AdminPanelShell>
  );
}
