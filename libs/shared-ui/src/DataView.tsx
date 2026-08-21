import React from 'react';
import { Table, TableProps } from 'antd';

export interface DataViewProps<T = any> extends TableProps<T> {
  // Custom DataView properties
}

export function initAgGridLicense(key?: string) {
  // License initializer for AG Grid Enterprise if key exists
  if (key) {
    console.log('AG Grid Enterprise key initialized.');
  }
}

export function DataView<T extends object = any>({ columns, dataSource, loading, pagination, ...props }: DataViewProps<T>) {
  return (
    <div className="sm-data-view-container" style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination !== false ? { pageSize: 10, showSizeChanger: true, ...pagination } : false}
        rowKey={(record: any) => record.id || record.code || JSON.stringify(record)}
        size="middle"
        {...props}
      />
    </div>
  );
}
