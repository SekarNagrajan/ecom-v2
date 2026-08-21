// Modified by sekar nagarajan (2026-08-21)
import { UserOutlined } from '@ant-design/icons';
import {
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  PaginationModule,
  RenderApiModule,
  SelectEditorModule,
  TextFilterModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Space, Switch, Tag, theme } from 'antd';
import { useMemo } from 'react';
import type { SubUser } from '../types/user-creation.types';

// Register necessary AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  PaginationModule,
  TextFilterModule,
  SelectEditorModule,
  RenderApiModule,
]);

interface SubUserAgGridTableProps {
  rowData: SubUser[];
  loading?: boolean;
  onToggleStatus: (id: string, active: boolean) => void;
  quickFilterText?: string;
}

export function SubUserAgGridTable({
  rowData,
  loading = false,
  onToggleStatus,
  quickFilterText = '',
}: SubUserAgGridTableProps) {
  const { token } = theme.useToken();

  const columnDefs = useMemo<ColDef<SubUser>[]>(
    () => [
      {
        headerName: 'Login Username',
        field: 'loginName',
        sortable: true,
        filter: true,
        flex: 1.2,
        cellRenderer: (params: { value: string }) => (
          <Space>
            <UserOutlined style={{ color: token.colorPrimary }} />
            <strong style={{ color: token.colorText }}>{params.value}</strong>
          </Space>
        ),
      },
      {
        headerName: 'Full Name',
        valueGetter: (params) => `${params.data?.firstName || ''} ${params.data?.lastName || ''}`,
        sortable: true,
        filter: true,
        flex: 1.2,
      },
      {
        headerName: 'Email Address',
        field: 'email',
        sortable: true,
        filter: true,
        flex: 1.5,
      },
      {
        headerName: 'Company Name',
        field: 'companyName',
        sortable: true,
        filter: true,
        flex: 1.3,
      },
      {
        headerName: 'Contact Phone',
        field: 'custPhoneNo',
        sortable: true,
        filter: true,
        flex: 1.1,
      },
      {
        headerName: 'Allowed Capabilities',
        field: 'allowedModules',
        flex: 1.5,
        cellRenderer: (params: { value: string[] }) => (
          <Space wrap size={[2, 4]}>
            {(params.value || []).map((m) => (
              <Tag color="blue" key={m} style={{ margin: 0 }}>
                {m}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        headerName: 'Account Status',
        field: 'isActive',
        sortable: true,
        flex: 1.2,
        cellRenderer: (params: { value: boolean; data?: SubUser }) => {
          if (!params.data) return null;
          return (
            <Space align="center" style={{ height: '100%' }}>
              <Switch
                size="small"
                checked={params.value}
                onChange={(checked) => onToggleStatus(params.data!.id, checked)}
              />
              <Tag color={params.value ? 'green' : 'red'} style={{ margin: 0 }}>
                {params.value ? 'ACTIVE' : 'DISABLED'}
              </Tag>
            </Space>
          );
        },
      },
    ],
    [onToggleStatus, token]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: 380,
        width: '100%',
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <style>{`
        .ag-theme-alpine {
          --ag-font-family: inherit;
          --ag-font-size: 13px;
          --ag-header-background-color: ${token.colorFillAlter};
          --ag-header-foreground-color: ${token.colorTextSecondary};
          --ag-border-color: ${token.colorBorderSecondary};
          --ag-row-hover-color: ${token.colorFillTertiary};
          --ag-selected-row-background-color: ${token.colorPrimaryBg};
          --ag-background-color: ${token.colorBgContainer};
          --ag-text-color: ${token.colorText};
        }
        .ag-header-cell-label {
          font-weight: 600;
        }
      `}</style>
      <AgGridReact<SubUser>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={5}
        paginationPageSizeSelector={[5, 10, 20]}
        quickFilterText={quickFilterText}
        loading={loading}
        rowHeight={48}
        headerHeight={44}
      />
    </div>
  );
}
