// Modified by Sekar Nagarajan (2026-08-26 11:20)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Space } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { BookingDetailsViewer } from "./components/view/BookingDetailsViewer";
import { HaulageTrackingGrid } from "./components/view/HaulageTrackingGrid";

export function BookingViewRoute() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ strict: false });

  return (
    <FeaturePageShell>
      <BookingModuleStyles />
      <Space direction="vertical" size="large" className="feature-page-stack">
        <Card className="feature-page-card" bordered={false}>
          <ModuleScreenHeader
            icon={Icons.bookOpen}
            title={formatModuleScreenTitle(
              MODULE_TITLES.viewBooking,
              bookingId,
            )}
            marginBottom={0}
            extra={
              <Space wrap className="custom-scroll">
                <AppButton onClick={() => navigate({ to: "/app/booking" })}>
                  Back to Dashboard
                </AppButton>
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
                  onClick={() =>
                    navigate({ to: `/app/booking/${bookingId}/amend` })
                  }
                >
                  Amend Booking
                </AppButton>
              </Space>
            }
          />
        </Card>

        <BookingDetailsViewer bookingId={bookingId} />
        <HaulageTrackingGrid bookingId={bookingId} />
      </Space>
    </FeaturePageShell>
  );
}
