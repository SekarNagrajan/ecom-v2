// Modified by Sekar Nagarajan (2026-10-27 13:10)
import { AppButton } from "@solverminds/shared-ui";
import { Card } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavIcons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useModuleTitles } from "../../i18n/use-module-titles";
import {
  useCarbonComputeQuery,
  useCarbonExportMutation,
} from "./api/carbon.queries";
import { CarbonCalculatorForm } from "./components/CarbonCalculatorForm";
import { CarbonResultPanel } from "./components/CarbonResultPanel";
import { CarbonCalculatorModuleStyles } from "./components/carbon-calculator-module-styles";
import { useCarbonCalculator } from "./hooks/use-carbon-calculator";

export function CarbonCalculatorRoute() {
  const { t } = useTranslation(["carbon-calculator", "common"]);
  const moduleTitles = useModuleTitles();
  const { form, activeInput, handleCalculate, handleReset } =
    useCarbonCalculator();
  const { isFetching, isLoading, data: result } =
    useCarbonComputeQuery(activeInput);
  const exportMutation = useCarbonExportMutation();
  const calculating = Boolean(activeInput) && (isLoading || isFetching);
  const canExport = Boolean(activeInput && result);

  return (
    <FeaturePageShell>
      <CarbonCalculatorModuleStyles />
      <Card className="feature-page-card co2-page-card" bordered={false}>
        <div className="co2-page-layout">
          <div className="co2-page-header">
            <ModuleScreenHeader
              icon={NavIcons.carbon}
              title={moduleTitles.carbonCalculator}
              subtitle={t("subtitle")}
              marginBottom={0}
              extra={
                <AppButton
                  type="default"
                  size="medium"
                  disabled={!canExport}
                  loading={exportMutation.isPending}
                  icon={
                    <AppIcon icon={Icons.download} size={16} tone="download" />
                  }
                  onClick={() => {
                    if (!activeInput) return;
                    exportMutation.mutate(activeInput);
                  }}
                >
                  {t("actions.exportPdf")}
                </AppButton>
              }
            />
          </div>

          <CarbonCalculatorForm
            form={form}
            onCalculate={handleCalculate}
            onReset={handleReset}
            calculating={calculating}
          />

          <div className="co2-result-wrap custom-scroll">
            {activeInput ? (
              <CarbonResultPanel input={activeInput} />
            ) : (
              <div className="co2-result-idle">
                <ModuleEmptyState
                  artSize="sm"
                  variant="blank"
                  title={t("empty.noEstimateTitle")}
                  message={t("empty.noEstimateMessage")}
                  className="co2-result-empty"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
