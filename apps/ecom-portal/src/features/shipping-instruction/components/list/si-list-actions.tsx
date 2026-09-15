// Modified by Sekar Nagarajan (2026-09-15 11:45)
import { useConfirm } from "@solverminds/shared-ui/hooks";
import type { MouseEvent } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import type { SIListDTO } from "../../types/si.types";

export interface SiListActionsProps {
  record: SIListDTO;
  onOpenWizard: (id: string) => void;
  onView: (record: SIListDTO) => void;
  onCancel: (record: SIListDTO) => void;
}

/**
 * Status-driven SI row/card actions — shared by list cell and card footer.
 */
export function SiListActions({
  record,
  onOpenWizard,
  onView,
  onCancel,
}: SiListActionsProps) {
  const confirm = useConfirm();

  const stop =
    (fn: () => void) => (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      fn();
    };

  return (
    <ListActionsRow>
      {record.status === "Accepted" ? (
        <ListActionButton
          title="Locked"
          icon={<AppIcon icon={Icons.lock} size={16} tone="muted" />}
          danger
          onClick={stop(() => undefined)}
        />
      ) : null}

      {record.status === "Create SI" ? (
        <ListActionButton
          title="Create SI"
          icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
          onClick={stop(() => onOpenWizard(record.id))}
        />
      ) : null}

      {record.status === "Draft" ? (
        <ListActionButton
          title="Edit Draft"
          icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
          onClick={stop(() => onOpenWizard(record.id))}
        />
      ) : null}

      {["Submitted", "Accepted", "Declined"].includes(record.status) ? (
        <ListActionButton
          title="View Details"
          icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
          onClick={stop(() => onView(record))}
        />
      ) : null}

      {record.status === "Submitted" ? (
        <ListActionButton
          title="Edit SI"
          icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
          onClick={stop(() => onOpenWizard(record.id))}
        />
      ) : null}

      {record.status === "Declined" || record.blStatus === "Cancelled" ? (
        <ListActionButton
          title="Resubmit"
          icon={<AppIcon icon={Icons.refreshCw} size={16} tone="history" />}
          onClick={stop(() => {
            if (record.status === "Declined") {
              confirm.warning({
                title: "Carrier Remarks",
                content:
                  "Please review and correct the reported discrepancies before resubmitting.",
                onOk: () => onOpenWizard(record.id),
              });
              return;
            }
            onOpenWizard(record.id);
          })}
        />
      ) : null}

      {record.status === "Submitted" ? (
        <ListActionButton
          title="Cancel SI"
          icon={<AppIcon icon={Icons.circleX} size={16} tone="reject" />}
          danger
          onClick={stop(() => onCancel(record))}
        />
      ) : null}
    </ListActionsRow>
  );
}
