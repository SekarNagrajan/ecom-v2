import {
  AppstoreOutlined,
  ProjectOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Flex, Input, Select, Space, Tooltip, theme } from 'antd';
import { startTransition, type CSSProperties, type ReactNode } from 'react';

import { useAntdBreakpoint, useDebouncedCallback } from '../../../hooks';
import {
  AppSegmentedButtonTabs,
  type AppSegmentedButtonTabItem,
} from '../../ui/segmented-button-tabs';
import {
  useAllowedViewModes,
  useColumnDefs,
  useDataViewActions,
  useFilterConfig,
  useSearchableFields,
  useSearchField,
  useSearchText,
  useViewMode,
} from '../context/data-view-context';
import type { DataViewMode, DataViewToolbarSlots } from '../types';
import { preloadViewMode } from '../view-loaders';
import { FilterBar } from './filter-bar';
import { FilterControls } from './filter-bar/filter-controls';

// Modified by Sekar Nagarajan (2026-07-28 13:00)
const SEARCH_DEBOUNCE_DELAY = 300;
/** Matches the standard CRM hover-tooltip delay used across the app. */
const VIEW_MODE_TOOLTIP_DELAY = 0.5; // 500ms

const VIEW_MODE_LABELS: Record<DataViewMode, string> = {
  list: 'List View',
  kanban: 'Kanban View',
  card: 'Card View',
};

const VIEW_MODE_ICONS: Record<DataViewMode, ReactNode> = {
  list: <UnorderedListOutlined />,
  kanban: <ProjectOutlined />,
  card: <AppstoreOutlined />,
};

export interface DataViewHeaderProps {
  searchDebounceDelay?: number;
  totalCount: number;
  headerActions?: ReactNode;
  renderToolbar?: (slots: DataViewToolbarSlots) => ReactNode;
}

function DataViewSearch({
  searchDebounceDelay = SEARCH_DEBOUNCE_DELAY,
}: {
  searchDebounceDelay?: number;
}) {
  const { isMobile } = useAntdBreakpoint();
  const searchText = useSearchText();
  const searchField = useSearchField();
  const searchableFields = useSearchableFields();
  const actions = useDataViewActions();

  const debouncedSearch = useDebouncedCallback((text: string) => {
    actions.setSearchText(text);
  }, searchDebounceDelay);

  if (searchableFields.length === 0) {
    return (
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        allowClear
        defaultValue={searchText}
        onChange={(e) => debouncedSearch(e.target.value)}
        style={{ width: isMobile ? '100%' : 'auto' }}
      />
    );
  }

  const selectedFieldLabel = searchableFields.find(
    (f) => f.field === searchField
  )?.label;

  return (
    <Space.Compact style={{ width: isMobile ? '100%' : 'auto' }}>
      <Select
        value={searchField}
        onChange={(field) => actions.setSearchField(field)}
        popupMatchSelectWidth={false}
        style={{ minWidth: 110 }}
        options={searchableFields.map((f) => ({
          value: f.field,
          label: f.label,
        }))}
      />
      <Input
        placeholder={`Search by ${selectedFieldLabel ?? 'field'}...`}
        prefix={<SearchOutlined />}
        allowClear
        defaultValue={searchText}
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    </Space.Compact>
  );
}

function DataViewViewModeTabs() {
  const { token } = theme.useToken();
  const viewMode = useViewMode();
  const allowedViewModes = useAllowedViewModes();
  const actions = useDataViewActions();

  const preloadInactiveViewModes = () => {
    for (const mode of allowedViewModes) {
      if (mode !== viewMode) {
        preloadViewMode(mode);
      }
    }
  };

  const items: AppSegmentedButtonTabItem[] = allowedViewModes.map((mode) => ({
    key: mode,
    ariaLabel: VIEW_MODE_LABELS[mode],
    label: (
      <Tooltip
        title={VIEW_MODE_LABELS[mode]}
        mouseEnterDelay={VIEW_MODE_TOOLTIP_DELAY}
      >
        <span
          style={{
            display: 'inline-flex',
            fontSize: token.fontSizeLG,
          }}
        >
          {VIEW_MODE_ICONS[mode]}
        </span>
      </Tooltip>
    ),
  }));

  // Icon-only tabs read as cramped with the text-sized inline padding, so
  // this instance tightens it to a square-ish hit area via the shared
  // component's CSS custom properties.
  const iconTabBarStyle = {
    '--seg-tabs-padding-inline': `${token.paddingSM}px`,
  } as CSSProperties;

  return (
    <div
      onPointerEnter={preloadInactiveViewModes}
      onFocusCapture={preloadInactiveViewModes}
      onPointerDown={preloadInactiveViewModes}
    >
      <AppSegmentedButtonTabs
        ariaLabel="View mode"
        items={items}
        activeKey={viewMode ?? 'list'}
        onChange={(key) => {
          startTransition(() => {
            actions.setViewMode(key as DataViewMode);
          });
        }}
        tabBarStyle={iconTabBarStyle}
      />
    </div>
  );
}

export function DataViewHeader({
  searchDebounceDelay = SEARCH_DEBOUNCE_DELAY,
  totalCount,
  headerActions,
  renderToolbar,
}: DataViewHeaderProps) {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();

  const filterConfig = useFilterConfig();
  const columnDefs = useColumnDefs();

  const hasFilterSort = filterConfig.length > 0 || columnDefs.length > 0;

  if (renderToolbar) {
    return (
      <>
        {renderToolbar({
          isMobile,
          totalCount,
          search: <DataViewSearch searchDebounceDelay={searchDebounceDelay} />,
          viewModeTabs: <DataViewViewModeTabs />,
          filterToggle: <FilterControls />,
          filterChips: <FilterBar />,
        })}
      </>
    );
  }

  return (
    <Flex vertical gap={token.paddingXXS}>
      <Flex justify="space-between" align="center" wrap gap="small">
        <DataViewViewModeTabs />

        <Flex
          gap={token.paddingXS}
          align="center"
          style={{ marginLeft: 'auto' }}
        >
          {!isMobile && (
            <DataViewSearch searchDebounceDelay={searchDebounceDelay} />
          )}
          {hasFilterSort && <FilterControls />}
          {headerActions}
        </Flex>
      </Flex>

      {isMobile && (
        <Flex align="center" style={{ width: '100%' }}>
          <DataViewSearch searchDebounceDelay={searchDebounceDelay} />
        </Flex>
      )}

      <Flex gap="middle" justify="space-between" wrap align="center">
        {hasFilterSort && <FilterBar />}
      </Flex>
    </Flex>
  );
}
