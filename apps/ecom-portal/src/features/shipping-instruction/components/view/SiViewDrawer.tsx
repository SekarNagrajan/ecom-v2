// Created by Sekar Nagarajan (2026-08-26 12:19)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { SIListDTO } from "../../types/si.types";
import { canOpenSiWizard, getSiStatusTagColor } from "../../utils/si-status";
import { SiDetailsViewer } from "./SiDetailsViewer";

const { Title, Text } = Typography;

interface SiViewDrawerProps {
  record: SIListDTO;
  onClose: () => void;
}

export function SiViewDrawer({ record, onClose }: SiViewDrawerProps) {
  const navigate = useNavigate();
  const showEdit = canOpenSiWizard(record.status);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/shipping-instruction/wizard/${record.id}` });
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{ body: "si-drawer-body custom-scroll" }}
      title={
        <div className="si-drawer-title">
          <AppIcon icon={Icons.clipboardList} size={22} />
          <div>
            <Title level={4} className="si-drawer-title__text">
              {formatModuleScreenTitle(
                "View Shipping Instruction",
                record.siNo || record.bookingNo,
              )}
            </Title>
            <Text type="secondary" className="si-drawer-title__meta">
              Booking: <strong>{record.bookingNo}</strong>
              {record.agencyRefNo ? (
                <>
                  {" "}
                  · Agency: <strong>{record.agencyRefNo}</strong>
                </>
              ) : null}
            </Text>
            <div className="si-drawer-title__tags">
              <Tag color={getSiStatusTagColor(record.status)}>
                {record.status}
              </Tag>
              {record.blStatus ? (
                <Tag color="default">B/L: {record.blStatus}</Tag>
              ) : null}
            </div>
          </div>
        </div>
      }
      extra={
        showEdit ? (
          <div className="si-drawer-actions custom-scroll">
            <Tooltip title="Edit Shipping Instruction">
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                onClick={handleEdit}
              >
                Edit SI
              </AppButton>
            </Tooltip>
          </div>
        ) : null
      }
    >
      <div className="si-route-strip">
        <div className="si-route-port si-route-port--origin">
          <div className="si-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Origin
          </div>
          <Title level={4} className="si-route-port__code">
            {record.origin}
          </Title>
        </div>

        <div className="si-route-connector">
          <span className="si-route-connector__label">Port to Port</span>
          <div className="si-route-connector__line">
            <span className="si-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="si-route-connector__track" />
          </div>
          <AppIcon icon={Icons.ship} size={16} />
        </div>

        <div className="si-route-port si-route-port--delivery">
          <div className="si-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Delivery
          </div>
          <Title level={4} className="si-route-port__code">
            {record.delivery}
          </Title>
        </div>
      </div>

      <div className="si-summary-chips">
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">SI No</span>
            <span className="si-summary-chip__value">
              {record.siNo || "—"}
            </span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">B/L No</span>
            <span className="si-summary-chip__value">
              {record.blNo || "—"}
            </span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">Created</span>
            <span className="si-summary-chip__value">
              {record.createdDate || "—"}
            </span>
          </span>
        </div>
        <div className="si-summary-chip">
          <span>
            <span className="si-summary-chip__label">Submitted</span>
            <span className="si-summary-chip__value">
              {record.submittedDate || "—"}
            </span>
          </span>
        </div>
      </div>

      <SiDetailsViewer siId={record.id} />
    </AppDrawer>
  );
}
