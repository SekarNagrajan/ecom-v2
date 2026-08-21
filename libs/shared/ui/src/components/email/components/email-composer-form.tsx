import { zodResolver } from '@hookform/resolvers/zod';
import { Flex, Form, Tooltip, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useDebouncedCallback, useToast } from '../../../hooks';
import { FormInput } from '../../form-fields/form-input';
import { FormSelect } from '../../form-fields/form-select';
import { FormRichTextEditor } from '../../form-fields/rich-text-editor';
import { AppButton } from '../../ui/button';
import type {
  FileAttachmentAttributes,
  UploadResponse,
} from '../../ui/rich-text-editor/types';
import { toDraftInput } from '../utils/email-compose-helpers';
import {
  emailComposerFormSchema,
  type EmailComposerFormValues,
} from './email-composer-form-schema';
import type { EmailComposerFormProps } from './email-composer-form.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMimeAccepted(
  mimeType: string,
  acceptedMimeTypes: string[]
): boolean {
  if (!acceptedMimeTypes.length) return true;

  for (const accepted of acceptedMimeTypes) {
    if (accepted.endsWith('/*')) {
      if (mimeType.startsWith(accepted.slice(0, -1))) return true;
    } else if (mimeType === accepted) {
      return true;
    }
  }

  return false;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function normalizeComposerValues(
  values: Partial<EmailComposerFormValues>,
  showCcField: boolean,
  showBccField: boolean
): EmailComposerFormValues {
  return {
    to: values.to ?? [],
    cc: showCcField ? values.cc ?? [] : [],
    bcc: showBccField ? values.bcc ?? [] : [],
    subject: values.subject ?? '',
    bodyHtml: values.bodyHtml ?? '',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmailComposerForm({
  context,
  initialDraft,
  recipientOptions,
  attachmentConstraints,
  draftAutoSaveDebounceMs,
  submitting,
  onClose,
  onSubmit,
  onDraftChange,
  onDraftAutoSaveRequested,
  audioDictation,
  dictationTooltip,
}: EmailComposerFormProps) {
  const { token } = theme.useToken();
  const toast = useToast();

  const form = useForm<EmailComposerFormValues>({
    resolver: zodResolver(emailComposerFormSchema),
    defaultValues: {
      to: initialDraft?.to ?? [],
      cc: initialDraft?.cc ?? [],
      bcc: initialDraft?.bcc ?? [],
      subject: initialDraft?.subject ?? '',
      bodyHtml: initialDraft?.bodyHtml ?? '',
    },
  });

  const { control, handleSubmit, getValues, setValue } = form;
  const toValue = useWatch({ control, name: 'to' });
  const ccValue = useWatch({ control, name: 'cc' });
  const bccValue = useWatch({ control, name: 'bcc' });
  const subjectValue = useWatch({ control, name: 'subject' });
  const bodyHtmlValue = useWatch({ control, name: 'bodyHtml' });

  const [showCcField, setShowCcField] = useState(
    Boolean(initialDraft?.cc?.length)
  );
  const [showBccField, setShowBccField] = useState(
    Boolean(initialDraft?.bcc?.length)
  );

  // Chip-bar attachment state — controlled by parent, displayed by RTE
  const [chipAttachments, setChipAttachments] = useState<
    FileAttachmentAttributes[]
  >([]);
  // Stores actual File objects keyed by their blob URL
  const attachmentFilesRef = useRef<Map<string, File>>(new Map());

  // -------------------------------------------------------------------------
  // Attachment handlers
  // -------------------------------------------------------------------------

  const handleAttachmentUpload = async (
    file: File
  ): Promise<UploadResponse> => {
    if (chipAttachments.length >= attachmentConstraints.maxFiles) {
      toast.warning(
        `You can attach up to ${attachmentConstraints.maxFiles} files.`
      );
      throw new Error('Max attachments exceeded');
    }

    if (file.size > attachmentConstraints.maxFileSizeBytes) {
      toast.warning(
        `${file.name} exceeds ${formatFileSize(
          attachmentConstraints.maxFileSizeBytes
        )}.`
      );
      throw new Error('File too large');
    }

    if (!isMimeAccepted(file.type, attachmentConstraints.acceptedMimeTypes)) {
      toast.warning(`${file.name} has an unsupported file type.`);
      throw new Error('Unsupported file type');
    }

    const url = URL.createObjectURL(file);
    attachmentFilesRef.current.set(url, file);
    return {
      url,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    };
  };

  const handleAttachmentAdd = (attachment: FileAttachmentAttributes) => {
    setChipAttachments((prev) => [...prev, attachment]);
  };

  const handleAttachmentRemove = (attachment: FileAttachmentAttributes) => {
    setChipAttachments((prev) => prev.filter((a) => a.url !== attachment.url));
    attachmentFilesRef.current.delete(attachment.url);
  };

  // -------------------------------------------------------------------------
  // Draft helpers
  // -------------------------------------------------------------------------

  const debouncedDraftChange = useDebouncedCallback(
    (draftValues: EmailComposerFormValues) => {
      if (!onDraftChange) return;
      const draft = toDraftInput(
        draftValues,
        [...attachmentFilesRef.current.values()],
        context
      );
      void onDraftChange(draft, context);
    },
    draftAutoSaveDebounceMs
  );

  useEffect(() => {
    const normalizedValues = normalizeComposerValues(
      {
        to: toValue,
        cc: ccValue,
        bcc: bccValue,
        subject: subjectValue,
        bodyHtml: bodyHtmlValue,
      },
      showCcField,
      showBccField
    );

    debouncedDraftChange(normalizedValues);
  }, [
    toValue,
    ccValue,
    bccValue,
    subjectValue,
    bodyHtmlValue,
    showCcField,
    showBccField,
    chipAttachments,
    debouncedDraftChange,
  ]);

  const triggerAutoSave = () => {
    if (!onDraftAutoSaveRequested) return;
    const normalizedValues = normalizeComposerValues(
      getValues(),
      showCcField,
      showBccField
    );
    const draft = toDraftInput(
      normalizedValues,
      [...attachmentFilesRef.current.values()],
      context
    );
    void onDraftAutoSaveRequested(draft, context);
  };

  const handleFormSubmit = async (formValues: EmailComposerFormValues) => {
    const normalizedValues = normalizeComposerValues(
      formValues,
      showCcField,
      showBccField
    );
    const draft = toDraftInput(
      normalizedValues,
      [...attachmentFilesRef.current.values()],
      context
    );
    await onSubmit(draft);
  };

  const handleClose = () => {
    triggerAutoSave();
    onClose();
  };

  const selectOptions = recipientOptions.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const toggleCcField = () => {
    const nextShowCcField = !showCcField;
    setShowCcField(nextShowCcField);

    if (!nextShowCcField) {
      setValue('cc', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  const toggleBccField = () => {
    const nextShowBccField = !showBccField;
    setShowBccField(nextShowBccField);

    if (!nextShowBccField) {
      setValue('bcc', [], { shouldDirty: true, shouldValidate: true });
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <FormProvider {...form}>
      <Form
        layout="vertical"
        onFinish={(e) => void handleSubmit(handleFormSubmit)(e)}
        onBlurCapture={triggerAutoSave}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Flex gap="middle">
            <FormSelect
              name="to"
              control={control}
              label="To"
              required
              mode="tags"
              maxTagCount="responsive"
              options={selectOptions}
              placeholder="Add recipients"
              maxTagPlaceholder={(omittedValues) => (
                <Tooltip
                  styles={{ root: { pointerEvents: 'none' } }}
                  title={omittedValues.map(({ label }) => label).join(', ')}
                >
                  <span>+{omittedValues.length}</span>
                </Tooltip>
              )}
            />

            <Flex align="center" gap="middle">
              <AppButton
                style={{ padding: 0, background: 'transparent' }}
                type={showCcField ? 'link' : 'text'}
                icon="Cc"
                onClick={toggleCcField}
              />
              <AppButton
                style={{ padding: 0, background: 'transparent' }}
                type={showBccField ? 'link' : 'text'}
                icon="Bcc"
                onClick={toggleBccField}
              />
            </Flex>
          </Flex>

          {showCcField && (
            <FormSelect
              name="cc"
              control={control}
              label="Cc"
              mode="tags"
              options={selectOptions}
              placeholder="Add Cc recipients"
            />
          )}

          {showBccField && (
            <FormSelect
              name="bcc"
              control={control}
              label="Bcc"
              mode="tags"
              options={selectOptions}
              placeholder="Add Bcc recipients"
            />
          )}

          <FormInput
            name="subject"
            control={control}
            label="Subject"
            required
            placeholder="Enter subject"
          />

          <FormRichTextEditor
            name="bodyHtml"
            label="Message"
            control={control}
            minHeight={token.controlHeightLG * 5}
            required
            enableLinks
            enableInlineUploads
            enableLists
            enableTextAlignment
            enableHeadings
            enableUndo
            showToolbar
            enableAttachments
            toolbarPosition="top"
            attachments={chipAttachments}
            onAttachmentAdd={handleAttachmentAdd}
            onAttachmentRemove={handleAttachmentRemove}
            onAttachmentUpload={handleAttachmentUpload}
            onDropRejected={(_file, reason) => toast.error(reason)}
            audioDictation={audioDictation}
            dictationTooltip={dictationTooltip}
          />
        </div>

        {/* Sticky footer */}
        <div
          style={{
            paddingTop: token.paddingSM,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            flexShrink: 0,
          }}
        >
          <Flex justify="end" gap={token.marginXS}>
            <AppButton danger onClick={handleClose} disabled={submitting}>
              Cancel
            </AppButton>
            <AppButton type="primary" htmlType="submit" loading={submitting}>
              Send
            </AppButton>
          </Flex>
        </div>
      </Form>
    </FormProvider>
  );
}
