// Modified by Sekar Nagarajan (2026-09-01 01:02) — status-driven actions + More overflow menu
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import type { MenuProps } from "antd";
import { Dropdown, Space, Tooltip } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { checkVoyageClosed } from "../api/bl.api";
import type { BLListDTO, BLPrintType } from "../types/bl.types";

const BL_EDIT_TERMS =
  "By editing a confirmed B/L you agree to carrier amendment terms and conditions.";

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
  enableTermsOnConfirmedEdit?: boolean;
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
  enableTermsOnConfirmedEdit = true,
}: BillOfLadingRowActionsProps) {
  const confirm = useConfirm();
  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingEditBlNo, setPendingEditBlNo] = useState<string | null>(null);

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
          title: "Voyage Closed",
          content: "This voyage is closed. B/L edit is not permitted.",
        });
        return;
      }
    } catch {
      // Guard is best-effort; still allow edit if the check fails.
    }
    onEdit(row.blNo);
  };

  const requestEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (row.status === "C" && enableTermsOnConfirmedEdit) {
      setPendingEditBlNo(row.blNo);
      setTermsOpen(true);
      return;
    }
    void handleEdit(e);
  };

  const handleOriginalPrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirm.info({
      title: "Print Original B/L",
      content:
        "Confirm printing the original Bill of Lading? This action may be restricted after issue.",
      onOk: () => onPrint(row.blNo, "original"),
    });
  };

  const actions: React.ReactNode[] = [];

  // View — always available
  actions.push(
    <ListActionButton
      key="view"
      title="View"
      tone="view"
      icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
      onClick={(e) => {
        e.stopPropagation();
        onView(row.blNo);
      }}
    />,
  );

  // Edit / Amendment — confirmed edits route through the terms modal
  actions.push(
    <ListActionButton
      key="edit"
      title={row.status === "S" ? "Amendment" : "Edit"}
      tone="edit"
      icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
      onClick={requestEdit}
    />,
  );

  // Ready to Confirm — draft only
  if (row.status === "D") {
    actions.push(
      <ListActionButton
        key="confirm"
        title={showReadyToConfirm ? "Ready to Confirm" : "Accept"}
        tone="track"
        icon={<AppIcon icon={Icons.checkCircle} size={16} tone="track" />}
        onClick={(e) => {
          e.stopPropagation();
          onVerify(row.blNo);
        }}
      />,
    );
  }

  // Print — status driven: Confirmed prints Original, everything else Draft
  if (row.status === "C") {
    actions.push(
      <ListActionButton
        key="print"
        title="Original Print"
        tone="print"
        icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
        onClick={handleOriginalPrint}
      />,
    );
  } else {
    actions.push(
      <ListActionButton
        key="print"
        title="Draft Print"
        tone="print"
        icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
        onClick={(e) => {
          e.stopPropagation();
          onPrint(row.blNo, "draft");
        }}
      />,
    );
  }

  // Overflow "More" menu — Manifest, Charge Summary, NN print, Cancel
  const moreItems: MenuProps["items"] = [];
  if (row.status !== "S") {
    moreItems.push({
      key: "manifest",
      label: "Manifest",
      icon: <AppIcon icon={Icons.fileCheck} size={16} tone="navigate" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onManifest(row.blNo, row.mcnNo);
      },
    });
  }
  if (showChargeSummary) {
    moreItems.push({
      key: "charges",
      label: "Charge Summary",
      icon: <AppIcon icon={Icons.list} size={16} tone="navigate" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onCharges(row.blNo);
      },
    });
  }
  if (showNnPrint && (row.status === "C" || row.status === "I")) {
    moreItems.push({
      key: "nn-print",
      label: "Non Negotiable",
      icon: <AppIcon icon={Icons.fileText} size={16} tone="print" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onPrint(row.blNo, "nn");
      },
    });
  }
  if (row.status === "S") {
    moreItems.push({
      key: "cancel",
      danger: true,
      label: "Cancel",
      icon: <AppIcon icon={Icons.circleX} size={16} tone="reject" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        confirm.danger({
          title: "Cancel Submitted B/L",
          content: "Are you sure you want to cancel this submitted B/L?",
          onOk: () => onCancel(row.blNo),
        });
      },
    });
  }

  return (
    <>
      <Space size={4} wrap>
        {actions}
        {moreItems.length ? (
          <Dropdown
            menu={{ items: moreItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <span onClick={(e) => e.stopPropagation()}>
              <Tooltip title="More" mouseEnterDelay={0.5}>
                <AppButton
                  type="link"
                  size="small"
                  className="list-action-button"
                  aria-label="More actions"
                  icon={
                    <AppIcon
                      icon={Icons.ellipsisVertical}
                      size={16}
                      gridAction
                      tone="navigate"
                    />
                  }
                />
              </Tooltip>
            </span>
          </Dropdown>
        ) : null}
      </Space>
      <AppModal
        title="Confirmed B/L Edit — Terms"
        open={termsOpen}
        onCancel={() => {
          setTermsOpen(false);
          setPendingEditBlNo(null);
        }}
        footer={
          <>
            <AppButton
              onClick={() => {
                setTermsOpen(false);
                setPendingEditBlNo(null);
              }}
            >
              Decline
            </AppButton>
            <AppButton
              type="primary"
              onClick={async () => {
                if (!pendingEditBlNo) return;
                try {
                  const { closed } = await checkVoyageClosed(pendingEditBlNo);
                  if (closed) {
                    confirm.warning({
                      title: "Voyage Closed",
                      content:
                        "This voyage is closed. B/L edit is not permitted.",
                    });
                    return;
                  }
                } catch {
                  // best-effort
                }
                onEdit(pendingEditBlNo);
                setTermsOpen(false);
                setPendingEditBlNo(null);
              }}
            >
              I Agree
            </AppButton>
          </>
        }
      >
        <p>{BL_EDIT_TERMS}</p>
      </AppModal>
    </>
  );
}
