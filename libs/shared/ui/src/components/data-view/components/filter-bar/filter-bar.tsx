import { Flex, theme } from 'antd';

import { useFilters, useSorts } from '../../context/data-view-context';
import { FilterChips } from './filter-chips';
import { SortChips } from './sort-chips';

export function FilterBar() {
  const { token } = theme.useToken();
  const filters = useFilters();
  const sorts = useSorts();

  const activeFilters = filters.filter((f) => {
    if (f.operator === 'blank' || f.operator === 'notBlank') return true;
    return (
      f.value !== undefined &&
      f.value !== null &&
      f.value !== '' &&
      (!Array.isArray(f.value) || f.value.length > 0)
    );
  });

  if (activeFilters.length === 0 && sorts.length === 0) {
    return null;
  }

  return (
    <Flex
      wrap="wrap"
      gap={token.paddingXS}
      align="center"
      style={{
        padding: `${token.paddingXXS}px 0`,
      }}
    >
      <FilterChips />
      <SortChips />
    </Flex>
  );
}
