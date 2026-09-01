// Modified by Sekar Nagarajan (2026-09-01 12:29)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { BLListDTO } from "../../types/bl.types";
import {
  canOpenBlWizard,
  getBLListStatusColor,
  getBLStatusLabel,
} from "../../utils/bl-status";
import { BlDetailsViewer } from "./BlDetailsViewer";

const { Title, Text } = Typography;

interface BlViewDrawerProps {
  record: BLListDTO;
  onClose: () => void;
}

export function BlViewDrawer({ record, onClose }: BlViewDrawerProps) {
  const navigate = useNavigate();
  const showEdit = canOpenBlWizard(record);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/bl/${record.blNo}/edit` });
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{ body: "bl-drawer-body custom-scroll" }}
      title={
        <div className="bl-drawer-title">
          <AppIcon icon={Icons.fileCheck} size={22} />
          <div>
            <Title level={4} className="bl-drawer-title__text">
              {formatModuleScreenTitle("View Bill of Lading", record.blNo)}
            </Title>
            <Text type="secondary" className="bl-drawer-title__meta">
              Booking: <strong>{record.bookingNo}</strong>
              {record.agencyRefNo ? (
                <>
                  {" "}
                  · Agency: <strong>{record.agencyRefNo}</strong>
                </>
              ) : null}
            </Text>
            <div className="bl-drawer-title__tags">
              <Tag className="bl-status-tag" color={getBLListStatusColor(record)}>
                {record.isLocked ? "Locked" : getBLStatusLabel(record.status)}
              </Tag>
              {record.mcnNo ? (
                <Tag color="default">MCN: {record.mcnNo}</Tag>
              ) : null}
            </div>
          </div>
        </div>
      }
      extra={
        <div className="bl-drawer-actions custom-scroll">
          {showEdit ? (
            <Tooltip title="Edit Bill of Lading">
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                onClick={handleEdit}
              >
                Edit
              </AppButton>
            </Tooltip>
          ) : null}
        </div>
      }
    >
      <div className="bl-view-route-strip">
        <div className="bl-view-route-port bl-view-route-port--origin">
          <div className="bl-view-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Origin
          </div>
          <Title level={4} className="bl-view-route-port__code">
            {record.origin}
          </Title>
        </div>

        <div className="bl-view-route-connector">
          <span className="bl-view-route-connector__label">Port to Port</span>
          <div className="bl-view-route-connector__line">
            <span className="bl-view-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="bl-view-route-connector__track" />
          </div>
          <AppIcon icon={Icons.ship} size={16} />
        </div>

        <div className="bl-view-route-port bl-view-route-port--delivery">
          <div className="bl-view-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Delivery
          </div>
          <Title level={4} className="bl-view-route-port__code">
            {record.delivery}
          </Title>
        </div>
      </div>

      <div className="bl-summary-chips">
        <div className="bl-summary-chip">
          <span>
            <span className="bl-summary-chip__label">B/L No</span>
            <span className="bl-summary-chip__value">{record.blNo}</span>
          </span>
        </div>
        <div className="bl-summary-chip">
          <span>
            <span className="bl-summary-chip__label">SI No</span>
            <span className="bl-summary-chip__value">{record.siNo || "—"}</span>
          </span>
        </div>
        <div className="bl-summary-chip">
          <span>
            <span className="bl-summary-chip__label">Created</span>
            <span className="bl-summary-chip__value">
              {record.createdDate || "—"}
            </span>
          </span>
        </div>
        <div className="bl-summary-chip">
          <span>
            <span className="bl-summary-chip__label">Confirmed</span>
            <span className="bl-summary-chip__value">
              {record.confirmedDate || "—"}
            </span>
          </span>
        </div>
      </div>

      <BlDetailsViewer
        blNo={record.blNo}
        activityHints={{
          createdDate: record.createdDate,
          confirmedDate: record.confirmedDate,
          status: record.status,
          isLocked: record.isLocked,
        }}
      />
    </AppDrawer>
  );
}
