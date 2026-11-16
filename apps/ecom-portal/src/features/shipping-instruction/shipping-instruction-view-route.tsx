// Modified by Sekar Nagarajan (2026-11-16 15:30) — route band lives in SiDetailsViewer
import { AppButton } from "@solverminds/shared-ui";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavShippingInstructionIcon } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../constants/module-titles";
import { useModuleTitles } from "../../i18n/use-module-titles";
import { siListQueryOptions } from "./api/si.queries";
import { SiLoadingCenter } from "./components/si-loading-center";
import { SiModuleStyles } from "./components/si-module-styles";
import { SiDetailsViewer } from "./components/view/SiDetailsViewer";

export function ShippingInstructionViewRoute() {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
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
          title={t("empty.notFound")}
          extra={
            <AppButton
              danger
              icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
              onClick={goDashboard}
            >
              {t("actions.backToSi")}
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
            icon={NavShippingInstructionIcon}
            title={formatModuleScreenTitle(MODULE_TITLES.shippingInstruction, listRow?.siNo || id)}
            marginBottom={0}
            extra={
              <AppButton
                danger
                icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
                onClick={goDashboard}
              >
                {t("actions.backToSi")}
              </AppButton>
            }
          />
        </Card>

        <SiDetailsViewer siId={id} />
      </Space>
    </FeaturePageShell>
  );
}
