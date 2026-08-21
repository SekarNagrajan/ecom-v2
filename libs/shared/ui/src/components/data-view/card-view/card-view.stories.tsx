/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteOutlined,
  FlagOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from 'antd';
import { useState } from 'react';

import type { DataViewColumn } from '../types';
import { CardView } from './card-view';

interface MockVessel {
  id: string;
  name: string;
  type: string;
  status: 'At Sea' | 'In Port' | 'Maintenance';
  lastUpdate: string;
  location: string;
}

const MOCK_VESSELS: MockVessel[] = Array.from({ length: 50 }, (_, i) => {
  const statuses = ['At Sea', 'In Port', 'Maintenance'] as const;
  return {
    id: String(i + 1),
    name: `Vessel ${i + 1}`,
    type: i % 2 === 0 ? 'Tanker' : 'Cargo',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    status: statuses[i % 3]!,
    lastUpdate: '2024-02-01',
    location: `Lat: ${i * 2}, Lon: ${i * 3}`,
  };
});

// Casting to any to avoid contravariance issues in Storybook generic mapping
const COLUMNS: DataViewColumn<any>[] = [
  { field: 'name', headerName: 'Vessel Name', isPrimary: true },
  { field: 'type', headerName: 'Vessel Type', isSecondary: true },
  {
    field: 'status',
    headerName: 'Status',
    render: ({ value }) => {
      const color =
        value === 'At Sea' ? 'blue' : value === 'In Port' ? 'green' : 'orange';
      return <Tag color={color}>{value as string}</Tag>;
    },
  },
  { field: 'location', headerName: 'Current Location' },
  { field: 'lastUpdate', headerName: 'Last Updated' },
];

const meta: Meta<typeof CardView> = {
  title: 'Components/DataView/CardView',
  component: CardView,
  decorators: [
    (Story) => (
      <div
        style={{
          height: '600px',
          padding: '20px',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardView>;

// =============================================================================
// BasicGrid — shows all 50 vessels with infinite scroll (default)
// =============================================================================
export const BasicGrid: Story = {
  render: () => <CardView data={MOCK_VESSELS as any[]} columnDefs={COLUMNS} />,
};

// =============================================================================
// Paginated — shows 12 per page with navigation controls
// =============================================================================

function PaginatedDemo() {
  const [page, setPage] = useState(0); // 0-indexed
  const pageSize = 12;
  const start = page * pageSize;
  const currentData = MOCK_VESSELS.slice(start, start + pageSize);

  return (
    <CardView
      data={currentData as any[]}
      columnDefs={COLUMNS}
      paginationMode="pagination"
      page={page}
      pageSize={pageSize}
      totalCount={MOCK_VESSELS.length}
      onPaginationChange={(newPage) => setPage(newPage)}
    />
  );
}

export const Paginated: Story = {
  name: 'Paginated',
  render: () => <PaginatedDemo />,
};

// =============================================================================
// InteractiveSelection — long-press / click to multi-select
// =============================================================================

function SelectionDemo() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  return (
    <CardView
      data={MOCK_VESSELS as any[]}
      columnDefs={COLUMNS}
      selection={{
        selectedKeys,
        onSelectionChange: setSelectedKeys,
      }}
      enableLongPressSelection
      footerActions={[
        {
          id: 'info',
          label: 'Details',
          icon: <InfoCircleOutlined />,
          onClick: (v) => console.log('Info', v),
        },
        {
          id: 'flag',
          label: 'Flag',
          icon: <FlagOutlined />,
          onClick: (v) => console.log('Flag', v),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          isSecondary: true,
          onClick: (v) => console.log('Delete', v),
        },
      ]}
    />
  );
}

export const InteractiveSelection: Story = {
  render: () => <SelectionDemo />,
};

// =============================================================================
// LargeDatasetVirtualization — 1000 items, virtualized
// =============================================================================

export const LargeDatasetVirtualization: Story = {
  render: () => (
    <CardView
      data={
        Array.from({ length: 1000 }, (_, i) => ({
          ...MOCK_VESSELS[0],
          id: String(i + 1),
          name: `Vessel ${i + 1}`,
        })) as any[]
      }
      columnDefs={COLUMNS}
      overscan={10}
    />
  ),
};

// =============================================================================
// LoadingState — skeleton shimmer shown when data=[] and loading=true
// =============================================================================

export const LoadingState: Story = {
  render: () => <CardView data={[]} columnDefs={COLUMNS} loading={true} />,
};

// =============================================================================
// EmptyState — empty state shown when data=[] and loading=false
// =============================================================================

export const EmptyState: Story = {
  render: () => <CardView data={[]} columnDefs={COLUMNS} loading={false} />,
};
