// Modified by Sekar Nagarajan (2026-09-15 11:35)
import { useCallback, useState } from "react";

const DEFAULT_PAGE_SIZE = 12;

/**
 * 0-based page state for DataView card pagination (client-side lists).
 */
export function useModuleCardPagination(initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onPaginationChange = useCallback((nextPage: number, nextSize: number) => {
    setPage(nextPage);
    setPageSize(nextSize);
  }, []);

  return { page, pageSize, onPaginationChange };
}
