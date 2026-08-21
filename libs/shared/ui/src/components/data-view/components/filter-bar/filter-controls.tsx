import { FilterOutlined } from '@ant-design/icons';
import { Badge, Flex, theme } from 'antd';
import { startTransition, useState } from 'react';

import { AppButton } from '../../../ui/button';
import {
  useColumnDefs,
  useDataViewActions,
  useFilterConfig,
  useFilters,
  useIsFilterDrawerOpen,
  useSorts,
} from '../../context/data-view-context';
import { getActiveFilterCount } from '../../utils/filter-utils';
import { FilterDrawer } from './filter-drawer';

export interface FilterControlsProps {
  /**
   * Stretch the trigger button to fill its container. Use when placing the
   * toggle inside a flex item that owns the row width (e.g. mobile 50/50
   * action rows). Default is content-width.
   */
  block?: boolean;
}

export function FilterControls({ block = false }: FilterControlsProps = {}) {
  const { token } = theme.useToken();

  const filters = useFilters();
  const sorts = useSorts();
  const filterConfig = useFilterConfig();
  const columnDefs = useColumnDefs();
  const isFilterDrawerOpen = useIsFilterDrawerOpen();

  const actions = useDataViewActions();

  const activeFilterCount = getActiveFilterCount(filters);
  const activeSortCount = sorts.length;
  const totalActiveCount = activeFilterCount + activeSortCount;

  const [hasDrawerMounted, setHasDrawerMounted] = useState(false);
  if (isFilterDrawerOpen && !hasDrawerMounted) {
    setHasDrawerMounted(true);
  }

  if (filterConfig.length === 0 && columnDefs.length === 0) {
    return null;
  }

  return (
    <>
      <Flex
        gap={token.paddingXS}
        align="center"
        wrap="wrap"
        style={block ? { width: '100%' } : undefined}
      >
        <Badge
          count={totalActiveCount}
          size="small"
          offset={[-4, 4]}
          color={token.colorPrimary}
          // Antd v6 Badge: the `style` prop is merged into the count indicator
          // (<sup>), NOT the outer wrapper. To stretch the wrapper to fill its
          // parent (e.g. a 50/50 grid cell on mobile), use `styles.root`.
          styles={
            block ? { root: { display: 'block', width: '100%' } } : undefined
          }
        >
          <AppButton
            icon={<FilterOutlined />}
            onClick={() => {
              startTransition(() => {
                actions.openFilterDrawer();
              });
            }}
            color="primary"
            variant="outlined"
            block={block}
          >
            Filters & Sort
          </AppButton>
        </Badge>
      </Flex>

      {hasDrawerMounted && (
        <FilterDrawer
          open={isFilterDrawerOpen}
          onClose={() => actions.closeFilterDrawer()}
        />
      )}
    </>
  );
}
