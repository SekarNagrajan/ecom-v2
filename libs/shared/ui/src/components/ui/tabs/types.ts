import type { DragEndEvent } from '@dnd-kit/core';
import type { TabsProps } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

export interface TabItem
  extends Omit<NonNullable<TabsProps['items']>[number], 'key'> {
  key: string;
  hidden?: boolean;
  badge?: ReactNode;
}

export type DraggableProps =
  | { draggable?: false; onDragEnd?: never }
  | { draggable: true; onDragEnd: (event: DragEndEvent) => void };

export type AppTabsProps = Omit<TabsProps, 'onDragEnd'> & {
  items: TabItem[];
  fullWidth?: boolean;
  tabMinWidth?: CSSProperties['minWidth'];
} & DraggableProps;
