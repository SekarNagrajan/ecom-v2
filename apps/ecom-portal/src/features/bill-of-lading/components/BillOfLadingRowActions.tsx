// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton } from '@solverminds/shared-ui';
import { useConfirm } from '@solverminds/shared-ui/hooks';
import { Space, Tooltip } from 'antd';

import { AppIcon, Icons } from '../../../components/icons';
import { ListActionButton, ListActionsRow } from '../../../components/shared/list-action-button';
import { checkVoyageClosed } from '../api/bl.api';
import type { BLListDTO, BLPrintType } from '../types/bl.types';

export interface BillOfLadingRowActionsProps {
  row: BLListDTO;
  onView: (blNo: string) => void;
  onEdit: (blNo: string) => void;
  onPrint: (blNo: string, type: BLPrintType) => void;
  onVerify: (blNo: string) => void;
  onCancel: (blNo: string) => void;
  onCharges: (blNo: string) => void;
  onManifest: (blNo: string, mcnNo: string | null) => void;
  showChargeSummary?: boolean;
  showNnPrint?: boolean;
  showReadyToConfirm?: boolean;
}

export function BillOfLadingRowActions({
  row,
  onView,
  onEdit,
  onPrint,
  onVerify,
  onCancel,
  onCharges,
  onManifest,
  showChargeSummary = true,
  showNnPrint = true,
  showReadyToConfirm = false,
}: BillOfLadingRowActionsProps) {
  const confirm = useConfirm();

  if (row.isLocked) {
    return (
      <ListActionsRow>
        <ListActionButton
          title="Locked"
          icon={<AppIcon icon={Icons.lock} size={16} tone="muted" />}
          danger
          onClick={(e) => e.stopPropagation()}
        />
      </ListActionsRow>
    );
  }

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { closed } = await checkVoyageClosed(row.blNo);
      if (closed) {
        confirm.warning({
          title: 'Voyage Closed',
          content: 'This voyage is closed. B/L edit is not permitted.',
        });
        return;
      }
    } catch {
      // Guard is best-effort; still allow edit if the check fails.
    }
    onEdit(row.blNo);
  };

  const handleOriginalPrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirm.info({
      title: 'Print Original B/L',
      content: 'Confirm printing the original Bill of Lading? This action may be restricted after issue.',
      onOk: () => onPrint(row.blNo, 'original'),
    });
  };

  const actions: React.ReactNode[] = [];

  if (row.status === 'D') {
    actions.push(
      <ListActionButton
        tone="print"
        key="draft-print"
        title="Draft Print"
        icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
        onClick={(e) => {
          e.stopPropagation();
          onPrint(row.blNo, 'draft');
        }}
      />
    );
    actions.push(
      <ListActionButton
        key="edit"
        title="Edit"
        icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
        onClick={handleEdit}
      />
    );
    actions.push(
      <ListActionButton
        key="accept"
        title={showReadyToConfirm ? 'Ready to Confirm' : 'Accept'}
        icon={<AppIcon icon={Icons.checkCircle} size={16} tone="approve" />}
        onClick={(e) => {
          e.stopPropagation();
          onVerify(row.blNo);
        }}
      />
    );
  }

  if (row.status === 'S') {
    actions.push(
      <ListActionButton
        key="view"
        title="View"
        icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
        onClick={(e) => {
          e.stopPropagation();
          onView(row.blNo);
        }}
      />
    );
    actions.push(
      <ListActionButton
        key="amend"
        title="Amendment"
        icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
        onClick={handleEdit}
      />
    );
    actions.push(
      <ListActionButton
        key="cancel"
        title="Cancel"
        icon={<AppIcon icon={Icons.circleX} size={16} tone="reject" />}
        danger
        onClick={(e) => {
          e.stopPropagation();
          confirm.danger({
            title: 'Cancel Submitted B/L',
            content: 'Are you sure you want to cancel this submitted B/L?',
            onOk: () => onCancel(row.blNo),
          });
        }}
      />
    );
  }

  if (row.status === 'C') {
    actions.push(
      <ListActionButton
        tone="print"
        key="draft-print"
        title="Draft Print"
        icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
        onClick={(e) => {
          e.stopPropagation();
          onPrint(row.blNo, 'draft');
        }}
      />
    );
    actions.push(
      <ListActionButton
        key="edit"
        title="Edit"
        icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
        onClick={handleEdit}
      />
    );
    if (showNnPrint) {
      actions.push(
        <ListActionButton
        tone="print"
          key="nn-print"
          title="Non Negotiable"
          icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
          onClick={(e) => {
            e.stopPropagation();
            onPrint(row.blNo, 'nn');
          }}
        />
      );
    }
    if (row.printStatus === 'Y') {
      actions.push(
        <Tooltip key="original-print" title="Original">
          <AppButton
            type="text"
            size="small"
            icon={<AppIcon icon={Icons.printer} size={16} gridAction tone="print" />}
            onClick={handleOriginalPrint}
          />
        </Tooltip>
      );
    }
  }

  if (row.status === 'I') {
    actions.push(
      <ListActionButton
        tone="print"
        key="nn-issued"
        title="Non Negotiable"
        icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
        onClick={(e) => {
          e.stopPropagation();
          onPrint(row.blNo, 'nn');
        }}
      />
    );
    actions.push(
      <ListActionButton
        key="issued-lock"
        title="Issued"
        icon={<AppIcon icon={Icons.lock} size={16} tone="muted" />}
        onClick={(e) => e.stopPropagation()}
      />
    );
    if (row.hasInsurance && row.policyNo) {
      actions.push(
        <ListActionButton
          key="insurance"
          title={row.policyNo}
          icon={<AppIcon icon={Icons.shieldCheck} size={16} tone="view" />}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
  }

  if (showChargeSummary) {
    actions.push(
      <ListActionButton
         tone="navigate"
        key="charges"
        title="Charge Summary"
        icon={<AppIcon icon={Icons.list} size={16} tone="navigate" />}
        onClick={(e) => {
          e.stopPropagation();
          onCharges(row.blNo);
        }}
      />
    );
  }

  if (row.status !== 'S') {
    actions.push(
      <ListActionButton
         tone="navigate"
        key="manifest"
        title="Manifest"
        icon={<AppIcon icon={Icons.fileCheck} size={16} tone="navigate" />}
        onClick={(e) => {
          e.stopPropagation();
          onManifest(row.blNo, row.mcnNo);
        }}
      />
    );
  }

  return (
    <Space size={4} wrap>
      {actions}
    </Space>
  );
}
