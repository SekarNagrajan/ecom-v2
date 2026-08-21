import { Tabs, type TabsProps } from 'antd';
import { type CSSProperties, lazy, Suspense } from 'react';

import { cn } from '../../../utils/cn';
import { useTabsState } from './hooks/use-tabs-state';
import type { AppTabsProps } from './types';

// Lazy load heavy components
const DraggableTabBar = lazy(() => import('./components/draggable-tab-bar'));

type RenderTabBar = NonNullable<TabsProps['renderTabBar']>;
type TabBarProps = Parameters<RenderTabBar>[0];
type DefaultTabBarType = Parameters<RenderTabBar>[1];

export function AppTabs({
  items,
  draggable,
  onDragEnd,
  fullWidth = false,
  tabMinWidth,
  className,
  style,
  ...props
}: AppTabsProps) {
  const { currentActiveKey, handleTabChange, visibleItems, tabItems } =
    useTabsState({
      items,
      activeKey: props.activeKey,
      defaultActiveKey: props.defaultActiveKey,
      onChange: props.onChange,
    });

  const renderTabBar: TabsProps['renderTabBar'] = (
    tabBarProps: TabBarProps,
    DefaultTabBar: DefaultTabBarType
  ) => {
    if (draggable && onDragEnd) {
      return (
        <Suspense fallback={<DefaultTabBar {...tabBarProps} />}>
          <DraggableTabBar
            tabBarProps={tabBarProps}
            DefaultTabBar={DefaultTabBar}
            items={visibleItems}
            onDragEnd={onDragEnd}
          />
        </Suspense>
      );
    }

    return <DefaultTabBar {...tabBarProps} />;
  };
  const visibleTabCount = Math.max(visibleItems.length, 1);
  const mergedStyle = {
    ...style,
    ...(fullWidth
      ? ({
          '--app-tabs-count': visibleTabCount,
          '--app-tabs-min-width':
            typeof tabMinWidth === 'number'
              ? `${tabMinWidth}px`
              : tabMinWidth ?? '120px',
        } as CSSProperties)
      : {}),
  } satisfies CSSProperties;

  return (
    <Tabs
      {...props}
      className={cn(fullWidth && 'app-tabs-full-width', className)}
      style={mergedStyle}
      activeKey={currentActiveKey}
      onChange={handleTabChange}
      items={tabItems}
      renderTabBar={draggable ? renderTabBar : undefined}
    />
  );
}
