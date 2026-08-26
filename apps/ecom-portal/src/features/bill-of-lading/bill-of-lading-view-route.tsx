// Modified by Sekar Nagarajan (2026-08-25 00:16)
import { AppDrawer } from '@solverminds/shared-ui';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import {
  useBLCancelMutation,
  useBLChargesQuery,
  useBLDetailQuery,
  useBLPrintMutation,
  useBLVerifyMutation,
} from './api/bl.queries';
import { BillOfLadingCharges } from './components/BillOfLadingCharges';
import { BillOfLadingView } from './components/BillOfLadingView';
import { BlModuleStyles } from './components/bl-module-styles';

export function BillOfLadingViewRoute() {
  const navigate = useNavigate();
  const { blNo } = useParams({ strict: false }) as { blNo: string };
  const [chargesOpen, setChargesOpen] = useState(false);

  const { data: detail, isLoading } = useBLDetailQuery(blNo);
  const { data: charges, isLoading: chargesLoading } = useBLChargesQuery(blNo, chargesOpen);

  const { mutate: verifyBl } = useBLVerifyMutation();
  const { mutate: cancelBl } = useBLCancelMutation();
  const { mutate: printBl } = useBLPrintMutation();

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <BillOfLadingView
        detail={detail}
        loading={isLoading}
        onBack={() => navigate({ to: '/app/bl' })}
        onEdit={() => navigate({ to: `/app/bl/${blNo}/edit` })}
        onVerify={() => verifyBl(blNo)}
        onCancel={() => cancelBl(blNo)}
        onPrint={(type) => printBl({ blNo, type, appVersion: detail?.appVersion })}
        onCharges={() => setChargesOpen(true)}
      />

      <AppDrawer
        title="B/L Charge Summary"
        open={chargesOpen}
        onClose={() => setChargesOpen(false)}
        width={720}
        footer={<AppButton onClick={() => setChargesOpen(false)}>Close</AppButton>}
      >
        <BillOfLadingCharges charges={charges} loading={chargesLoading} />
      </AppDrawer>
    </FeaturePageShell>
  );
}
