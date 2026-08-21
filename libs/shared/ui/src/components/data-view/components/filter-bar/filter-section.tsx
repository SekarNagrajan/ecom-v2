import { FilterOutlined } from '@ant-design/icons';
import { Flex, Typography, theme, Badge, Empty, Space } from 'antd';

import {
  useFilterConfig,
  useDraftFilters,
  useDraftFilterValue,
  useDataViewActions,
} from '../../context/data-view-context';
import type {
  FilterFieldConfig,
  FilterValue,
} from '../../stores/data-view-types';
import { FilterControl } from '../filters/filter-control';

const { Text } = Typography;

interface FilterFieldRowProps {
  config: FilterFieldConfig;
}

function FilterFieldRow({ config }: FilterFieldRowProps) {
  const { token } = theme.useToken();
  const value = useDraftFilterValue(config.field);
  const actions = useDataViewActions();

  const handleChange = (nextValue: FilterValue | undefined) => {
    actions.setDraftFilter(config.field, nextValue);
  };

  return (
    <Flex vertical gap={token.marginXXS}>
      <Text
        strong
        style={{
          fontSize: token.fontSizeSM,
          color: token.colorTextSecondary,
        }}
      >
        {config.label}
      </Text>
      <FilterControl config={config} value={value} onChange={handleChange} />
    </Flex>
  );
}

export function FilterSection() {
  const { token } = theme.useToken();
  const filterConfig = useFilterConfig();
  const draftFilters = useDraftFilters();

  const activeFilterCount = draftFilters.filter((f) => {
    if (f.value === undefined || f.value === null || f.value === '')
      return false;
    if (Array.isArray(f.value) && f.value.length === 0) return false;
    return true;
  }).length;

  return (
    <div
      style={{
        padding: token.padding,
        background: token.colorBgContainer,
        flex: 1,
      }}
    >
      <Flex vertical gap="small">
        <Flex align="center" justify="space-between">
          <Space size="small">
            <FilterOutlined
              style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
            />
            <Text strong style={{ fontSize: token.fontSize }}>
              Filters
            </Text>
          </Space>
          {activeFilterCount > 0 && (
            <Badge
              count={activeFilterCount}
              style={{ backgroundColor: token.colorPrimary }}
              size="small"
            />
          )}
        </Flex>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: `${token.marginMD}px ${token.marginLG}px`,
          }}
        >
          {filterConfig.map((config) => {
            return <FilterFieldRow config={config} key={config.field} />;
          })}

          {filterConfig.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No filterable columns available"
              />
            </div>
          )}
        </div>
      </Flex>
    </div>
  );
}
