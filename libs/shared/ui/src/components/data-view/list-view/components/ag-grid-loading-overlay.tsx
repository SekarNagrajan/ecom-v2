import type { ILoadingOverlayParams } from 'ag-grid-community';
import { Spin } from 'antd';

export function AgGridLoadingOverlay(_params: ILoadingOverlayParams) {
  return <Spin size="default" />;
}
