// Modified by Sekar Nagarajan (2026-08-25 11:25)
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Card, Space, Tag, Typography } from 'antd';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { AppIcon, Icons, NavIcons } from '../../components/icons';
import { buildActionsColumn } from '../../components/shared/build-actions-column';
import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { ModuleScreenHeader } from '../../components/shared/module-screen-header';
import { useMCNListQuery, useMCNPrintMutation } from './api/bl.queries';
import { BlModuleStyles } from './components/bl-module-styles';
import { ManifestDrawer } from './components/ManifestDrawer';
import type { MCNListDTO } from './types/bl.types';

const { Text } = Typography;

export function BillOfLadingMcnListRoute() {
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useMCNListQuery();
  const { mutate: printMcn } = useMCNPrintMutation();
  const [manifestMcnId, setManifestMcnId] = useState<string | null>(null);

  const columns: DataViewColumn<MCNListDTO>[] = [
    buildActionsColumn<MCNListDTO>({
      field: 'mcnId',
      width: 120,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <Space size={4}>
            <AppButton
              type="text"
              size="small"
              icon={<AppIcon icon={Icons.eye} size={16} gridAction tone="view" />}
              onClick={() => setManifestMcnId(params.data!.mcnId)}
            />
            <AppButton
              type="text"
              size="small"
              icon={<AppIcon icon={Icons.printer} size={16} gridAction tone="print" />}
              onClick={() => printMcn({ mcnId: params.data!.mcnId })}
            />
          </Space>
        );
      },
    }),
    { field: 'mcnId', headerName: 'MCN No', width: 140, pinned: 'left' },
    { field: 'blNo', headerName: 'B/L No', width: 140 },
    { field: 'bookingNo', headerName: 'Booking No', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (p: { value?: string }) => <Tag>{p.value}</Tag>,
    },
    { field: 'origin', headerName: 'Origin', width: 180 },
    { field: 'delivery', headerName: 'Delivery', width: 180 },
  ];

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <div className="bl-page-layout">
          <div className="bl-page-header">
            <ModuleScreenHeader
              icon={NavIcons.billOfLading}
              title="Manifest (MCN)"
              subtitle="Manifest cargo notification — view and print from the side drawer."
              marginBottom={0}
              extra={<AppButton onClick={() => navigate({ to: '/app/bl' })}>Back to B/L</AppButton>}
            />
          </div>
          <div className="bl-toolbar">
            <Text type="secondary">{rows.length} Manifest(s)</Text>
          </div>
          <div className="bl-grid-wrap responsive-table-wrap">
            <DataView rowData={rows} loading={isLoading} columnDefs={columns} />
          </div>
        </div>
      </Card>

      <ManifestDrawer
        open={Boolean(manifestMcnId)}
        mcnId={manifestMcnId}
        onClose={() => setManifestMcnId(null)}
      />
    </FeaturePageShell>
  );
}

export function BillOfLadingMcnViewRoute() {
  const navigate = useNavigate();
  const { mcnId } = useParams({ strict: false }) as { mcnId: string };

  return (
    <>
      <BlModuleStyles />
      <ManifestDrawer
        open
        mcnId={mcnId}
        onClose={() => navigate({ to: '/app/bl/mcn' })}
      />
    </>
  );
}
