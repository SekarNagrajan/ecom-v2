import type { Meta, StoryObj } from '@storybook/react';
import { Alert, Button, Space, theme, Typography } from 'antd';
import { useState } from 'react';

import { RichTextEditor } from './rich-text-editor';
import type {
  FileAttachmentAttributes,
  RichTextEditorProps,
  UploadResponse,
} from './types';

const { Text } = Typography;

/* -------------------------------------------------------------------------- */
/* Mock Upload Handlers                                                       */
/* -------------------------------------------------------------------------- */

/** Simulates a slow inline upload (~3s) with granular progress reporting */
const mockInlineUpload = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  const steps = [5, 15, 30, 45, 60, 75, 85, 95, 100];
  for (const pct of steps) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    onProgress?.(pct);
  }

  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

/** Simulates a slow attachment upload (~4s) with granular progress reporting */
const mockAttachmentUpload = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  for (let i = 0; i <= 100; i += 5) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress?.(i);
  }

  return {
    url: `https://example.com/files/${encodeURIComponent(file.name)}`,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

/** Simulates a very slow upload (~8s) to really see the progress bar in action */
const mockSlowUpload = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  for (let i = 0; i <= 100; i += 2) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    onProgress?.(i);
  }

  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

/** Simulates an upload that fails at ~60% to test error handling */
const mockFailingUpload = async (
  _file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  for (let i = 0; i <= 60; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    onProgress?.(i);
  }
  throw new Error('Simulated server error: upload failed');
};

/** Simulates an upload with no progress reporting (indeterminate) */
const mockNoProgressUpload = async (file: File): Promise<UploadResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

/* -------------------------------------------------------------------------- */
/* Wrapper Component                                                          */
/* -------------------------------------------------------------------------- */

const EditorWrapper = (
  props: Partial<RichTextEditorProps> & { showAttachments?: boolean }
) => {
  const [content, setContent] = useState(props.value || '');
  const [attachments, setAttachments] = useState<FileAttachmentAttributes[]>(
    props.attachments ?? []
  );
  const { token } = theme.useToken();

  const chipProps = {
    attachments,
    onAttachmentAdd: (att: FileAttachmentAttributes) =>
      setAttachments((prev) => [...prev, att]),
    onAttachmentRemove: (att: FileAttachmentAttributes) =>
      setAttachments((prev) => prev.filter((a) => a.url !== att.url)),
  };

  return (
    <div style={{ padding: token.padding }}>
      <RichTextEditor
        {...props}
        {...chipProps}
        value={content}
        onChange={setContent}
        onInlineUpload={props.onInlineUpload ?? mockInlineUpload}
        onAttachmentUpload={props.onAttachmentUpload ?? mockAttachmentUpload}
      />

      {props.showAttachments !== false && attachments.length > 0 && (
        <div
          style={{
            marginTop: token.marginSM,
            padding: token.paddingSM,
            backgroundColor: token.colorFillQuaternary,
            borderRadius: token.borderRadius,
            fontSize: token.fontSizeSM,
          }}
        >
          <Text strong>Attachments state ({attachments.length}):</Text>
          <pre style={{ marginTop: token.marginXS, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(
              attachments.map((a) => ({
                fileName: a.fileName,
                fileSize: a.fileSize,
                mimeType: a.mimeType,
              })),
              null,
              2
            )}
          </pre>
        </div>
      )}

      <div
        style={{
          marginTop: token.marginLG,
          padding: token.padding,
          backgroundColor: token.colorFillQuaternary,
          borderRadius: token.borderRadius,
          fontFamily: 'monospace',
          fontSize: token.fontSizeSM,
        }}
      >
        <Text strong>Content Output:</Text>
        <pre style={{ marginTop: token.marginXS, whiteSpace: 'pre-wrap' }}>
          {content || '(empty)'}
        </pre>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

/* -------------------------------------------------------------------------- */
/* Basic                                                                      */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => <EditorWrapper placeholder="Start typing..." />,
};

export const WithInitialContent: Story = {
  render: () => (
    <EditorWrapper
      value="<h1>Welcome to the Rich Text Editor</h1><p>This is a <strong>bold</strong> statement with <em>italic</em> text and a <u>underline</u>.</p><ul><li>First item</li><li>Second item</li></ul>"
      placeholder="Start typing..."
    />
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <EditorWrapper
      value="<h2>Read-Only Content</h2><p>This content cannot be edited. Links are <a href='https://example.com'>clickable</a>.</p><p><strong>Bold text</strong> and <em>italic text</em> are preserved.</p>"
      readOnly
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <EditorWrapper
      value="<p>This editor is disabled.</p>"
      disabled
      placeholder="Disabled editor..."
    />
  ),
};

export const CustomHeight: Story = {
  render: () => (
    <EditorWrapper
      placeholder="This editor has a custom height..."
      height="400px"
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Toolbar Control                                                            */
/* -------------------------------------------------------------------------- */

export const CustomToolbar: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Limited formatting options..."
      toolbarOptions={[
        'bold',
        'italic',
        'underline',
        'divider',
        'bulletList',
        'orderedList',
        'divider',
        'link',
      ]}
    />
  ),
};

export const ToolbarAtBottom: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Toolbar is at the bottom..."
      toolbarPosition="bottom"
    />
  ),
};

export const WithoutToolbar: Story = {
  render: () => (
    <EditorWrapper
      placeholder="No toolbar - keyboard shortcuts only..."
      showToolbar={false}
    />
  ),
};

export const MinimalEditor: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Minimal editor with basic formatting only..."
      enableLinks={false}
      enableInlineUploads={false}
      enableAttachments={false}
      enableHeadings={false}
      enableTextAlignment={false}
      toolbarOptions={[
        'bold',
        'italic',
        'underline',
        'divider',
        'undo',
        'redo',
      ]}
    />
  ),
};

export const TextFormattingOnly: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Text formatting only - no links, images, or files..."
      enableLinks={false}
      enableInlineUploads={false}
      enableAttachments={false}
    />
  ),
};

export const WithoutHeadings: Story = {
  render: () => (
    <EditorWrapper placeholder="No heading options..." enableHeadings={false} />
  ),
};

export const WithoutLists: Story = {
  render: () => (
    <EditorWrapper placeholder="No list options..." enableLists={false} />
  ),
};

export const WithoutAlignment: Story = {
  render: () => (
    <EditorWrapper
      placeholder="No alignment options..."
      enableTextAlignment={false}
    />
  ),
};

export const WithoutUndoRedo: Story = {
  render: () => (
    <EditorWrapper placeholder="No undo/redo..." enableUndo={false} />
  ),
};

/* -------------------------------------------------------------------------- */
/* Character / Word Count                                                     */
/* -------------------------------------------------------------------------- */

export const WithCharacterCount: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Type something... (max 200 characters)"
      showCharacterCount
      characterLimit={200}
    />
  ),
};

export const WithWordCount: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Start typing..."
      showWordCount
      showCharacterCount
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Output Formats                                                             */
/* -------------------------------------------------------------------------- */

export const JSONOutput: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Content will be output as JSON..."
      outputFormat="json"
    />
  ),
};

export const MarkdownOutput: Story = {
  render: () => (
    <EditorWrapper
      placeholder="Content will be output as Markdown..."
      outputFormat="markdown"
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Upload: Progress                                                           */
/* -------------------------------------------------------------------------- */

export const UploadWithProgress: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Upload any image or file to see the progress bar fill up in ~3-4 seconds."
        />
        <EditorWrapper
          placeholder="Try uploading an image or file..."
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const UploadSlowProgress: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Simulates a very slow upload (~8 seconds) so you can clearly observe the progress bar."
        />
        <EditorWrapper
          placeholder="Upload a file to see slow progress..."
          onInlineUpload={mockSlowUpload}
          onAttachmentUpload={mockSlowUpload}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const UploadWithoutProgress: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Upload handler does NOT report progress. The placeholder shows an indeterminate (animated) progress bar for ~3 seconds."
        />
        <EditorWrapper
          placeholder="Upload a file - no progress reporting..."
          onInlineUpload={mockNoProgressUpload}
          onAttachmentUpload={mockNoProgressUpload}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const UploadFailure: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Upload will fail at ~60% progress. The placeholder is removed and an error toast is shown."
        />
        <EditorWrapper
          placeholder="Upload a file to see it fail..."
          onInlineUpload={mockFailingUpload}
          onAttachmentUpload={mockFailingUpload}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Upload: File Type Restrictions                                             */
/* -------------------------------------------------------------------------- */

export const AcceptOnlyPDFs: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="File upload restricted to PDF only. The file picker will filter, and validation will reject non-PDF files."
        />
        <EditorWrapper
          placeholder="Attach PDF files only..."
          acceptedFileTypes={['application/pdf']}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const AcceptDocumentsOnly: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="File upload restricted to PDF, Word docs, Excel, and plain text."
        />
        <EditorWrapper
          placeholder="Attach documents only..."
          acceptedFileTypes={[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
          ]}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const AcceptOnlyPNGAndJPEG: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Image upload restricted to PNG and JPEG only. GIF and WebP will be rejected."
        />
        <EditorWrapper
          placeholder="Upload PNG or JPEG images only..."
          acceptedInlineTypes={['image/png', 'image/jpeg']}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Upload: File Size Restrictions                                             */
/* -------------------------------------------------------------------------- */

export const SmallFileSizeLimit: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="File upload limited to 50 KB. Any file larger than 50 KB will be rejected with an error toast."
        />
        <EditorWrapper
          placeholder="Try uploading a file larger than 50 KB..."
          maxFileSize={50 * 1024}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const SmallImageSizeLimit: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Image upload limited to 100 KB. Larger images will be rejected."
        />
        <EditorWrapper
          placeholder="Try uploading an image larger than 100 KB..."
          maxInlineUploadSize={100 * 1024}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Upload: Combined Restrictions                                              */
/* -------------------------------------------------------------------------- */

export const StrictUploadPolicy: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title={
            <>
              <strong>Strict policy:</strong> Images must be PNG/JPEG and under
              200 KB. Files must be PDF and under 1 MB.
            </>
          }
        />
        <EditorWrapper
          placeholder="Strict upload policy active..."
          acceptedInlineTypes={['image/png', 'image/jpeg']}
          maxInlineUploadSize={200 * 1024}
          acceptedFileTypes={['application/pdf']}
          maxFileSize={1024 * 1024}
          toolbarOptions={[
            'bold',
            'italic',
            'underline',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Interactive Demo                                                           */
/* -------------------------------------------------------------------------- */

const InteractiveDemoComponent = () => {
  const [content, setContent] = useState('<p>Edit me!</p>');
  const [readOnly, setReadOnly] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const { token } = theme.useToken();

  return (
    <div style={{ padding: token.padding }}>
      <Space style={{ marginBottom: token.marginLG }}>
        <Button onClick={() => setReadOnly(!readOnly)}>
          {readOnly ? 'Enable Editing' : 'Make Read-Only'}
        </Button>
        <Button onClick={() => setShowToolbar(!showToolbar)}>
          {showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
        </Button>
        <Button onClick={() => setContent('')}>Clear Content</Button>
        <Button
          onClick={() =>
            setContent(
              '<h1>Sample Content</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p>'
            )
          }
        >
          Load Sample
        </Button>
      </Space>

      <RichTextEditor
        value={content}
        onChange={setContent}
        readOnly={readOnly}
        showToolbar={showToolbar}
        onInlineUpload={mockInlineUpload}
        onAttachmentUpload={mockAttachmentUpload}
        showCharacterCount
        showWordCount
      />

      <div
        style={{
          marginTop: token.marginLG,
          padding: token.padding,
          backgroundColor: token.colorFillQuaternary,
          borderRadius: token.borderRadius,
          fontFamily: 'monospace',
          fontSize: token.fontSizeSM,
        }}
      >
        <Text strong>Content:</Text>
        <pre style={{ marginTop: token.marginXS, whiteSpace: 'pre-wrap' }}>
          {content || '(empty)'}
        </pre>
      </div>
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: () => <InteractiveDemoComponent />,
};

/* -------------------------------------------------------------------------- */
/* Attachment Display: Chips Mode (default)                                   */
/* -------------------------------------------------------------------------- */

export const ChipsMode: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Default chips mode: uploaded files appear as compact chips below the editor, not inline in the content. Try uploading a file."
        />
        <EditorWrapper
          placeholder="Upload files to see Gmail-style chips..."
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const ChipsModeWithExistingAttachments: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Editor pre-loaded with existing attachments. You can remove them or upload more."
        />
        <EditorWrapper
          placeholder="Editor with pre-existing attachments..."
          attachments={[
            {
              url: 'https://example.com/report.pdf',
              fileName: 'quarterly-report-2026-Q1.pdf',
              fileSize: 2_450_000,
              mimeType: 'application/pdf',
            },
            {
              url: 'https://example.com/photo.jpg',
              fileName: 'team-photo.jpg',
              fileSize: 850_000,
              mimeType: 'image/jpeg',
            },
            {
              url: 'https://example.com/data.xlsx',
              fileName: 'financial-data-export.xlsx',
              fileSize: 1_200_000,
              mimeType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
          ]}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const ChipsModeSlowUpload: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Slow upload (~8s) in chips mode. Watch the uploading chip progress below the editor."
        />
        <EditorWrapper
          placeholder="Upload a file to see slow chip progress..."
          onAttachmentUpload={mockSlowUpload}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const ChipsModeUploadFailure: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Upload fails at ~60% in chips mode. The uploading chip disappears and an error toast is shown."
        />
        <EditorWrapper
          placeholder="Upload a file to see failure handling..."
          onAttachmentUpload={mockFailingUpload}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const ChipsModeManyAttachments: Story = {
  render: () => {
    const { token } = theme.useToken();
    const manyAttachments: FileAttachmentAttributes[] = Array.from(
      { length: 12 },
      (_, i) => ({
        url: `https://example.com/file-${i + 1}.pdf`,
        fileName: `document-${i + 1}-with-a-longer-name.pdf`,
        fileSize: (i + 1) * 100_000,
        mimeType: 'application/pdf',
      })
    );
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="12 attachments to test chip bar overflow scrolling. The chip bar has a max-height and scrolls."
        />
        <EditorWrapper
          placeholder="Many attachments..."
          attachments={manyAttachments}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Inline Attachments                                                          */
/* -------------------------------------------------------------------------- */

export const InlineAttachmentMode: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Drop files onto the editor content area to insert inline attachments, or use the bottom drop zone/file button to attach below."
        />
        <EditorWrapper
          placeholder="Upload a file to see inline attachment..."
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => <EditorWrapper placeholder="Editor in dark mode..." />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/* -------------------------------------------------------------------------- */
/* Drag & Drop                                                                */
/* -------------------------------------------------------------------------- */

export const DragAndDrop: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Drag files onto the editor. Images dropped on the content area are inserted inline. Non-images (or anything dropped on the chip bar) become attachments."
        />
        <EditorWrapper
          placeholder="Drag and drop files here..."
          onDropRejected={(file, reason) =>
            console.warn(`Rejected: ${file.name} — ${reason}`)
          }
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const DragAndDropStrictPolicy: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Strict drag & drop: inline images must be PNG/JPEG and under 200 KB. Attachments must be PDF and under 1 MB. Rejected files are logged to the console."
        />
        <EditorWrapper
          placeholder="Drag files with strict validation..."
          acceptedInlineTypes={['image/png', 'image/jpeg']}
          maxInlineUploadSize={200 * 1024}
          acceptedFileTypes={['application/pdf']}
          maxFileSize={1024 * 1024}
          onDropRejected={(file, reason) =>
            console.warn(`Rejected: ${file.name} — ${reason}`)
          }
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Custom Renderers                                                           */
/* -------------------------------------------------------------------------- */

export const CustomInlineImageRenderer: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Custom inline image renderer: images show a rounded card with a delete button overlay."
        />
        <EditorWrapper
          placeholder="Upload an image to see the custom renderer..."
          renderInlineImage={({ src, alt, selected, onDelete }) => (
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                border: selected
                  ? `2px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{ maxWidth: 300, display: 'block' }}
              />
              <Button
                size="small"
                danger
                onClick={onDelete}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  opacity: 0.9,
                }}
              >
                ✕
              </Button>
            </span>
          )}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'image',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};

export const CustomAttachmentBar: Story = {
  render: () => {
    const { token } = theme.useToken();
    return (
      <div style={{ padding: token.padding }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
          title="Custom attachment bar renderer: shows attachments in a custom numbered list format instead of chips."
        />
        <EditorWrapper
          placeholder="Upload files to see custom attachment bar..."
          renderAttachmentBar={({ attachments, onRemove }) => (
            <div
              style={{
                padding: token.paddingSM,
                borderTop: `1px solid ${token.colorBorder}`,
                fontSize: token.fontSizeSM,
              }}
            >
              <Text strong>Custom Attachments ({attachments.length}):</Text>
              <ol
                style={{ margin: `${token.marginXS}px 0 0`, paddingLeft: 20 }}
              >
                {attachments.map((att) => (
                  <li key={att.url}>
                    {att.fileName}{' '}
                    <Button
                      size="small"
                      type="link"
                      danger
                      onClick={() => onRemove?.(att)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          toolbarOptions={[
            'bold',
            'italic',
            'divider',
            'file',
            'divider',
            'undo',
            'redo',
          ]}
        />
      </div>
    );
  },
};
