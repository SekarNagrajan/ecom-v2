// Modified by Sekar Nagarajan (2026-08-25 13:10)
import { Card } from 'antd';

import { NavIcons } from '../../components/icons';
import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { ModuleScreenHeader } from '../../components/shared/module-screen-header';
import { MODULE_TITLES } from '../../constants/module-titles';
import { useCarbonComputeQuery } from './api/carbon.queries';
import { CarbonCalculatorForm } from './components/CarbonCalculatorForm';
import { CarbonResultPanel } from './components/CarbonResultPanel';
import { CarbonCalculatorModuleStyles } from './components/carbon-calculator-module-styles';
import { useCarbonCalculator } from './hooks/use-carbon-calculator';

export function CarbonCalculatorRoute() {
  const { form, activeInput, handleCalculate, handleReset } = useCarbonCalculator();
  const { isFetching, isLoading } = useCarbonComputeQuery(activeInput);
  const calculating = Boolean(activeInput) && (isLoading || isFetching);

  return (
    <FeaturePageShell>
      <CarbonCalculatorModuleStyles />
      <Card className="feature-page-card co2-page-card" bordered={false}>
        <div className="co2-page-layout">
          <div className="co2-page-header">
            <ModuleScreenHeader
              icon={NavIcons.carbon}
              title={MODULE_TITLES.carbonCalculator}
              subtitle="Estimate shipment CO₂e from trade lane and cargo parameters."
              marginBottom={0}
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
                Choose origin, destination, and cargo details, then select Calculate.
              </div>
            )}
          </div>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
