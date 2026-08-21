import type { GridApi } from 'ag-grid-community';
import { Flex, Pagination, theme } from 'antd';

import type { DataViewItem } from '../../data-view-item';
import { useListViewContext } from '../context';

type ListViewPaginationProps<TData extends DataViewItem> = {
  gridApi: GridApi<TData> | null;
  pagination?: boolean;
  pageSizeOptions?: number[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  disabled?: boolean;
};

export const ListViewPagination = <TData extends DataViewItem>({
  gridApi,
  pagination,
  pageSizeOptions = [10, 20, 50, 100],
  setCurrentPage,
  setPageSize,
  disabled = false,
}: ListViewPaginationProps<TData>) => {
  const { rowCount, currentPage, pageSize, isMobile } = useListViewContext();

  const { token } = theme.useToken();

  const handlePageChange = (page: number, pSize: number) => {
    if (gridApi) {
      setCurrentPage(page - 1);
      setPageSize(pSize);
      gridApi.paginationGoToPage(page - 1);
      if (pSize !== gridApi.paginationGetPageSize()) {
        gridApi.setGridOption('paginationPageSize', pSize);
      }
    }
  };

  if (!pagination) return null;

  return (
    <Flex
      justify={isMobile ? 'center' : 'end'}
      align="center"
      wrap="wrap"
      gap={token.marginXS}
      style={{
        padding: token.paddingXS,
        background: 'inherit',
      }}
    >
      <Pagination
        disabled={disabled}
        size="small"
        current={currentPage + 1}
        pageSize={pageSize}
        total={rowCount}
        onChange={handlePageChange}
        pageSizeOptions={pageSizeOptions}
        showTotal={(total, range) =>
          isMobile ? undefined : `${range[0]}-${range[1]} of ${total}`
        }
      />
    </Flex>
  );
};
