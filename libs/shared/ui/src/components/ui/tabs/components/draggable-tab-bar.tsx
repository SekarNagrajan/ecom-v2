import {
  DndContext,
  PointerSensor,
  useSensor,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TabsProps } from 'antd';
import React from 'react';

// Extract types from AntD Tabs renderTabBar parameters
type RenderTabBar = NonNullable<TabsProps['renderTabBar']>;
type TabBarProps = Parameters<RenderTabBar>[0];
type DefaultTabBarType = Parameters<RenderTabBar>[1];

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-node-key': string;
}

const DraggableTabNode: React.FC<
  React.PropsWithChildren<DraggableTabPaneProps>
> = ({ children, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props['data-node-key'],
    });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
  };

  // React.cloneElement in newer versions of React/TS might require explicit typing
  // to allow the 'ref' property when passed as a prop (React 19).
  const element = children as React.ReactElement<
    DraggableTabPaneProps & { ref?: React.Ref<HTMLElement> }
  >;

  return React.cloneElement(element, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

interface DraggableTabBarProps {
  tabBarProps: TabBarProps;
  DefaultTabBar: DefaultTabBarType;
  items: { key: string }[];
  onDragEnd: (event: DragEndEvent) => void;
}

export default function DraggableTabBar({
  tabBarProps,
  DefaultTabBar,
  items,
  onDragEnd,
}: DraggableTabBarProps) {
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  return (
    <DndContext
      sensors={[sensor]}
      onDragEnd={onDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={items.map((i) => i.key)}
        strategy={horizontalListSortingStrategy}
      >
        <DefaultTabBar {...tabBarProps}>
          {(node: React.ReactElement) => (
            <DraggableTabNode
              {...(node.props as DraggableTabPaneProps)}
              key={node.key}
            >
              {node}
            </DraggableTabNode>
          )}
        </DefaultTabBar>
      </SortableContext>
    </DndContext>
  );
}
