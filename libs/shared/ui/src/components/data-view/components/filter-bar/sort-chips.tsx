import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { Tag, Flex, Typography, theme } from 'antd';

import {
  useSorts,
  useColumnDefs,
  useDataViewActions,
} from '../../context/data-view-context';
import type { DataViewColumnMeta } from '../../types';

const { Text } = Typography;

export interface SortChipsProps {
  compact?: boolean;
}

export function SortChips({ compact = false }: SortChipsProps) {
  const { token } = theme.useToken();

  const sorts = useSorts();
  const columnDefs = useColumnDefs();
  const actions = useDataViewActions();

  const columnMap = new Map<string, DataViewColumnMeta>();
  columnDefs.forEach((c) => {
    if (typeof c.field === 'string') {
      columnMap.set(c.field, c);
    }
  });

  const handleRemove = (field: string) => {
    actions.setSorts(sorts.filter((s) => s.field !== field));
  };

  const handleClearAll = () => {
    actions.setSorts([]);
  };

  const labelTag = (
    <Tag
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXXS,
        margin: 0,
        padding: `${token.paddingXXS / 2}px ${token.paddingSM}px`,
        borderRadius: token.borderRadiusLG,
        background: token.colorPrimaryBg,
        borderColor: token.colorPrimaryBorder,
        color: token.colorPrimaryText,
        fontWeight: 600,
      }}
    >
      <SortAscendingOutlined style={{ fontSize: 12 }} />
      <span>Sort</span>
    </Tag>
  );

  if (sorts.length === 0) {
    return null;
  }

  return (
    <Flex wrap="wrap" gap={token.marginXXS} align="center">
      {labelTag}

      {sorts.map((sort, index) => {
        const column = columnMap.get(sort.field);
        const label = column?.headerName ?? sort.field;

        return (
          <Tag
            key={sort.field}
            closable
            onClose={(e) => {
              e.stopPropagation();
              handleRemove(sort.field);
            }}
            onClick={() => actions.toggleSort(sort.field)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: token.marginXXS,
              margin: 0,
              padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
              borderRadius: token.borderRadiusLG,
              cursor: 'pointer',
              background: token.colorFillTertiary,
              borderColor: token.colorPrimaryBorder,
            }}
          >
            {sorts.length > 1 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: token.colorPrimary,
                  minWidth: 14,
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </span>
            )}

            <Text style={{ fontSize: token.fontSizeSM }}>{label}</Text>

            {sort.direction === 'asc' ? (
              <ArrowUpOutlined
                style={{ fontSize: 12, color: token.colorPrimary }}
              />
            ) : (
              <ArrowDownOutlined
                style={{ fontSize: 12, color: token.colorPrimary }}
              />
            )}
          </Tag>
        );
      })}

      {sorts.length > 1 && (
        <Tag
          onClick={handleClearAll}
          style={{
            cursor: 'pointer',
            margin: 0,
            padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
            borderRadius: token.borderRadiusLG,
            color: token.colorError,
            borderColor: token.colorErrorBorder,
            borderStyle: 'dashed',
          }}
        >
          Clear sorts
        </Tag>
      )}
    </Flex>
  );
}
