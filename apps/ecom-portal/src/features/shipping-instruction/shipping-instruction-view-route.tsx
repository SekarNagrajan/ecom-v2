// Modified by Sekar Nagarajan (2026-08-26 12:38)
import { AppButton } from "@solverminds/shared-ui";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { siListQueryOptions } from "./api/si.queries";
import { SiLoadingCenter } from "./components/si-loading-center";
import { SiModuleStyles } from "./components/si-module-styles";
import { SiDetailsViewer } from "./components/view/SiDetailsViewer";

export function ShippingInstructionViewRoute() {
  const navigate = useNavigate();
  const { siId } = useParams({ strict: false });
  const id = siId as string;

  const { data: list = [], isLoading } = useQuery(siListQueryOptions());
  const listRow = list.find((row) => row.id === id);

  const goDashboard = () => {
    navigate({ to: "/app/shipping-instruction" });
  };

  if (isLoading) {
    return (
      <FeaturePageShell>
        <SiModuleStyles />
        <SiLoadingCenter fill />
      </FeaturePageShell>
    );
  }

  if (!id) {
    return (
      <FeaturePageShell>
        <SiModuleStyles />
        <Result
          status="404"
          title="Shipping Instruction not found"
          extra={
            <AppButton
              danger
              icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
              onClick={goDashboard}
            >
              Back to SI
            </AppButton>
          }
        />
      </FeaturePageShell>
    );
  }

  return (
    <FeaturePageShell>
      <SiModuleStyles />
      <Space direction="vertical" size="large" className="feature-page-stack">
        <Card className="feature-page-card" bordered={false}>
          <ModuleScreenHeader
            icon={Icons.clipboardList}
            title={formatModuleScreenTitle(
              MODULE_TITLES.shippingInstruction,
              listRow?.siNo || id,
            )}
            marginBottom={0}
            extra={
              <AppButton
                danger
                icon={
                  <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                }
                onClick={goDashboard}
              >
                Back to SI
              </AppButton>
            }
          />
        </Card>

        {listRow ? (
          <div className="si-route-strip">
            <div className="si-route-port si-route-port--origin">
              <div className="si-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} />
                Origin
              </div>
              <div className="si-route-port__code form-step-readonly-value">
                {listRow.origin}
              </div>
            </div>
            <div className="si-route-connector">
              <span className="si-route-connector__label">Port to Port</span>
              <div className="si-route-connector__line">
                <span className="si-route-connector__track" />
                <AppIcon icon={Icons.arrowRight} size={14} />
                <span className="si-route-connector__track" />
              </div>
            </div>
            <div className="si-route-port si-route-port--delivery">
              <div className="si-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} />
                Delivery
              </div>
              <div className="si-route-port__code form-step-readonly-value">
                {listRow.delivery}
              </div>
            </div>
          </div>
        ) : null}

        <SiDetailsViewer siId={id} />
      </Space>
    </FeaturePageShell>
  );
}
