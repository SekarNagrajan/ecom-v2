// Modified by Sekar Nagarajan (2026-11-12 15:40)
/**
 * Email Templates — pick a transactional template, edit subject + HTML body, insert placeholders
 * at the caret, and preview the sanitised result. The open template lives in `?template=` so a
 * refresh keeps it; RHF `values` re-syncs the form when the template (or saved data) changes.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppSegmented,
  AppSelect,
  FormInput,
  FormTextarea,
  FormattedDate,
} from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { sanitizeHtml } from "@solverminds/shared-ui/utils";
import { Input, Tag, Tooltip, Typography } from "antd";
import { useState, type KeyboardEvent } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { FIELD_ITEM_PROPS, reqLabel } from "../../../components/shared/form-field-label";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import { useAiTextAssist } from "../../ai-assist";
import { adminRoute } from "../admin-route";
import {
  EmailTemplateEditSchema,
  type EmailTemplate,
  type EmailTemplateEditValues,
} from "../types/admin.types";
import { AdminFormFooter } from "./shared/AdminFormFooter";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminUnsavedGuard } from "./shared/AdminUnsavedGuard";

const { Text } = Typography;

const SUBJECT_ID = "admin-email-subject";
const BODY_ID = "admin-email-body";

type EditorPane = "editor" | "preview";
type InsertTarget = "subject" | "bodyHtml";

interface EmailTemplateEditorViewProps {
  templates: EmailTemplate[];
  onSave: (id: string, data: EmailTemplateEditValues) => Promise<void>;
  isSaving: boolean;
}

/** BOOKING_CONFIRMED_CUSTOMER → "Booking Confirmed Customer" */
export function humaniseTemplateCode(code: string): string {
  return code
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wrap each known placeholder so the preview shows where the dynamic values land. */
function highlightPlaceholders(html: string, placeholders: string[]): string {
  if (!placeholders.length) return html;
  const pattern = new RegExp(placeholders.map(escapeRegExp).join("|"), "g");
  return html.replace(pattern, (match) => `<span class="admin-email-var">${match}</span>`);
}

export function EmailTemplateEditorView({
  templates,
  onSave,
  isSaving,
}: EmailTemplateEditorViewProps) {
  const confirm = useConfirm();
  const { compactHeader: isNarrow } = useResponsiveLayout();
  const { textareaAssistProps } = useAiTextAssist();
  const { template: templateParam } = adminRoute.useSearch();
  const navigate = adminRoute.useNavigate();

  const [search, setSearch] = useState("");
  const [pane, setPane] = useState<EditorPane>("editor");
  const [insertTarget, setInsertTarget] = useState<InsertTarget>("bodyHtml");

  const activeTemplate = templates.find((t) => t.id === templateParam) ?? templates[0];

  const form = useForm<EmailTemplateEditValues>({
    resolver: zodResolver(EmailTemplateEditSchema) as Resolver<EmailTemplateEditValues>,
    values: activeTemplate
      ? { subject: activeTemplate.subject, bodyHtml: activeTemplate.bodyHtml }
      : { subject: "", bodyHtml: "" },
    mode: "onChange",
  });
  const { isDirty } = form.formState;
  const bodyHtml = useWatch({ control: form.control, name: "bodyHtml" }) ?? "";

  const query = search.trim().toLowerCase();
  const visibleTemplates = templates.filter(
    (t) =>
      !query ||
      t.templateCode.toLowerCase().includes(query) ||
      humaniseTemplateCode(t.templateCode).toLowerCase().includes(query),
  );

  const goToTemplate = (id: string) => {
    void navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, template: id }),
      replace: true,
    } as never);
  };

  const selectTemplate = (id: string) => {
    if (!activeTemplate || id === activeTemplate.id) return;
    if (isDirty) {
      confirm.show({
        title: "Discard unsaved changes?",
        content: `Your edits to ${humaniseTemplateCode(activeTemplate.templateCode)} will be lost.`,
        okText: "Discard",
        cancelText: "Keep editing",
        okButtonProps: { danger: true },
        onOk: () => goToTemplate(id),
      });
      return;
    }
    goToTemplate(id);
  };

  const insertPlaceholder = (placeholder: string) => {
    const name = insertTarget;
    const elementId = name === "subject" ? SUBJECT_ID : BODY_ID;
    const el = document.getElementById(elementId) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    const current = form.getValues(name) ?? "";
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${placeholder}${current.slice(end)}`;
    form.setValue(name, next, { shouldDirty: true, shouldValidate: true });
    const caret = start + placeholder.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const save = async (values: EmailTemplateEditValues) => {
    if (!activeTemplate) return;
    await onSave(activeTemplate.id, values);
    form.reset(values);
  };
  const handleSave = form.handleSubmit(save);

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!activeTemplate) return;
    const index = visibleTemplates.findIndex((t) => t.id === activeTemplate.id);
    const move = (delta: number) => {
      const next = visibleTemplates[(index + delta + visibleTemplates.length) % visibleTemplates.length];
      if (next) selectTemplate(next.id);
    };
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    }
  };

  if (!activeTemplate) {
    return (
      <AdminSectionPage>
        <ModuleEmptyState variant="blank" title="No email templates configured" />
      </AdminSectionPage>
    );
  }

  const previewHtml = sanitizeHtml(highlightPlaceholders(bodyHtml, activeTemplate.placeholders));

  const templateList = (
    <aside className="admin-template-pane">
      <Input
        size="large"
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search templates"
        aria-label="Search templates"
        prefix={<AppIcon icon={Icons.search} size={16} />}
      />
      <ul
        className="admin-template-list custom-scroll"
        role="listbox"
        aria-label="Email templates"
        onKeyDown={onListKeyDown}
      >
        {visibleTemplates.map((template) => {
          const selected = template.id === activeTemplate.id;
          return (
            <li key={template.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={[
                  "admin-template-list__item",
                  selected ? "admin-template-list__item--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectTemplate(template.id)}
              >
                <span className="admin-template-list__title">
                  {humaniseTemplateCode(template.templateCode)}
                  {selected && isDirty ? (
                    <span className="admin-dirty-dot" aria-label="Unsaved changes" />
                  ) : null}
                </span>
                <span className="admin-template-list__meta">
                  <Text type="secondary">
                    Updated <FormattedDate value={template.updatedAt} relative />
                  </Text>
                </span>
              </button>
            </li>
          );
        })}
        {visibleTemplates.length === 0 ? (
          <li className="admin-template-list__empty">
            <Text type="secondary">No templates match “{search}”.</Text>
          </li>
        ) : null}
      </ul>
    </aside>
  );

  const templateSelect = (
    <AppSelect
      size="large"
      showSearch
      optionFilterProp="label"
      value={activeTemplate.id}
      onChange={(value) => selectTemplate(String(value))}
      options={templates.map((t) => ({
        value: t.id,
        label: humaniseTemplateCode(t.templateCode),
      }))}
      className="admin-stack-full"
      aria-label="Email template"
    />
  );

  const editor = (
    <>
      <FormInput
        id={SUBJECT_ID}
        control={form.control}
        name="subject"
        label={reqLabel("Subject")}
        size="large"
        onFocus={() => setInsertTarget("subject")}
        formItemProps={FIELD_ITEM_PROPS}
      />
      <div className="admin-template-vars">
        <span className="admin-template-vars__label">
          Variables{" "}
          <Text type="secondary">
            (insert into {insertTarget === "subject" ? "subject" : "body"})
          </Text>
        </span>
        <div className="admin-template-vars__chips">
          {activeTemplate.placeholders.map((placeholder) => (
            <Tooltip key={placeholder} title={`Insert ${placeholder}`}>
              <AppButton
                size="small"
                className="admin-template-vars__chip"
                onClick={() => insertPlaceholder(placeholder)}
              >
                {placeholder}
              </AppButton>
            </Tooltip>
          ))}
          {activeTemplate.placeholders.length === 0 ? (
            <Text type="secondary">This template has no placeholders.</Text>
          ) : null}
        </div>
      </div>
      <FormTextarea
        id={BODY_ID}
        control={form.control}
        name="bodyHtml"
        label={reqLabel("HTML Body")}
        rows={14}
        className="admin-mono-textarea custom-scroll"
        onFocus={() => setInsertTarget("bodyHtml")}
        formItemProps={FIELD_ITEM_PROPS}
        {...textareaAssistProps}
      />
    </>
  );

  const preview = (
    <div className="admin-template-preview" aria-label="Template preview">
      <Text type="secondary" className="admin-template-preview__label">
        Preview
      </Text>
      <div
        className="admin-template-preview__content custom-scroll"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );

  return (
    <AdminSectionPage>
      <AdminUnsavedGuard
        isDirty={isDirty}
        onSave={async () => {
          const valid = await form.trigger();
          if (!valid) return false;
          await save(form.getValues());
          return true;
        }}
        onDiscard={() => form.reset()}
      />

      <div className="admin-email-form">
        <div className={["admin-email-layout", isNarrow ? "admin-email-layout--narrow" : ""].filter(Boolean).join(" ")}>
          {isNarrow ? templateSelect : templateList}

          <div className="admin-email-editor-pane">
            <AdminFormSection
              icon={Icons.mail}
              title={humaniseTemplateCode(activeTemplate.templateCode)}
              hint={
                <>
                  <Tag className="admin-code-tag">{activeTemplate.templateCode}</Tag>{" "}
                  Updated <FormattedDate value={activeTemplate.updatedAt} showTime />
                </>
              }
              extra={
                isNarrow ? (
                  <AppSegmented<EditorPane>
                    value={pane}
                    onChange={(value) => setPane(value)}
                    options={[
                      { value: "editor", label: "Editor", icon: <AppIcon icon={Icons.edit} size={14} /> },
                      { value: "preview", label: "Preview", icon: <AppIcon icon={Icons.eye} size={14} /> },
                    ]}
                    aria-label="Editor or preview"
                  />
                ) : undefined
              }
            >
              {isNarrow ? (
                pane === "editor" ? editor : preview
              ) : (
                <div className="admin-email-editor-grid">
                  <div className="admin-email-editor-grid__editor">{editor}</div>
                  <div className="admin-email-editor-grid__preview">{preview}</div>
                </div>
              )}
            </AdminFormSection>
          </div>
        </div>

        <AdminFormFooter
          isDirty={isDirty}
          isSaving={isSaving}
          onCancel={() => form.reset()}
          onSave={() => void handleSave()}
        />
      </div>
    </AdminSectionPage>
  );
}
