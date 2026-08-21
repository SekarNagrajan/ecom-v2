import {
  SortAscendingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Flex, Typography, theme, Space, Select, Badge, Tag } from 'antd';
import { useState } from 'react';

import {
  useColumnDefs,
  useDraftSorts,
  useDataViewActions,
} from '../../context/data-view-context';
import type { DataViewColumnMeta } from '../../types';

const { Text } = Typography;

export function SortSection() {
  const { token } = theme.useToken();
  const columnDefs = useColumnDefs();
  const draftSorts = useDraftSorts();
  const actions = useDataViewActions();
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const hasSortableField = (
    col: DataViewColumnMeta
  ): col is DataViewColumnMeta & { field: string } =>
    typeof col.field === 'string' && col.sortable !== false;

  const sortableColumns = columnDefs.filter(hasSortableField);

  const sortedFields = new Set(draftSorts.map((s) => s.field));
  const availableSortColumns = sortableColumns.filter(
    (col) => !sortedFields.has(col.field)
  );

  const activeSortCount = draftSorts.length;
  const handleAddSort = (field: string) => {
    actions.addDraftSort(field);
    setSelectedField(null);
  };

  return (
    <div
      style={{
        padding: token.padding,
        background: token.colorBgContainer,
        marginBottom: token.marginXS,
      }}
    >
      <Flex vertical gap={token.marginMD}>
        <Flex align="center" justify="space-between">
          <Space size={token.paddingXS}>
            <SortAscendingOutlined
              style={{ color: token.colorPrimary, fontSize: 18 }}
            />
            <Text strong style={{ fontSize: 16 }}>
              Sorting
            </Text>
          </Space>
          {activeSortCount > 0 && (
            <Badge
              count={activeSortCount}
              style={{ backgroundColor: token.colorPrimary }}
              size="small"
            />
          )}
        </Flex>

        <Flex vertical gap={token.marginXS}>
          {availableSortColumns.length > 0 && (
            <Select
              placeholder="Add a column to sort by..."
              value={selectedField}
              onChange={handleAddSort}
              style={{ width: '100%' }}
              suffix={<PlusOutlined />}
              variant="filled"
              options={availableSortColumns.map((col) => ({
                label: col.headerName ?? col.field,
                value: col.field,
              }))}
            />
          )}

          <Flex wrap="wrap" gap={token.marginXS}>
            {draftSorts.map((sort) => {
              const column = sortableColumns.find(
                (c) => c.field === sort.field
              );
              const label = column?.headerName ?? sort.field;
              const Icon =
                sort.direction === 'asc' ? ArrowUpOutlined : ArrowDownOutlined;

              return (
                <Tag
                  key={sort.field}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    actions.removeDraftSort(sort.field);
                  }}
                  onClick={() =>
                    actions.updateDraftSort(
                      sort.field,
                      sort.direction === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: token.marginXXS,
                    padding: `${token.paddingXXS / 2}px ${token.paddingXS}px`,
                    borderRadius: token.borderRadiusLG,
                    background: token.colorFillTertiary,
                    borderColor: token.colorBorderSecondary,
                    margin: 0,
                    fontSize: token.fontSizeSM,
                    userSelect: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon
                    style={{
                      fontSize: 10,
                      color: token.colorPrimary,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: token.fontSizeSM,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </Text>
                </Tag>
              );
            })}
          </Flex>

          {draftSorts.length === 0 && availableSortColumns.length === 0 && (
            <Text
              type="secondary"
              style={{
                textAlign: 'center',
                padding: `${token.paddingSM}px 0`,
              }}
            >
              No sortable columns available
            </Text>
          )}
        </Flex>
      </Flex>
    </div>
  );
}
