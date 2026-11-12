// Created by Sekar Nagarajan (2026-11-12 12:40)
/** Email Templates tab — an empty template list is an empty state, not an endless spinner. */
import {
  useEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
} from "../../api/admin.queries";
import type { EmailTemplate } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { EmailTemplateEditorView } from "../EmailTemplateEditorView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function EmailTemplatesSection() {
  const query = useEmailTemplatesQuery();
  const update = useUpdateEmailTemplateMutation();
  const templates = query.data ?? [];

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
      isEmpty={!query.isLoading && templates.length === 0}
      emptyTitle="No email templates configured"
      emptyMessage="Transactional templates will appear here once they exist on the server."
    >
      <EmailTemplateEditorView
        templates={templates}
        onSave={(id: string, data: Partial<EmailTemplate>) =>
          settleMutation(() => update.mutateAsync({ id, data }))
        }
      />
    </AdminSectionState>
  );
}
