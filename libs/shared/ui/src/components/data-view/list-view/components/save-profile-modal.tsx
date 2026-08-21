import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Flex, Form, Typography, theme } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormInput } from '../../../form-fields/form-input';
import { FormTextarea } from '../../../form-fields/form-textarea';
import { AppButton } from '../../../ui/button';
import { AppModal } from '../../../ui/dialog';
import type { SaveProfileModalProps } from './types';

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function SaveProfileModal(props: SaveProfileModalProps) {
  const { open, onCancel, onConfirmCreate, onConfirmEdit } = props;
  const { token } = theme.useToken();

  const isEdit = props.mode === 'edit';

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: isEdit ? props.profile.name : '',
      description: isEdit ? props.profile.description ?? '' : '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
  } = methods;

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onCancel();
  };

  const submit = handleSubmit(async (values) => {
    const trimmedDescription = values.description?.trim();
    try {
      if (isEdit) {
        await onConfirmEdit({
          id: props.profile.id,
          name: values.name.trim(),
          description: trimmedDescription || undefined,
        });
      } else {
        await onConfirmCreate({
          name: values.name.trim(),
          description: trimmedDescription || undefined,
        });
      }
      reset();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : isEdit
          ? 'Failed to update the view. Please try again.'
          : 'Failed to save the view. Please try again.';
      setError('root', { type: 'server', message });
    }
  });

  return (
    <AppModal
      title={isEdit ? 'Rename view' : 'Save as new view'}
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      maskClosable={!isSubmitting}
      closable={!isSubmitting}
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <AppButton onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            onClick={() => void submit()}
            loading={isSubmitting}
          >
            {isEdit ? 'Update' : 'Save'}
          </AppButton>
        </Flex>
      }
    >
      <FormProvider {...methods}>
        <Form
          layout="vertical"
          onFinish={() => void submit()}
          style={{ marginTop: token.marginSM }}
        >
          {!isEdit && (
            <Typography.Paragraph
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                marginBottom: token.marginSM,
              }}
            >
              Saves your current filters, sorting, and column layout as a new
              view. You can switch back to it any time from the chip bar.
            </Typography.Paragraph>
          )}
          <FormInput<ProfileFormValues>
            name="name"
            label="Name"
            required
            placeholder="e.g., Finance View, Q4 Report"
            autoFocus
            maxLength={200}
          />
          <FormTextarea<ProfileFormValues>
            name="description"
            label="Description"
            placeholder="Optional context for this saved view"
            rows={3}
            maxLength={500}
            showCount
            // Extra bottom margin so the textarea's `showCount` counter
            // doesn't visually crowd the modal footer's Save/Cancel buttons.
            formItemProps={{ style: { marginBottom: token.marginLG } }}
          />
          {errors.root?.message && (
            <Alert
              type="error"
              title={errors.root.message}
              showIcon
              style={{ marginTop: token.marginXS }}
            />
          )}
        </Form>
      </FormProvider>
    </AppModal>
  );
}
