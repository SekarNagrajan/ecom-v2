// Modified by Sekar Nagarajan (2026-08-31 17:05)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Space } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBookingIcon } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../constants/module-titles";
import { useModuleTitles } from "../../i18n/use-module-titles";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { BookingDetailsViewer } from "./components/view/BookingDetailsViewer";
import { HaulageTrackingGrid } from "./components/view/HaulageTrackingGrid";

export function BookingViewRoute() {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const navigate = useNavigate();
  const { bookingId } = useParams({ strict: false });

  return (
    <FeaturePageShell>
      <BookingModuleStyles />
      <Space
        direction="vertical"
        size="large"
        className="feature-page-stack booking-page-stack"
      >
        <Card className="feature-page-card" bordered={false}>
          <ModuleScreenHeader
            icon={NavBookingIcon}
            title={formatModuleScreenTitle(
              MODULE_TITLES.viewBooking,
              bookingId,
            )}
            marginBottom={0}
            extra={
              <Space wrap className="custom-scroll">
                <AppButton
                  danger
                  icon={
                    <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                  }
                  onClick={() => navigate({ to: "/app/booking" })}
                >
                  {t("actions.backToBooking")}
                </AppButton>
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
                  onClick={() =>
                    navigate({ to: `/app/booking/${bookingId}/amend` })
                  }
                >
                  {MODULE_TITLES.amendBooking}
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
