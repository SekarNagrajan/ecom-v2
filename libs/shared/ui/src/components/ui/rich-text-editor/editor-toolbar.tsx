import { LinkOutlined } from '@ant-design/icons';
import { useTiptap } from '@tiptap/react';
import { Divider, Space, Tooltip, theme } from 'antd';
import { useState } from 'react';

import { AppButton } from '../button';
import { LinkModal } from './link-modal';
import {
  FileUploadButton,
  InlineUploadButton,
  TOOLBAR_BUTTON_MAP,
  ToolbarButton,
} from './toolbar';
import type { EditorToolbarProps, ToolbarOption } from './types';

type EditorToken = ReturnType<typeof theme.useToken>['token'] & {
  colorFieldBg?: string;
  colorFieldBorder?: string;
};

export const DEFAULT_TOOLBAR_OPTIONS: ToolbarOption[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'divider',
  'h1',
  'h2',
  'h3',
  'divider',
  'bulletList',
  'orderedList',
  'divider',
  'alignLeft',
  'alignCenter',
  'alignRight',
  'divider',
  'link',
  'image',
  'file',
  'divider',
  'undo',
  'redo',
];

interface LinkModalState {
  open: boolean;
  initialUrl: string;
  initialText: string;
}

const LINK_MODAL_CLOSED: LinkModalState = {
  open: false,
  initialUrl: '',
  initialText: '',
};

export function EditorToolbar({
  options,
  enableInlineUploads = false,
  enableAttachments = false,
  onInlineFileSelect,
  onAttachmentUpload,
  maxFileSize,
  acceptedInlineTypes,
  acceptedFileTypes,
  onAttachmentAdd,
  chipUploadCallbacks,
  inlineUploadLabel,
  attachmentUploadLabel,
}: EditorToolbarProps) {
  const { token } = theme.useToken();
  const editorToken = token as EditorToken;
  const { editor } = useTiptap();
  const [linkModal, setLinkModal] = useState<LinkModalState>(LINK_MODAL_CLOSED);

  if (!editor) return null;

  const toolbarOptions = options || DEFAULT_TOOLBAR_OPTIONS;

  const handleLinkClick = () => {
    const { from, to, empty } = editor.state.selection;
    const isOnLink = editor.isActive('link');
    const linkUrl = isOnLink
      ? (editor.getAttributes('link').href as string) || ''
      : '';
    const selectedText = !empty
      ? editor.state.doc.textBetween(from, to, ' ')
      : '';

    setLinkModal({
      open: true,
      initialUrl: linkUrl,
      initialText: selectedText,
    });
  };

  const renderOption = (option: ToolbarOption, index: number) => {
    const key = `${option}-${index}`;

    if (option === 'divider') {
      return (
        <Divider
          key={key}
          orientation="vertical"
          style={{ margin: `0 ${token.marginXS}px` }}
        />
      );
    }

    if (option === 'link') {
      return (
        <Tooltip title="Insert Link" key={key}>
          <AppButton
            type={editor.isActive('link') ? 'primary' : 'text'}
            icon={<LinkOutlined />}
            onClick={handleLinkClick}
            size="small"
            aria-label="Insert Link"
            aria-pressed={editor.isActive('link')}
          />
        </Tooltip>
      );
    }

    if (option === 'image') {
      if (!enableInlineUploads || !onInlineFileSelect) return null;
      return (
        <InlineUploadButton
          key={key}
          acceptedInlineTypes={acceptedInlineTypes}
          onSelect={onInlineFileSelect}
          label={inlineUploadLabel}
        />
      );
    }

    if (option === 'file') {
      if (!enableAttachments || !onAttachmentUpload) return null;
      return (
        <FileUploadButton
          key={key}
          editor={editor}
          onUpload={onAttachmentUpload}
          maxSize={maxFileSize}
          acceptedTypes={acceptedFileTypes}
          onAttachmentAdd={onAttachmentAdd}
          chipUploadCallbacks={chipUploadCallbacks}
          label={attachmentUploadLabel}
        />
      );
    }

    const config = TOOLBAR_BUTTON_MAP[option];
    if (!config) return null;
    return <ToolbarButton key={key} config={config} editor={editor} />;
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: token.marginXS,
          padding: token.paddingSM,
          backgroundColor: editorToken.colorFieldBg ?? token.colorBgContainer,
          borderColor:
            editorToken.colorFieldBorder ?? token.colorBorderSecondary,
          borderRadius: token.borderRadiusLG,
          borderWidth: token.lineWidth,
          borderStyle: 'solid',
          marginBottom: token.marginSM,
        }}
      >
        <Space size="small" wrap>
          {toolbarOptions.map(renderOption)}
        </Space>
      </div>

      <LinkModal
        open={linkModal.open}
        onClose={() => setLinkModal(LINK_MODAL_CLOSED)}
        initialUrl={linkModal.initialUrl}
        initialText={linkModal.initialText}
      />
    </>
  );
}
