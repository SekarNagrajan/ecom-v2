// Modified by Sekar Nagarajan (2026-08-26 16:53)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppSelect,
  FormInput,
  FormTextarea,
} from "@solverminds/shared-ui";
import { Col, Row, Space, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { EmailTemplate } from "../types/admin.types";
import { AdminLoadingCenter } from "./admin-loading-center";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const emailEditorSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  bodyHtml: z.string().min(1, "Template body is required"),
});

type EmailEditorForm = z.infer<typeof emailEditorSchema>;

interface EmailTemplateEditorViewProps {
  templates: EmailTemplate[];
  onSave: (
    id: string,
    data: Partial<EmailTemplate>,
  ) => void | Promise<void>;
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function templateSyncKey(template: EmailTemplate | undefined) {
  if (!template) return "";
  return `${template.id}:${template.updatedAt}:${template.subject}:${template.bodyHtml}`;
}

export function EmailTemplateEditorView({
  templates,
  onSave,
}: EmailTemplateEditorViewProps) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const activeTemplate =
    templates.find((item) => item.id === selectedId) ?? templates[0];

  const form = useForm<EmailEditorForm>({
    resolver: zodResolver(emailEditorSchema) as Resolver<EmailEditorForm>,
    defaultValues: {
      subject: activeTemplate?.subject ?? "",
      bodyHtml: activeTemplate?.bodyHtml ?? "",
    },
    mode: "onChange",
  });

  const [appliedKey, setAppliedKey] = useState(() =>
    templateSyncKey(activeTemplate),
  );
  const nextKey = templateSyncKey(activeTemplate);
  if (nextKey && nextKey !== appliedKey) {
    setAppliedKey(nextKey);
    if (activeTemplate) {
      setSelectedId(activeTemplate.id);
      form.reset({
        subject: activeTemplate.subject,
        bodyHtml: activeTemplate.bodyHtml,
      });
    }
  }

  const bodyHtml =
    useWatch({ control: form.control, name: "bodyHtml" }) ?? "";
  const [isSaving, setIsSaving] = useState(false);

  const handleTemplateChange = (value: string | number | null | undefined) => {
    const id = String(value ?? "");
    const next = templates.find((item) => item.id === id);
    if (!next) return;
    setSelectedId(next.id);
    setAppliedKey(templateSyncKey(next));
    form.reset({
      subject: next.subject,
      bodyHtml: next.bodyHtml,
    });
  };

  const handleInsertVariable = (placeholder: string) => {
    const current = form.getValues("bodyHtml") ?? "";
    const spacer = current && !current.endsWith(" ") ? " " : "";
    form.setValue("bodyHtml", `${current}${spacer}${placeholder} `, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    if (!activeTemplate) return;
    form.reset({
      subject: activeTemplate.subject,
      bodyHtml: activeTemplate.bodyHtml,
    });
  };

  const handleUpdate = form.handleSubmit(async (values) => {
    if (!activeTemplate) return;
    setIsSaving(true);
    try {
      await onSave(activeTemplate.id, {
        subject: values.subject,
        bodyHtml: values.bodyHtml,
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (!templates.length || !activeTemplate) {
    return (
      <AdminPanelShell
        icon={Icons.mail}
        title="Email Template Editor"
        subtitle="Create and customize transactional notification templates with dynamic variables."
      >
        <AdminLoadingCenter />
      </AdminPanelShell>
    );
  }

  return (
    <AdminPanelShell
      icon={Icons.mail}
      title="Email Template Editor"
      subtitle="Create and customize transactional notification templates with dynamic variables."
    >
      <div className="admin-email-form">
        <div className="admin-menu-summary" aria-label="Template summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.mail} size={14} />
            <Text>
              {templates.length} Template{templates.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.eye} size={14} />
            <Text>{activeTemplate.templateCode}</Text>
          </span>
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.clock} size={14} />
            <Text>Updated {activeTemplate.updatedAt}</Text>
          </span>
        </div>

        <Row gutter={[16, 16]} align="top">
          <Col {...RESPONSIVE_COL.formThird}>
            <div className="admin-email-sidebar">
              <span className="form-field-label">Select Email Template</span>
              <AppSelect
                size="large"
                className="admin-stack-full"
                value={selectedId}
                onChange={handleTemplateChange}
                options={templates.map((item) => ({
                  label: item.templateCode,
                  value: item.id,
                }))}
                showSearch
                optionFilterProp="label"
              />

              <div className="admin-vars-box">
                <span className="form-field-label">Available Variables</span>
                <Text type="secondary" className="admin-vars-box__hint">
                  Click a variable to insert it into the HTML body.
                </Text>
                <Space wrap size={[4, 8]} className="admin-vars-box__tags">
                  {activeTemplate.placeholders.map((placeholder) => (
                    <Tooltip
                      key={placeholder}
                      title={`Insert ${placeholder}`}
                    >
                      <Tag
                        className="admin-code-tag admin-vars-tag"
                        color="cyan"
                        onClick={() => handleInsertVariable(placeholder)}
                      >
                        {placeholder}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              </div>
            </div>
          </Col>

          <Col {...RESPONSIVE_COL.twoThirds}>
            <div className="admin-email-editor">
              <FormInput
                control={form.control}
                name="subject"
                label={reqLabel("Email Subject Line")}
                size="large"
                formItemProps={FIELD_ITEM_PROPS}
              />

              <FormTextarea
                control={form.control}
                name="bodyHtml"
                label={reqLabel("HTML Template Body")}
                rows={12}
                className="admin-mono-textarea custom-scroll"
                formItemProps={FIELD_ITEM_PROPS}
              />

              <div className="admin-preview-box">
                <Text type="secondary" className="admin-preview-box__label">
                  Live Preview
                </Text>
                <div
                  className="admin-preview-box__content custom-scroll"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
            </div>
          </Col>
        </Row>

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
