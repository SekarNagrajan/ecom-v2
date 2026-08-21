import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

import type { ToolbarOption } from '../types';

export interface ToolbarButtonConfig {
  tooltip: string;
  icon?: ReactNode;
  label?: string;
  ariaLabel: string;
  isActive: (editor: Editor) => boolean;
  action: (editor: Editor) => void;
  canExecute?: (editor: Editor) => boolean;
}

export const TOOLBAR_BUTTON_MAP: Partial<
  Record<ToolbarOption, ToolbarButtonConfig>
> = {
  bold: {
    tooltip: 'Bold (Ctrl+B)',
    icon: <BoldOutlined />,
    ariaLabel: 'Bold',
    isActive: (e) => e.isActive('bold'),
    action: (e) => {
      e.chain().focus().toggleBold().run();
    },
  },
  italic: {
    tooltip: 'Italic (Ctrl+I)',
    icon: <ItalicOutlined />,
    ariaLabel: 'Italic',
    isActive: (e) => e.isActive('italic'),
    action: (e) => {
      e.chain().focus().toggleItalic().run();
    },
  },
  underline: {
    tooltip: 'Underline (Ctrl+U)',
    icon: <UnderlineOutlined />,
    ariaLabel: 'Underline',
    isActive: (e) => e.isActive('underline'),
    action: (e) => {
      e.chain().focus().toggleUnderline().run();
    },
  },
  strike: {
    tooltip: 'Strikethrough',
    icon: <StrikethroughOutlined />,
    ariaLabel: 'Strikethrough',
    isActive: (e) => e.isActive('strike'),
    action: (e) => {
      e.chain().focus().toggleStrike().run();
    },
  },
  h1: {
    tooltip: 'Heading 1',
    label: 'H1',
    ariaLabel: 'Heading 1',
    isActive: (e) => e.isActive('heading', { level: 1 }),
    action: (e) => {
      e.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  h2: {
    tooltip: 'Heading 2',
    label: 'H2',
    ariaLabel: 'Heading 2',
    isActive: (e) => e.isActive('heading', { level: 2 }),
    action: (e) => {
      e.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  h3: {
    tooltip: 'Heading 3',
    label: 'H3',
    ariaLabel: 'Heading 3',
    isActive: (e) => e.isActive('heading', { level: 3 }),
    action: (e) => {
      e.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  bulletList: {
    tooltip: 'Bullet List',
    icon: <UnorderedListOutlined />,
    ariaLabel: 'Bullet List',
    isActive: (e) => e.isActive('bulletList'),
    action: (e) => {
      e.chain().focus().toggleBulletList().run();
    },
  },
  orderedList: {
    tooltip: 'Numbered List',
    icon: <OrderedListOutlined />,
    ariaLabel: 'Numbered List',
    isActive: (e) => e.isActive('orderedList'),
    action: (e) => {
      e.chain().focus().toggleOrderedList().run();
    },
  },
  alignLeft: {
    tooltip: 'Align Left',
    icon: <AlignLeftOutlined />,
    ariaLabel: 'Align Left',
    isActive: (e) => e.isActive({ textAlign: 'left' }),
    action: (e) => {
      e.chain().focus().setTextAlign('left').run();
    },
  },
  alignCenter: {
    tooltip: 'Align Center',
    icon: <AlignCenterOutlined />,
    ariaLabel: 'Align Center',
    isActive: (e) => e.isActive({ textAlign: 'center' }),
    action: (e) => {
      e.chain().focus().setTextAlign('center').run();
    },
  },
  alignRight: {
    tooltip: 'Align Right',
    icon: <AlignRightOutlined />,
    ariaLabel: 'Align Right',
    isActive: (e) => e.isActive({ textAlign: 'right' }),
    action: (e) => {
      e.chain().focus().setTextAlign('right').run();
    },
  },
  undo: {
    tooltip: 'Undo (Ctrl+Z)',
    icon: <UndoOutlined />,
    ariaLabel: 'Undo',
    isActive: () => false,
    action: (e) => {
      e.chain().focus().undo().run();
    },
    canExecute: (e) => e.can().undo(),
  },
  redo: {
    tooltip: 'Redo (Ctrl+Y)',
    icon: <RedoOutlined />,
    ariaLabel: 'Redo',
    isActive: () => false,
    action: (e) => {
      e.chain().focus().redo().run();
    },
    canExecute: (e) => e.can().redo(),
  },
};
