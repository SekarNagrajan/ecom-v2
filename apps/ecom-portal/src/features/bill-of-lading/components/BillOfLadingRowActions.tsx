// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBillOfLadingIcon } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { checkVoyageClosed } from "../api/bl.api";
import type { BLListDTO, BLPrintType } from "../types/bl.types";

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
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const confirm = useConfirm();
  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingEditBlNo, setPendingEditBlNo] = useState<string | null>(null);

  if (row.isLocked) {
    return (
      <ListActionsRow>
        <ListActionButton
          title={t("actions.locked")}
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
          title: t("confirms.voyageClosedTitle"),
          content: t("confirms.voyageClosedContent"),
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
      title: t("confirms.printOriginalTitle"),
      content: t("confirms.printOriginalContent"),
      onOk: () => onPrint(row.blNo, "original"),
    });
  };

  const actions: React.ReactNode[] = [];

  actions.push(
    <ListActionButton
      key="view"
      title={t("actions.view")}
      tone="view"
      icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
      onClick={(e) => {
        e.stopPropagation();
        onView(row.blNo);
      }}
    />,
  );

  actions.push(
    <ListActionButton
      key="edit"
      title={row.status === "S" ? t("actions.amendment") : t("actions.edit")}
      tone="edit"
      icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
      onClick={requestEdit}
    />,
  );

  if (row.status === "D") {
    actions.push(
      <ListActionButton
        key="confirm"
        title={
          showReadyToConfirm ? t("actions.readyToConfirm") : t("actions.accept")
        }
        tone="track"
        icon={<AppIcon icon={Icons.checkCircle} size={16} tone="track" />}
        onClick={(e) => {
          e.stopPropagation();
          onVerify(row.blNo);
        }}
      />,
    );
  }

  if (row.status === "C") {
    actions.push(
      <ListActionButton
        key="print"
        title={t("actions.originalPrint")}
        tone="print"
        icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
        onClick={handleOriginalPrint}
      />,
    );
  } else {
    actions.push(
      <ListActionButton
        key="print"
        title={t("actions.draftPrint")}
        tone="print"
        icon={<AppIcon icon={Icons.fileText} size={16} tone="print" />}
        onClick={(e) => {
          e.stopPropagation();
          onPrint(row.blNo, "draft");
        }}
      />,
    );
  }

  const moreItems: MenuProps["items"] = [];
  if (row.status !== "S") {
    moreItems.push({
      key: "manifest",
      label: t("actions.manifest"),
      icon: <AppIcon icon={NavBillOfLadingIcon} size={16} tone="navigate" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onManifest(row.blNo, row.mcnNo);
      },
    });
  }
  if (showChargeSummary) {
    moreItems.push({
      key: "charges",
      label: t("actions.chargeSummary"),
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
      label: t("actions.nonNegotiable"),
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
      label: t("actions.cancel"),
      icon: <AppIcon icon={Icons.circleX} size={16} tone="reject" />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        confirm.danger({
          title: t("confirms.cancelSubmittedTitle"),
          content: t("confirms.cancelSubmittedContent"),
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
            {/* More overflow menu trigger intentionally commented out */}
          </Dropdown>
        ) : null}
      </Space>
      <AppModal
        title={t("confirms.editTermsTitle")}
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
              {t("actions.decline")}
            </AppButton>
            <AppButton
              type="primary"
              onClick={async () => {
                if (!pendingEditBlNo) return;
                try {
                  const { closed } = await checkVoyageClosed(pendingEditBlNo);
                  if (closed) {
                    confirm.warning({
                      title: t("confirms.voyageClosedTitle"),
                      content: t("confirms.voyageClosedContent"),
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
              {t("actions.iAgree")}
            </AppButton>
          </>
        }
      >
        <p>{t("confirms.editTermsBody")}</p>
      </AppModal>
    </>
  );
}
