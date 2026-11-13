import type { INoRowsOverlayParams } from 'ag-grid-community';
import type { ReactNode } from 'react';

import { AppEmptyState } from '../../../ui/empty-state';

export type AgGridNoRowsOverlayParams = INoRowsOverlayParams & {
  emptyState?: ReactNode;
};

export function AgGridNoRowsOverlay(params: AgGridNoRowsOverlayParams) {
  if (params.emptyState) {
    return <>{params.emptyState}</>;
  }

  return (
    <AppEmptyState
      variant="filtered"
      title="No records found"
      message="Nothing matches the current filters. Clear filters or adjust your search to see more results."
      artSize="md"
      style={{ paddingTop: 24, paddingBottom: 24 }}
    />
  );
}
