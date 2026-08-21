import { zodResolver } from '@hookform/resolvers/zod';
import { useTiptap } from '@tiptap/react';
import { Flex } from 'antd';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormInput } from '../../form-fields/form-input';
import { AppButton } from '../button';
import { AppModal } from '../dialog';
import type { LinkModalProps } from './types';

const linkSchema = z.object({
  url: z.url('Please enter a valid URL'),
  text: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

export function LinkModal({
  open,
  onClose,
  initialUrl = '',
  initialText = '',
}: LinkModalProps) {
  const { editor } = useTiptap();

  const isEditing = !!initialUrl;
  const hasSelection = !!initialText;

  const { control, handleSubmit } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    values: { url: initialUrl, text: initialText },
  });

  const onSubmit = (data: LinkFormData) => {
    if (!editor || !data.url) return;

    const { empty } = editor.state.selection;
    const isOnLink = editor.isActive('link');

    if (empty && !isOnLink) {
      // No selection, not on existing link → insert new text with link mark
      const displayText = data.text || data.url;
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: displayText,
          marks: [{ type: 'link', attrs: { href: data.url } }],
        })
        .run();
    } else if (isOnLink) {
      // Cursor is on an existing link → extend to full link range before updating
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: data.url })
        .run();
    } else {
      // Text selected, applying new link to selection
      editor.chain().focus().setLink({ href: data.url }).run();
    }

    onClose();
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  // Only show "Display Text" field for fresh inserts (no selection, no existing link)
  const showTextField = !isEditing && !hasSelection;

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      title={isEditing ? 'Edit Link' : 'Insert Link'}
      footer={
        <Flex justify="end" gap={8}>
          {isEditing && (
            <AppButton
              onClick={handleRemoveLink}
              danger
              style={{ marginRight: 'auto' }}
            >
              Remove Link
            </AppButton>
          )}
          <AppButton onClick={onClose}>Cancel</AppButton>
          <AppButton type="primary" onClick={handleSubmit(onSubmit)}>
            {isEditing ? 'Update' : 'Insert'}
          </AppButton>
        </Flex>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex vertical gap={12}>
          <FormInput
            name="url"
            control={control}
            label="URL"
            placeholder="https://example.com"
            required
            autoComplete="url"
          />

          {showTextField && (
            <FormInput
              name="text"
              control={control}
              label="Display Text"
              placeholder="Optional — uses the URL if left empty"
            />
          )}
        </Flex>
      </form>
    </AppModal>
  );
}
