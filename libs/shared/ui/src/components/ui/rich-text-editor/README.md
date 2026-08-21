# RichTextEditor Component

A powerful, customizable rich text editor built on Tiptap with full theme integration and React Hook Form support.

## Features

- ✅ **Gmail-like text formatting** - Bold, italic, underline, strikethrough, headings, lists, alignment
- ✅ **Media support** - Image and file uploads with validation
- ✅ **Theme integration** - Uses `theme.useToken()` for dynamic styling
- ✅ **Mobile responsive** - Touch-friendly interface
- ✅ **Accessibility** - Full keyboard navigation and ARIA support
- ✅ **Multiple output formats** - HTML, JSON, or Markdown
- ✅ **Customizable** - Enable/disable features via props
- ✅ **Character/word counting** - Optional display with limits
- ✅ **Read-only mode** - Display formatted content
- ✅ **No React Hook Form dependency** - Can be used standalone

## Basic Usage

```tsx
import { RichTextEditor } from '@solverminds/shared-ui';
import { useState } from 'react';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

## With Upload Handlers

```tsx
import { RichTextEditor } from '@solverminds/shared-ui';

const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  return {
    url: data.url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
};

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      onImageUpload={handleImageUpload}
      onFileUpload={handleFileUpload}
    />
  );
}
```

## With Character Limit

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  characterLimit={500}
  showCharacterCount
  showWordCount
/>
```

## Custom Toolbar

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
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
```

## Disable Specific Features

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  enableImages={false}
  enableFileAttachments={false}
  enableHeadings={false}
/>
```

## Read-Only Mode

```tsx
<RichTextEditor value={content} readOnly />
```

## Different Output Formats

```tsx
// HTML (default)
<RichTextEditor
  value={content}
  onChange={setContent}
  outputFormat="html"
/>

// JSON
<RichTextEditor
  value={content}
  onChange={setContent}
  outputFormat="json"
/>

// Markdown
<RichTextEditor
  value={content}
  onChange={setContent}
  outputFormat="markdown"
/>
```

## Props

### Content Props

| Prop           | Type                             | Default     | Description                 |
| -------------- | -------------------------------- | ----------- | --------------------------- |
| `value`        | `string`                         | `undefined` | Current editor content      |
| `onChange`     | `(content: string) => void`      | `undefined` | Called when content changes |
| `outputFormat` | `'html' \| 'json' \| 'markdown'` | `'html'`    | Output format for content   |

### Configuration Props

| Prop          | Type      | Default             | Description           |
| ------------- | --------- | ------------------- | --------------------- |
| `placeholder` | `string`  | `'Start typing...'` | Placeholder text      |
| `readOnly`    | `boolean` | `false`             | Make editor read-only |
| `disabled`    | `boolean` | `false`             | Disable editor        |

### Extension Control Props

| Prop                    | Type      | Default | Description               |
| ----------------------- | --------- | ------- | ------------------------- |
| `enableLinks`           | `boolean` | `true`  | Enable link functionality |
| `enableImages`          | `boolean` | `true`  | Enable image uploads      |
| `enableFileAttachments` | `boolean` | `true`  | Enable file attachments   |
| `enableHeadings`        | `boolean` | `true`  | Enable heading formatting |
| `enableLists`           | `boolean` | `true`  | Enable list formatting    |
| `enableTextAlignment`   | `boolean` | `true`  | Enable text alignment     |
| `enableUndo`            | `boolean` | `true`  | Enable undo/redo          |

### Toolbar Props

| Prop              | Type                | Default     | Description               |
| ----------------- | ------------------- | ----------- | ------------------------- |
| `toolbarOptions`  | `ToolbarOption[]`   | All options | Customize toolbar buttons |
| `toolbarPosition` | `'top' \| 'bottom'` | `'top'`     | Toolbar position          |
| `showToolbar`     | `boolean`           | `true`      | Show/hide toolbar         |

### Upload Props

| Prop            | Type                                      | Default           | Description             |
| --------------- | ----------------------------------------- | ----------------- | ----------------------- |
| `onImageUpload` | `(file: File) => Promise<UploadResponse>` | `undefined`       | Image upload handler    |
| `onFileUpload`  | `(file: File) => Promise<UploadResponse>` | `undefined`       | File upload handler     |
| `maxImageSize`  | `number`                                  | `5242880` (5MB)   | Max image size in bytes |
| `maxFileSize`   | `number`                                  | `10485760` (10MB) | Max file size in bytes  |

### Display Props

| Prop                 | Type      | Default     | Description          |
| -------------------- | --------- | ----------- | -------------------- |
| `showCharacterCount` | `boolean` | `false`     | Show character count |
| `showWordCount`      | `boolean` | `false`     | Show word count      |
| `characterLimit`     | `number`  | `undefined` | Character limit      |

### Styling Props

| Prop        | Type                  | Default     | Description          |
| ----------- | --------------------- | ----------- | -------------------- |
| `className` | `string`              | `undefined` | Additional CSS class |
| `style`     | `React.CSSProperties` | `undefined` | Inline styles        |
| `height`    | `string \| number`    | `undefined` | Editor height        |
| `minHeight` | `string \| number`    | `'200px'`   | Minimum height       |

### Accessibility Props

| Prop              | Type     | Default              | Description            |
| ----------------- | -------- | -------------------- | ---------------------- |
| `id`              | `string` | Auto-generated       | Element ID             |
| `ariaLabel`       | `string` | `'Rich text editor'` | ARIA label             |
| `ariaDescribedBy` | `string` | `undefined`          | ARIA described by      |
| `autoComplete`    | `string` | `undefined`          | Autocomplete attribute |

## Toolbar Options

Available toolbar options:

- `'bold'` - Bold text
- `'italic'` - Italic text
- `'underline'` - Underline text
- `'strike'` - Strikethrough text
- `'h1'`, `'h2'`, `'h3'` - Heading levels
- `'bulletList'` - Bullet list
- `'orderedList'` - Numbered list
- `'alignLeft'`, `'alignCenter'`, `'alignRight'`, `'alignJustify'` - Text alignment
- `'link'` - Insert/edit links
- `'image'` - Upload images
- `'file'` - Attach files
- `'undo'`, `'redo'` - Undo/redo actions
- `'divider'` - Visual separator

## Upload Response Interface

```typescript
interface UploadResponse {
  url: string; // Public URL of uploaded file
  fileName?: string; // File name
  fileSize?: number; // File size in bytes
  mimeType?: string; // MIME type
}
```

## Keyboard Shortcuts

- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Ctrl+U` / `Cmd+U` - Underline
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Shift+Z` - Redo

## Theme Integration

The editor automatically inherits theme settings from `AppConfigProvider`:

- Theme mode (dark/light)
- Primary color
- Font family
- All spacing and colors from `theme.useToken()`

## React Hook Form Integration

For form integration, use the `FormRichTextEditor` component:

```tsx
import { FormRichTextEditor } from '@solverminds/shared-ui';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { control } = useForm();

  return (
    <FormRichTextEditor
      name="description"
      control={control}
      label="Description"
      required
      enableImages
      showCharacterCount
    />
  );
}
```

See `FormRichTextEditor` documentation for more details.
