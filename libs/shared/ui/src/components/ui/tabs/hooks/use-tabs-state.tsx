import { theme, Badge, Flex } from 'antd';
import { useState, useMemo } from 'react';

import type { TabItem } from '../types';

export interface UseTabsStateProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

export function useTabsState({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
}: UseTabsStateProps) {
  const { token } = theme.useToken();

  // internalActiveKey acts as the uncontrolled state storage
  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey || items[0]?.key || ''
  );

  // Derived state: Use the controlled prop if provided, otherwise fallback to local state
  const currentActiveKey =
    activeKey !== undefined ? activeKey : internalActiveKey;

  const handleTabChange = (key: string) => {
    // Only update local state if we are in uncontrolled mode
    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  const visibleItems = useMemo(
    () => items.filter((item) => !item.hidden),
    [items]
  );

  const tabItems = useMemo(
    () =>
      visibleItems.map((item) => {
        const hasBadge = item.badge !== undefined && item.badge !== null;

        const label = hasBadge ? (
          <Flex
            align="center"
            gap={token.marginXXS}
            component="span"
            style={{ display: 'inline-flex' }}
          >
            {item.label}
            <Badge count={item.badge} size="small" />
          </Flex>
        ) : (
          item.label
        );

        return {
          ...item,
          label,
        };
      }),
    [visibleItems, token.marginXXS]
  );

  return {
    currentActiveKey,
    handleTabChange,
    visibleItems,
    tabItems,
    token,
  };
}
