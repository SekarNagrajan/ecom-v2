import './rich-text-editor.css';

import CharacterCount from '@tiptap/extension-character-count';
import { FileHandler } from '@tiptap/extension-file-handler';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Tiptap, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { theme } from 'antd';
import { useEffect, useRef, type CSSProperties } from 'react';

import { useDebouncedCallback } from '../../../hooks/use-debounced-callback';
import { cn } from '../../../utils/cn';
import { sanitizeHtml } from '../../../utils/html-sanitizer';
import { AudioDictationButton } from '../audio-dictation-button';
import { GrammarImproveButton } from '../grammar-improve-button';
import { ToneRewriteButton } from '../tone-rewrite-button';
import { AttachmentChipBar } from './attachment-chip-bar';
import { EditorFooter } from './editor-footer';
import { DEFAULT_TOOLBAR_OPTIONS, EditorToolbar } from './editor-toolbar';
import { CustomImage, FileAttachment, UploadPlaceholder } from './extensions';
import { useEditorTheme } from './hooks';
import { useEditorDropZone } from './hooks/use-editor-drop-zone';
import { useEditorFileUploads } from './hooks/use-editor-file-uploads';
import type { RichTextEditorProps, ToolbarOption } from './types';
import { resolveAcceptedMimeTypes, serializeContent } from './utils';

interface RichTextEditorCssVars extends CSSProperties {
  '--rte-border-color'?: string;
  '--rte-border-radius'?: string;
  '--rte-border-radius-sm'?: string;
  '--rte-color-border'?: string;
  '--rte-color-fill-quaternary'?: string;
  '--rte-color-fill-tertiary'?: string;
  '--rte-color-link'?: string;
  '--rte-color-link-hover'?: string;
  '--rte-color-primary'?: string;
  '--rte-color-primary-bg'?: string;
  '--rte-color-primary-border'?: string;
  '--rte-color-primary-text'?: string;
  '--rte-color-success'?: string;
  '--rte-color-success-bg'?: string;
  '--rte-color-success-border'?: string;
  '--rte-color-success-text'?: string;
  '--rte-color-text'?: string;
  '--rte-color-text-placeholder'?: string;
  '--rte-color-text-secondary'?: string;
  '--rte-content-padding-block'?: string;
  '--rte-content-padding-inline'?: string;
  '--rte-font-size-sm'?: string;
  '--rte-margin-xs'?: string;
  '--rte-margin-sm'?: string;
  '--rte-padding-xxs'?: string;
  '--rte-padding-xs'?: string;
  '--rte-padding-sm'?: string;
}

function cleanDividers(options: ToolbarOption[]): ToolbarOption[] {
  const result: ToolbarOption[] = [];
  for (const opt of options) {
    if (
      opt === 'divider' &&
      (result.length === 0 || result[result.length - 1] === 'divider')
    ) {
      continue;
    }
    result.push(opt);
  }
  if (result[result.length - 1] === 'divider') result.pop();
  return result;
}

/**
 * Base RichTextEditor component using Tiptap Composable API
 * This component is independent of React Hook Form and can be used standalone
 */
export function RichTextEditor({
  value,
  onChange,
  outputFormat = 'html',
  placeholder,
  readOnly = false,
  disabled = false,
  enableLinks = true,
  enableInlineUploads = false,
  enableAttachments = false,
  enableHeadings = true,
  enableLists = true,
  enableTextAlignment = true,
  enableUndo = true,
  attachments = [],
  onAttachmentAdd,
  onAttachmentRemove,
  toolbarOptions,
  toolbarPosition = 'top',
  showToolbar = true,
  onInlineUpload,
  onAttachmentUpload,
  inlineUploadLabel,
  attachmentUploadLabel,
  renderInlineImage,
  renderInlineFile,
  onAttachmentDownload,
  renderAttachmentBar,
  onDropRejected,
  characterLimit,
  maxFileSize = 10 * 1024 * 1024,
  maxInlineUploadSize = 5 * 1024 * 1024,
  inlineImageDisplay,
  inlineAllowedTypes,
  attachmentAllowedTypes,
  acceptedFileTypes,
  acceptedInlineTypes,
  showCharacterCount = false,
  showWordCount = false,
  className,
  style,
  height,
  minHeight = '200px',
  id,
  ariaLabel,
  ariaDescribedBy,
  autoComplete,
  editorRef,
  audioDictation,
  dictationTooltip,
  dictationRecordingTooltip,
  dictationTranscribingTooltip,
  grammarImprove,
  grammarImproveTooltip,
  toneRewrite,
  toneRewriteTooltip,
}: RichTextEditorProps) {
  const { token } = theme.useToken();
  const editorTheme = useEditorTheme();
  const editorCssVars: RichTextEditorCssVars = {
    '--rte-border-color': editorTheme.fieldBorderColor,
    '--rte-border-radius': `${token.borderRadiusLG}px`,
    '--rte-border-radius-sm': `${token.borderRadius}px`,
    '--rte-color-border': token.colorBorder,
    '--rte-color-fill-quaternary': token.colorFillQuaternary,
    '--rte-color-fill-tertiary': token.colorFillTertiary,
    '--rte-color-link': token.colorLink,
    '--rte-color-link-hover': token.colorLinkHover,
    '--rte-color-primary': token.colorPrimary,
    '--rte-color-primary-bg': token.colorPrimaryBg,
    '--rte-color-primary-border': token.colorPrimaryBorder,
    '--rte-color-primary-text': token.colorPrimaryText,
    '--rte-color-success': token.colorSuccess,
    '--rte-color-success-bg': token.colorSuccessBg,
    '--rte-color-success-border': token.colorSuccessBorder,
    '--rte-color-success-text': token.colorSuccessText,
    '--rte-color-text': token.colorText,
    '--rte-color-text-placeholder': token.colorTextPlaceholder,
    '--rte-color-text-secondary': token.colorTextSecondary,
    '--rte-content-padding-block': `${token.paddingSM}px`,
    '--rte-content-padding-inline': `${token.padding}px`,
    '--rte-font-size-sm': `${token.fontSizeSM}px`,
    '--rte-margin-xs': `${token.marginXS}px`,
    '--rte-margin-sm': `${token.marginSM}px`,
    '--rte-padding-xxs': `${token.paddingXXS}px`,
    '--rte-padding-xs': `${token.paddingXS}px`,
    '--rte-padding-sm': `${token.paddingSM}px`,
  };

  const resolvedAcceptedInlineTypes = resolveAcceptedMimeTypes({
    allowedTypes: inlineAllowedTypes,
    acceptedTypes: acceptedInlineTypes,
  });
  const resolvedAcceptedFileTypes = resolveAcceptedMimeTypes({
    allowedTypes: attachmentAllowedTypes,
    acceptedTypes: acceptedFileTypes,
  });

  const includeInlineFileAttachment = enableInlineUploads || enableAttachments;
  const {
    uploadingFiles,
    chipUploadCallbacks,
    hasFileHandlers,
    canHandleContentDrops,
    canHandleAttachmentDrops,
    processChipAttachment,
    routeFileFromEditor,
  } = useEditorFileUploads({
    enableInlineUploads,
    enableAttachments,
    onInlineUpload,
    onAttachmentUpload,
    onAttachmentAdd,
    onDropRejected,
    maxFileSize,
    maxInlineUploadSize,
    inlineImageDisplay,
    acceptedFileTypes: resolvedAcceptedFileTypes,
    acceptedInlineTypes: resolvedAcceptedInlineTypes,
  });

  // Debounce onChange to prevent excessive re-renders
  const debouncedOnChange = useDebouncedCallback((content: string) => {
    onChange?.(content);
  }, 300);

  // Stable ref so the FileHandler ProseMirror plugin always calls the latest
  // version — useEditor does not re-apply extensions on re-renders. Synced
  // via effect to avoid mutating the ref during render.
  const routeFileRef = useRef(routeFileFromEditor);
  useEffect(() => {
    routeFileRef.current = routeFileFromEditor;
  }, [routeFileFromEditor]);

  // ---------------------------------------------------------------------------
  // Extensions
  // ---------------------------------------------------------------------------

  const extensions = [
    StarterKit.configure({
      heading: enableHeadings ? undefined : false,
      bulletList: enableLists ? undefined : false,
      orderedList: enableLists ? undefined : false,
      link: false,
      underline: false,
      ...(enableUndo ? {} : { history: false }),
    }),
    Underline,
    Placeholder.configure({
      placeholder: placeholder || 'Start typing...',
    }),
    CharacterCount.configure({
      limit: characterLimit,
    }),
    ...(enableLinks
      ? [
          Link.configure({
            openOnClick: readOnly,
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          }),
        ]
      : []),
    ...(enableInlineUploads
      ? [
          CustomImage.configure({
            inline: true,
            allowBase64: false,
            HTMLAttributes: {
              loading: 'lazy',
            },
            inlineImageDisplay,
            renderInlineImage,
          }),
        ]
      : []),
    ...(enableTextAlignment
      ? [
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
        ]
      : []),
    ...(includeInlineFileAttachment
      ? // Modified by Sekar Nagarajan (2026-08-04 11:10)
        [
          FileAttachment.configure({
            renderInlineFile,
            onDownloadFile: onAttachmentDownload,
          }),
        ]
      : []),
    UploadPlaceholder,
    ...(hasFileHandlers
      ? [
          FileHandler.configure({
            onPaste: (currentEditor, files) => {
              for (const file of files) {
                routeFileRef.current(
                  currentEditor,
                  file,
                  currentEditor.state.selection.from
                );
              }
            },
          }),
        ]
      : []),
  ];

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions,
    content: sanitizeHtml(value),
    editable: !readOnly && !disabled,
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) {
        debouncedOnChange('');
        return;
      }
      const content = serializeContent(editor, outputFormat);
      debouncedOnChange(content);
    },
    editorProps: {
      attributes: {
        class: cn('rich-text-editor-content', editorTheme.contentClass),
        'aria-label': ariaLabel || 'Rich text editor',
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
        style: `font-family: ${token.fontFamily}; color: ${token.colorText};`,
        ...(id ? { id } : {}),
        ...(autoComplete ? { autocomplete: autoComplete } : {}),
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = serializeContent(editor, outputFormat);
      if (currentContent !== value) {
        const sanitizedValue = sanitizeHtml(value);
        editor.commands.setContent(sanitizedValue);
      }
    }
  }, [value, editor, outputFormat]);

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  const disabledOptions = new Set<ToolbarOption>();
  if (!enableHeadings) disabledOptions.add('h1').add('h2').add('h3');
  if (!enableLists) disabledOptions.add('bulletList').add('orderedList');
  if (!enableTextAlignment)
    disabledOptions
      .add('alignLeft')
      .add('alignCenter')
      .add('alignRight')
      .add('alignJustify');
  if (!enableLinks) disabledOptions.add('link');
  if (!enableInlineUploads) disabledOptions.add('image');
  if (!enableAttachments) disabledOptions.add('file');
  if (!enableUndo) disabledOptions.add('undo').add('redo');

  const effectiveToolbarOptions =
    disabledOptions.size > 0
      ? cleanDividers(
          (toolbarOptions ?? DEFAULT_TOOLBAR_OPTIONS).filter(
            (opt) => !disabledOptions.has(opt)
          )
        )
      : toolbarOptions;

  const toolbarProps = {
    options: effectiveToolbarOptions,
    enableInlineUploads,
    enableAttachments,
    onAttachmentUpload,
    maxFileSize,
    acceptedInlineTypes: resolvedAcceptedInlineTypes,
    acceptedFileTypes: resolvedAcceptedFileTypes,
    onInlineFileSelect:
      canHandleContentDrops && editor
        ? (file: File) => {
            routeFileFromEditor(editor, file, editor.state.selection.from);
          }
        : undefined,
    onAttachmentAdd,
    chipUploadCallbacks,
    inlineUploadLabel,
    attachmentUploadLabel,
  } as const;

  const showChipBar =
    enableAttachments && (attachments.length > 0 || uploadingFiles.length > 0);

  // Visual drag indicators + drop handling.
  // - Content drops are handled here for deterministic routing.
  // - Clipboard paste is still handled by FileHandler.
  const {
    containerProps: dropProps,
    isDragging,
    activeZone,
  } = useEditorDropZone({
    onDropAttachment: canHandleAttachmentDrops
      ? (file) => processChipAttachment(file)
      : undefined,
    onDropContent:
      canHandleContentDrops && editor
        ? (files, event) => {
            const dropPos =
              editor.view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })?.pos ?? editor.state.selection.from;

            for (const file of files) {
              routeFileFromEditor(editor, file, dropPos);
            }
          }
        : undefined,
    disabled: readOnly || disabled,
    hasFileHandlers,
  });

  const showAttachmentOverlay = isDragging && canHandleAttachmentDrops;

  const dictationEnabled =
    audioDictation !== undefined && !readOnly && !disabled;
  const grammarEnabled = grammarImprove !== undefined && !readOnly && !disabled;
  const toneRewriteEnabled =
    toneRewrite !== undefined && !readOnly && !disabled;

  const handleDictationResult = (text: string) => {
    if (!editor) return;
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    // When the editor is empty, drop the transcript straight into the first
    // paragraph so we don't leave a stray empty line at the top. Otherwise
    // append it as a new paragraph at the end of the document.
    if (editor.isEmpty) {
      editor.chain().focus('end').insertContent(trimmed).run();
      return;
    }

    editor
      .chain()
      .focus('end')
      .insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }],
      })
      .run();
  };

  const handleGrammarResult = (correctedText: string) => {
    if (!editor) return;
    const correctedHtml = correctedText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => `<p>${line}</p>`)
      .join('');
    editor.commands.setContent(correctedHtml);
  };

  const handleToneRewriteResult = (rewrittenHtml: string) => {
    if (!editor) return;
    const sanitized = sanitizeHtml(rewrittenHtml);
    editor.commands.setContent(sanitized);
  };

  return (
    <Tiptap editor={editor}>
      <div
        className={cn(
          'rich-text-editor rte-drop-container',
          dictationEnabled && 'rte-dictation-enabled',
          className
        )}
        style={{ ...editorCssVars, ...style, position: 'relative' }}
        {...dropProps}
      >
        {showToolbar && !readOnly && toolbarPosition === 'top' && (
          <EditorToolbar {...toolbarProps} />
        )}

        {/* Position-relative shell around the editor content so the
            dictation mic anchors to the content area only — never overlapping
            the toolbar (top or bottom) or footer. */}
        <div style={{ position: 'relative' }}>
          <div
            className={cn(
              'rich-text-editor-wrapper rte-drop-zone',
              isDragging && canHandleContentDrops && 'rte-content-drop-hint',
              isDragging &&
                canHandleContentDrops &&
                activeZone === 'content' &&
                'rte-content-drop-active'
            )}
            data-drop-zone="content"
            style={{
              height,
              minHeight,
              ...editorTheme.wrapperStyle,
              overflow: 'auto',
            }}
          >
            <Tiptap.Content />
          </div>

          {dictationEnabled || grammarEnabled || toneRewriteEnabled ? (
            <div
              style={{
                position: 'absolute',
                bottom: token.paddingXS,
                right: token.paddingXS,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: token.paddingXXS,
              }}
            >
              {toneRewriteEnabled ? (
                <ToneRewriteButton
                  toneRewrite={toneRewrite}
                  currentValue={value ?? ''}
                  onResult={handleToneRewriteResult}
                  tooltip={toneRewriteTooltip}
                  iconOnly
                />
              ) : null}
              {grammarEnabled ? (
                <GrammarImproveButton
                  grammarImprove={grammarImprove}
                  currentValue={value ?? ''}
                  onResult={handleGrammarResult}
                  tooltip={grammarImproveTooltip}
                  iconOnly
                />
              ) : null}
              {dictationEnabled ? (
                <AudioDictationButton
                  audioDictation={audioDictation}
                  onResult={handleDictationResult}
                  tooltip={dictationTooltip}
                  recordingTooltip={dictationRecordingTooltip}
                  transcribingTooltip={dictationTranscribingTooltip}
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rte-drop-zone" data-drop-zone="attachment">
          {showChipBar &&
            (renderAttachmentBar ? (
              renderAttachmentBar({
                attachments,
                uploadingFiles,
                onRemove: onAttachmentRemove,
                readOnly,
              })
            ) : (
              <AttachmentChipBar
                attachments={attachments}
                uploadingFiles={uploadingFiles}
                onRemove={onAttachmentRemove}
                onDownload={onAttachmentDownload}
                readOnly={readOnly}
              />
            ))}
          {showAttachmentOverlay && (
            <div
              className={cn(
                'rte-drop-overlay rte-drop-overlay--attachment',
                'rte-drop-overlay--visible',
                activeZone === 'attachment' && 'rte-drop-overlay--active'
              )}
              style={
                !showChipBar
                  ? { position: 'relative', minHeight: 48 }
                  : undefined
              }
            >
              <span className="rte-drop-overlay-label">Drop to attach</span>
            </div>
          )}
        </div>

        {showToolbar && !readOnly && toolbarPosition === 'bottom' && (
          <EditorToolbar {...toolbarProps} />
        )}

        {(showCharacterCount || showWordCount) && (
          <EditorFooter
            showCharacterCount={showCharacterCount}
            showWordCount={showWordCount}
            characterLimit={characterLimit}
          />
        )}
      </div>
    </Tiptap>
  );
}
